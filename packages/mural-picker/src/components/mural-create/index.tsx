import { Box, CircularProgress, List, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { EventHandler } from '@muraldevkit/mural-integrations-common';
import {
  ApiClient,
  Mural,
  Room,
  Template,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import debounce from 'lodash/debounce';
import * as React from 'react';
import { getCommonTrackingProperties } from '../../common/tracking-properties';
import { ActionItemSource } from '../card-list-item/action';
import { CardListSection } from '../card-list/card-list-section';
import {
  ListItem,
  ListSubheader,
  PrimaryButton,
  SecondaryButton,
} from '../common';
import { ErrorHandler } from '../types';
import './styles.scss';

/*
 * Once we have the proper template lookup in the public API, we should showcase
 * all of the template categories to enable filtering.
 */
const TEMPLATE_CATEGORIES = [
  'Icebreaker',
  'Understand',
  'Empathize',
  'Brainstorm',
  'Design',
  'Evaluate',
  'Plan',
  'Agile',
] as const;

const DEFAULT_BLANK_TEMPLATE_NAME = 'Blank Template';
const DEFAULT_BLANK_TEMPLATE_ID =
  'gh&rishIOpNm-thON^43D-O&(8&hHjPle$-(kplP&Nm-ujlK8*0^';

const BLANK_TEMPLATE: Template = {
  id: DEFAULT_BLANK_TEMPLATE_ID,
  description: '',
  name: DEFAULT_BLANK_TEMPLATE_NAME,
  publicHash: '',
  thumbUrl: '',
  type: 'default',
  updatedOn: 0,
  workspaceId: '',
  viewLink: '',
} as const;

export interface PropTypes {
  apiClient: ApiClient;
  room: Room;
  workspace: Workspace;

  onCancel: EventHandler;
  onCreate: EventHandler<[mural: Mural]>;
  onError: ErrorHandler;
}

interface StateTypes {
  btnLoading: boolean;
  error: string;
  loading: boolean;
  nextToken: string | null;
  scrollHeight: number;
  selected: number;
  templates: Template[];
  title: string;
}

const INITIAL_STATE: StateTypes = {
  btnLoading: false,
  error: '',
  loading: false,
  nextToken: null,
  scrollHeight: 620,
  selected: 0,
  templates: [BLANK_TEMPLATE],
  title: '',
};

const LIMIT = 25;
const THRESHOLD = 0.8;

export default class MuralCreate extends React.Component<
  PropTypes,
  StateTypes
> {
  state: StateTypes = INITIAL_STATE;
  titleRef: React.RefObject<HTMLInputElement>;
  scrollRef: React.RefObject<HTMLInputElement>;

  constructor(props: PropTypes) {
    super(props);

    this.titleRef = React.createRef();
    this.scrollRef = React.createRef();
  }

  loadTemplates = async () => {
    if (this.state.loading) {
      return;
    }

    this.setState({ loading: true }, async () => {
      try {
        const eTemplates = await this.props.apiClient.getTemplatesByWorkspace(
          {
            workspaceId: this.props.workspace.id,
          },
          {
            paginate: {
              limit: LIMIT,
              next: this.state.nextToken,
            },
          },
        );

        const templates = [
          ...Array.from(this.state.templates),
          ...(eTemplates.value || []),
        ];
        this.setState(
          {
            templates,
            nextToken: eTemplates?.next || null,
            loading: false,
            error: '',
          },
          () => {
            this.scrollRef.current?.addEventListener(
              'scroll',
              this.lazyLoadHandler,
            );
          },
        );
      } catch (exception) {
        this.setState({ loading: false, error: 'Error getting templates.' });
      }
    });
  };

  createMural = () => {
    let { title } = this.state;
    const { room, workspace } = this.props;
    const template = this.state.templates[this.state.selected];

    title = title || 'Untitled mural';
    if (!template) return this.setState({ error: 'Please select a template.' });

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

        this.props.onCreate(eMural.value);
        this.props.apiClient.track('Created mural from picker', {
          ...getCommonTrackingProperties(),
          clientAppId: this.props.apiClient.config.appId,
          template: template.name,
        });
      } catch (exception) {
        this.setState({
          error: 'Error creating a new mural.',
          btnLoading: false,
        });
      }
    });
  };

  lazyLoadHandler = debounce((event: Event) => {
    if (!(event.target instanceof Element)) return;

    const { scrollTop, scrollHeight, clientHeight } = event.target;

    // This computes the ratio of the current scroll bar position
    // 0 ⇒ top, 1 ⇒ bottom
    const ratio = scrollTop / (scrollHeight - clientHeight);

    if (!this.state.error && this.state.nextToken && ratio >= THRESHOLD) {
      this.loadTemplates();
    }
  }, 50);

  componentDidMount() {
    this.loadTemplates();
  }

  componentWillUnmount() {
    this.scrollRef.current?.removeEventListener('scroll', this.lazyLoadHandler);
  }

  onSelectTemplate = (index: number) => {
    this.setState(
      {
        selected: index,
        title: this.state.title ?? this.state.templates[index].name,
      },
      () => {
        this.titleRef.current?.focus();
      },
    );
  };

  handleAction = (name: string) => {
    switch (name) {
      case 'load-more':
        return this.loadTemplates();
    }
  };

  renderTemplateCategories = () => {
    // TODO: enable this when the public API supports categories
    return null;

    return (
      <div className="new-mural-categories">
        <List component="nav" disablePadding>
          <ListItem disableGutters button selected>
            All templates
          </ListItem>
          <ListSubheader disableGutters>Browse by category</ListSubheader>
          {[
            `Current workspace (${this.props.workspace.name})`,
            ...TEMPLATE_CATEGORIES,
          ].map((category, index) => (
            <ListItem key={index} disableGutters button>
              {category}
            </ListItem>
          ))}
        </List>
      </div>
    );
  };

  renderTemplateCardItems = () => {
    const templateCardItems = this.state.templates.map(template => ({
      title: template.name,
      thumbnailUrl: template.thumbUrl,
    }));

    const actions: ActionItemSource[] = [];
    if (this.state.nextToken) {
      actions.push({ content: 'Load more…', name: 'load-more', sort: 'end' });
    }

    return (
      <>
        {this.renderTemplateCategories()}

        <div ref={this.scrollRef} className="mural-selector-container">
          <div className="mural-selector-grid">
            <CardListSection
              title="Workspace templates"
              actions={actions}
              items={templateCardItems}
              onSelect={this.onSelectTemplate}
              onAction={this.handleAction}
              selected={this.state.selected}
              cardSize={'normal'}
            />
          </div>
        </div>
      </>
    );
  };

  render() {
    if (this.state.loading && this.state.templates.length <= 1) {
      return (
        <div className="card-list-spinner">
          <CircularProgress />
        </div>
      );
    }

    return (
      <>
        {this.state.error && (
          <div data-qa="mural-picker-error">
            <Alert severity="error" className="mural-picker-error">
              {this.state.error}
            </Alert>
          </div>
        )}

        {this.renderTemplateCardItems()}

        <Box className="new-mural-buttons-container">
          <div className="new-mural-items-mask" />
          <SecondaryButton
            className="button"
            variant="text"
            onClick={this.props.onCancel}
          >
            Cancel<span className="content--lg">&nbsp;& go back</span>
          </SecondaryButton>

          <Box className="new-mural-create">
            <TextField
              className="new-mural-create--input"
              inputRef={this.titleRef}
              value={this.state.title}
              onChange={event =>
                this.setState({ error: '', title: event.target.value })
              }
              variant="standard"
              label="Mural title"
              placeholder="Untitled mural"
            />
            <PrimaryButton
              className="button"
              onClick={this.createMural}
              variant="contained"
              disabled={this.state.btnLoading}
            >
              Create<span className="content--lg">&nbsp;Mural</span>{' '}
              {this.state.btnLoading && (
                <CircularProgress
                  style={{ marginLeft: 10 }}
                  size={18}
                  color="inherit"
                />
              )}
            </PrimaryButton>
          </Box>
        </Box>
      </>
    );
  }
}
