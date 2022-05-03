/**
 * NOTE:
 * The MURAL public API does not currently support template retrieval
 * and selection, so this component is not yet being used (and is not quite
 * finished). However, it's a functional start to the component, so I've left
 * this in here for when the API endpoints are available and we can flesh this
 * out.
 */

import {
  Box,
  ButtonBase,
  CircularProgress,
  TextField,
  List,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { withStyles } from '@material-ui/styles';
import {
  ApiClient,
  Template,
  Mural,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import classnames from 'classnames';
import * as React from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  ListItem,
  ListSubheader,
  Divider,
} from '../../shared';
import './styles.scss';

/* Once we have the proper template lookup in the public API, we should showcase
 * all of the template categories to enable filtering.
 *
 *const TEMPLATE_CATEGORIES = [
 *  'Icebreaker',
 *  'Understand',
 *  'Empathize',
 *  'Brainstorm',
 *  'Design',
 *  'Evaluate',
 *  'Plan',
 *  'Agile',
 *] as const;
 */

const TEMPLATE_CATEGORIES = [] as const;

export const RippleEffect = withStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    marginBottom: 16,
  },
})(ButtonBase);

export interface PropTypes {
  apiClient: ApiClient;
  roomId: string;
  workspace: Workspace;

  onCancelAndGoBack: () => void;
  onCreateMural: (mural: Mural) => void;
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
  templates: [],
  title: '',
};

const LIMIT = 100;
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

export default class CreateNewMural extends React.Component<
  PropTypes,
  StateTypes
> {
  state: StateTypes = INITIAL_STATE;
  scrollRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  titleRef: React.RefObject<HTMLInputElement>;
  maskRef: React.RefObject<HTMLDivElement>;
  commonElementHeight: number;

  constructor(props: PropTypes) {
    super(props);
    this.scrollRef = React.createRef();
    this.containerRef = React.createRef();
    this.titleRef = React.createRef();
    this.maskRef = React.createRef();
    this.commonElementHeight = 0;
  }

  loadTemplates = async () => {
    if (this.state.loading) {
      return;
    }

    this.setState({ loading: true }, async () => {
      try {
        const eTemplates = await this.props.apiClient.getTemplatesByWorkspace({
          workspaceId: this.props.workspace.id,
        });

        const templates = [
          BLANK_TEMPLATE,
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
    const { roomId, workspace } = this.props;
    const template = this.state.templates[this.state.selected];

    if (!title) {
      title = 'Untitled mural';
    }

    if (!template) return this.setState({ error: 'Please select a template.' });

    this.setState({ btnLoading: true }, async () => {
      let eMural;
      try {
        if (this.state.selected === 0) {
          eMural = await this.props.apiClient.createMural({
            title,
            workspaceId: workspace.id,
            roomId,
          });
        } else {
          eMural = await this.props.apiClient.createMuralFromTemplate({
            title,
            roomId,
            templateId: template.id,
          });
        }

        this.props.onCreateMural(eMural.value);
      } catch (exception) {
        this.setState({
          error: 'Error creating a new mural.',
          btnLoading: false,
        });
      }
    });
  };

  resizeHandler = (event: any) => {
    this.setState({
      scrollHeight: event.target.innerHeight ?? INITIAL_STATE.scrollHeight,
    });
  };

  lazyLoadHandler = (event: any) => {
    const value = event.target.scrollTop;
    const total = this.containerRef.current?.clientHeight || 0;
    const percentage = (value * 100) / total;
    const treshold = this.state.templates.length >= LIMIT * 2 ? 70 : 45;

    if (percentage >= treshold && !this.state.error) {
      this.loadTemplates();
    }
  };

  componentDidMount() {
    this.loadTemplates();
    this.resizeHandler({ target: window });
    this.commonElementHeight = Number(this.maskRef.current?.clientHeight);
    window.addEventListener('resize', this.resizeHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHandler);
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

  render() {
    const headerHeight = this.commonElementHeight;
    const maskHeight = this.commonElementHeight;
    const scrollHeight = this.state.scrollHeight - maskHeight - headerHeight;

    if (this.state.loading && !this.state.templates.length) {
      return (
        <div className="mural-list-spinner">
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

        <div className="new-mural-container">
          <div className="new-mural-categories">
            <List component="nav" disablePadding>
              <ListItem disableGutters button selected>
                All templates
              </ListItem>
              <Divider />
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
          <div className="new-mural-items">
            <div
              ref={this.scrollRef}
              className="new-mural-items-scroll"
              style={{ maxHeight: scrollHeight }}
            >
              <div
                ref={this.containerRef}
                className="new-mural-items-container"
              >
                {this.state.templates.map((template: Template, index) => {
                  const isSelected = this.state.selected === index;

                  return (
                    <div
                      key={index}
                      className={classnames('template-item', {
                        'template-item-selected': isSelected,
                      })}
                    >
                      <RippleEffect
                        className="template-item-sfx"
                        onClick={() => this.onSelectTemplate(index)}
                      >
                        <div className="template-item-img-container">
                          {template.id !== DEFAULT_BLANK_TEMPLATE_ID && (
                            <img
                              className="template-item-img"
                              src={template.thumbUrl}
                              alt="thumbnail"
                            />
                          )}
                        </div>
                        <div
                          className={classnames(
                            'template-item-typography-container',
                            {
                              blank: template.id === DEFAULT_BLANK_TEMPLATE_ID,
                            },
                          )}
                        >
                          <div className="template-item-typography-title">
                            {template.name}
                          </div>
                          {/* TODO: property 'createdBy' is missing in 'Template' interface */}
                          <div className="template-item-typography-subtitle">
                            {(template as any).createdBy} Template
                          </div>
                          <div className="template-item-typography-desc">
                            {template.description}
                          </div>
                        </div>
                      </RippleEffect>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="new-mural-items-mask" ref={this.maskRef} />
          </div>

          <Box className="new-mural-buttons-container">
            <SecondaryButton
              className="button"
              variant="text"
              onClick={this.props.onCancelAndGoBack}
            >
              Cancel & go back
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
                Create Mural{' '}
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
        </div>
      </>
    );
  }
}
