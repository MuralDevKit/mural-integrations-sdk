import { FormControl, InputLabel, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  defaultBuilder,
  DeepPartial,
  EventHandler,
} from '@muraldevkit/mural-integrations-common';
import { Workspace } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import Measure from 'react-measure';
import { ReactSlot } from '../../common/react';
import { threshold } from '../common';
import cx from 'classnames';
import './styles.scss';

interface Slots {
  LabelText: ReactSlot;
}

interface PropTypes {
  workspaces: Workspace[];
  workspace: Workspace | null;
  onSelect: EventHandler<[workspace: Workspace | null]>;

  slots?: DeepPartial<Slots>;
}

const useSlots = defaultBuilder<Slots>({
  LabelText: () => <span>Workspace</span>,
});

export default class WorkspaceSelect extends React.Component<PropTypes> {
  handleChange = (_: React.ChangeEvent<{}>, workspace: Workspace | null) => {
    this.props.onSelect(workspace);
  };

  render() {
    const slots = useSlots(this.props.slots);

    return (
      <Measure bounds>
        {({ measureRef, contentRect }) => {
          const sz = threshold(contentRect.bounds?.width, {
            m: 140,
          });

          return (
            <FormControl
              ref={measureRef}
              className={cx('workspace-select')}
              data-qa="workspace-select"
            >
              {sz.m && (
                <div className="select-label">
                  <InputLabel shrink>
                    <slots.LabelText />
                  </InputLabel>
                </div>
              )}
              <div className="workspace-list">
                <Autocomplete
                  id="workspace-select"
                  options={this.props.workspaces}
                  getOptionLabel={option => {
                    return option.name || '';
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder="Find a workspace..."
                      variant="outlined"
                    />
                  )}
                  value={this.props.workspace}
                  groupBy={() => 'SWITCH TO'}
                  onChange={this.handleChange}
                  noOptionsText={'No results'}
                />
              </div>
            </FormControl>
          );
        }}
      </Measure>
    );
  }
}
