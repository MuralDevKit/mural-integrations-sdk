import { Box, CircularProgress, List, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  DeepPartial,
  defaultBuilder,
} from '@muraldevkit/mural-integrations-common';
import { EventHandler } from '@muraldevkit/mural-integrations-common/src/types';
import {
  ApiClient,
  Mural,
  Room,
  Template,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import * as React from 'react';
import { getCommonTrackingProperties } from '../../common/tracking-properties';
import { ReactSlot } from '../../common/react';
import {
  ListItem,
  ListSubheader,
  PrimaryButton,
  Ripple,
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

//const TEMPLATE_CATEGORIES = [] as const;

const DEFAULT_BLANK_TEMPLATE_NAME = 'Blank Template';
const DEFAULT_BLANK_TEMPLATE_ID =
  'gh&rishIOpNm-thON^43D-O&(8&hHjPle$-(kplP&Nm-ujlK8*0^';

const BREAKPOINTS = {
  'one-column': '(max-width:548px)',
  'two-column': '(min-width:548px) and (max-width:1094px)',
  'three-column': '(min-width:1094px)',
};

type BreakPoints = keyof typeof BREAKPOINTS;

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

const TemplateCardItem = (props: any) => (
  <Ripple
    className={classnames(['template-item', 'template-item-sfx'], {
      'template-item-selected': props.isSelected,
    })}
    onClick={props.onClick}
  >
    <div className="template-item-img-container">
      {!props.isBlank && (
        <img
          className="template-item-img"
          src={props.template.thumbUrl}
          alt="thumbnail"
        />
      )}
    </div>
    <div className={'template-item-typography-container'}>
      <div className="template-item-typography-title">
        {props.template.name}
      </div>
      {/* TODO: property 'createdBy' is missing in 'Template' interface */}
      <div className="template-item-typography-subtitle">
        {props.isBlank ? '' : `${props.workspace.name} Template`}
      </div>
    </div>
  </Ripple>
);

interface Slots {
  // @TECHDEBT: converge all card items to the same format
  TemplateCardItem: ReactSlot<typeof TemplateCardItem>;
}

export interface PropTypes {
  apiClient: ApiClient;
  room: Room;
  workspace: Workspace;

  onCancel: EventHandler;
  onCreate: EventHandler<[mural: Mural]>;
  onError: ErrorHandler;

  slots?: DeepPartial<Slots>;
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
  breakPoint: BreakPoints | null;
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
  breakPoint: null,
};

const LIMIT = 25;
const THRESHOLD = 0.8;

const useSlots = defaultBuilder<Slots>({
  TemplateCardItem,
});

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

  matchMediaQuery = () => {
    for (const [breakPoint, mediaQuery] of Object.entries(BREAKPOINTS)) {
      if (window.matchMedia(mediaQuery).matches) {
        this.setState({ breakPoint: breakPoint as BreakPoints });
        return;
      }
    }
  };

  breakPointObserver = () => {
    this.matchMediaQuery();
    window.addEventListener('resize', this.matchMediaQuery);
  };

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
    this.breakPointObserver();
  }

  componentWillUnmount() {
    this.scrollRef.current?.removeEventListener('scroll', this.lazyLoadHandler);
    window.removeEventListener('resize', this.matchMediaQuery);
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
    const slots = useSlots(this.props.slots);
    if (slots.TemplateCardItem === null) return null;

    return (
      <div className="new-mural-container">
        {this.renderTemplateCategories()}

        <div ref={this.scrollRef} className="new-mural-items">
          <div className="new-mural-items-container">
            {this.state.templates.map((template: Template, index) => {
              const isSelected = this.state.selected === index;
              const isBlank = index === 0;

              return (
                <div
                  key={index}
                  className={classnames({
                    [this.state.breakPoint as string]: true,
                  })}
                >
                  <slots.TemplateCardItem
                    onClick={() => this.onSelectTemplate(index)}
                    workspace={this.props.workspace}
                    template={template}
                    isSelected={isSelected}
                    isBlank={isBlank}
                  />
                </div>
              );
            })}
            {this.state.nextToken && (
              <div key="_next" className="template-item">
                <Ripple
                  className="template-item-sfx template-item-sfx--button"
                  onClick={this.loadTemplates}
                >
                  Load more…
                </Ripple>
              </div>
            )}
          </div>
        </div>
      </div>
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
        <div className="new-mural-info">
          {this.state.error && (
            <div data-qa="mural-picker-error">
              <Alert severity="error" className="mural-picker-error">
                {this.state.error}
              </Alert>
            </div>
          )}
        </div>

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
