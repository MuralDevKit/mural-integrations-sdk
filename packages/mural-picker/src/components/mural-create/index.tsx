import { Box, CircularProgress, TextField } from '@material-ui/core';
import { EventHandler } from '@muraldevkit/mural-integrations-common';
import {
  ApiClient,
  Mural,
  Room,
  Template,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import cx from 'classnames';
import * as React from 'react';
import { MURAL_PICKER_ERRORS } from '../../common/errors';
import { getCommonTrackingProperties } from '../../common/tracking-properties';
import { CardSize } from '../card-list-item';
// import { ActionItemSource } from '../card-list-item/action';
import { CardListSection } from '../card-list/card-list-section';
import { PrimaryButton } from '../common';
import { ErrorHandler } from '../types';

import './styles.scss';

declare module '@material-ui/core/Box' {
  interface BoxProps {
    ref?: React.Ref<unknown>;
  }
}

export type PropTypes = {
  apiClient: ApiClient;
  room: Room;
  workspace: Workspace;

  onCreate: EventHandler<[mural: Mural, room: Room, workspace: Workspace]>;
  onError: ErrorHandler;

  cardSize?: CardSize;
  templates: Template[];
  // fetchTemplates: () => void;
};

interface StateTypes {
  btnLoading: boolean;
  nextToken: string | null;
  scrollHeight: number;
  selected: number;
  title: string;
}

const INITIAL_STATE: StateTypes = {
  btnLoading: false,
  nextToken: null,
  scrollHeight: 620,
  selected: 0,
  title: '',
};

export default class MuralCreate extends React.Component<
  PropTypes,
  StateTypes
> {
  state: StateTypes = INITIAL_STATE;

  constructor(props: PropTypes) {
    super(props);
  }

  createMural = () => {
    let { title } = this.state;
    const { room, workspace } = this.props;
    const template = this.props.templates[this.state.selected];

    title = title || 'Untitled mural';

    this.setState({ btnLoading: true }, async () => {
      let eMural;
      try {
        if (this.state.selected === 0) {
          eMural = await this.props.apiClient.createMural({
            title,
            workspaceId: workspace.id,
            roomId: room.id,
          });
        } else {
          eMural = await this.props.apiClient.createMuralFromTemplate({
            title,
            roomId: room.id,
            templateId: template.id,
          });
        }
        this.props.onCreate(eMural.value, room, workspace);
        this.props.apiClient.track('Created mural from picker', {
          ...getCommonTrackingProperties(),
          clientAppId: this.props.apiClient.config.appId,
          template: template.name,
        });
      } catch (exception: any) {
        let errorStr = MURAL_PICKER_ERRORS.ERR_CREATE_MURAL;
        if (exception && exception.response.status === 403) {
          errorStr = MURAL_PICKER_ERRORS.ERR_CREATE_MURAL_PERMISSION;
        }
        this.props.onError(exception, errorStr);
        this.setState({
          btnLoading: false,
        });
      }
    });
  };

  onSelectTemplate = (index: number) => {
    this.setState({
      selected: index,
      title: this.state.title ?? this.props.templates[index].name,
    });
  };

  // for pagination
  // handleAction = (name: string) => {
  //   switch (name) {
  //     case 'load-more':
  //       return this.props.fetchTemplates();
  //   }
  // };
  // const actions: ActionItemSource[] = [];
  // if (this.state.nextToken) {
  //   actions.push({ content: 'Load more…', name: 'load-more', sort: 'end' });
  // }

  renderTemplateCardItems = () => {
    const templateCardItems = this.props.templates.map(template => ({
      title: template.name,
      thumbnailUrl: template.thumbUrl,
    }));

    return (
      <div className="mural-selector-container">
        <div className="mural-selector-grid">
          <CardListSection
            items={templateCardItems}
            onSelect={this.onSelectTemplate}
            selected={this.state.selected}
            cardSize={this.props.cardSize}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <>
        {this.props.templates && this.renderTemplateCardItems()}
        <Box className={cx('new-mural-buttons-container')}>
          <TextField
            className="new-mural-create__title"
            value={this.state.title}
            onChange={event =>
              this.setState({
                title: event.target.value,
              })
            }
            variant="outlined"
            label="Mural title"
            placeholder="Untitled mural"
          />

          <PrimaryButton
            className="new-mural-create__submit"
            onClick={this.createMural}
            variant="contained"
            disabled={this.state.btnLoading}
          >
            Create Mural
            {this.state.btnLoading && (
              <CircularProgress
                style={{ marginLeft: 10 }}
                size={18}
                color="inherit"
              />
            )}
          </PrimaryButton>
        </Box>
      </>
    );
  }
}
