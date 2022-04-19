/**
 * NOTE:
 * The MURAL public API does not currently support template retrieval
 * and selection, so this component is not yet being used (and is not quite
 * finished). However, it's a functional start to the component, so I've left
 * this in here for when the API endpoints are available and we can flesh this
 * out.
 */

import './styles.scss';
import * as React from 'react';
import { List, ButtonBase, CircularProgress, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ApiClient, Template, Mural } from '@muraldevkit/mural-integrations-mural-client';
import { withStyles } from '@material-ui/styles';
import { PrimaryButton, SecondaryButton, ListItem, ListSubheader, Divider } from '../../shared';
import classnames from "classnames";

export const RippleEffect = withStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    marginBottom: 16,
  }
})(ButtonBase)

export interface PropTypes {
  apiClient: ApiClient
  token: string;
  roomId: string;
  workspaceId: string;
  onCancelAndGoBack: () => void;
  onCreateMural: (mural: Mural) => void;
}

interface StateTypes {
  scrollHeight: number;
  templates: Template[];
  nextToken: string;
  loading: boolean;
  btnLoading: boolean;
  error: string;
  selected: number;
  title: string;
}

const INITIAL_STATE: StateTypes = {
  scrollHeight: 620,
  templates: [],
  nextToken: '',
  loading: false,
  btnLoading: false,
  error: '',
  selected: -1,
  title: '',
};

const LIMIT = 100;
const DEFAULT_BLANK_TEMPLATE_NAME = 'Blank Template';
const DEFAULT_BLANK_TEMPLATE_ID = 'gh&rishIOpNm-thON^43D-O&(8&hHjPle$-(kplP&Nm-ujlK8*0^';

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

export default class CreateNewMural extends React.Component<PropTypes, StateTypes> {
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
      return
    }

    this.setState({ loading: true }, async () => {
      try {
        // TODO: add 'next' query param for 'getTemplates' method into mural-client sdk
        const url = new URL('/api/public/v1/templates', `https://${this.props.apiClient.config.host}`);
        url.searchParams.set('limit', LIMIT.toString())
        if (this.state.nextToken) url.searchParams.set('next', this.state.nextToken)
        const response = await this.props.apiClient.fetch(url.toString(), { method: 'GET' });
        const data = await response.json();
        
        const templates = [BLANK_TEMPLATE, ...Array.from(this.state.templates), ...(data.value || [])];
        this.setState({ templates, nextToken: data.next, loading: false, error: '' }, () => {
          this.scrollRef.current?.addEventListener('scroll', this.lazyLoadHandler)
        });
      } catch (exception) {
        this.setState({ loading: false, error: 'Error getting templates.' })
      }
    })
  };

  createMural = () => {
    const { title } = this.state;
    const { roomId, workspaceId } = this.props;
    const template = this.state.templates[this.state.selected];

    if (!title) return this.setState({ error: "Please enter a title for a new Mural." });

    if (!template) return this.setState({ error: "Please select a template." });

    try {
      this.setState({ btnLoading: true }, async () => {
        let data;
        if (this.state.selected === 0) {
          data = await this.props.apiClient.createMural(
            title,
            workspaceId,
            roomId
          );
        } else {
          data = await this.props.apiClient.createMuralFromTemplate(
            title,
            roomId,
            template.id
          );
        }

        this.props.onCreateMural(data.value)
      });
      
    } catch (exception) {
      this.setState({ error: 'Error creating a new mural.' })
    }
  }

  resizeHandler = (event: any) => {
    this.setState({ scrollHeight: event.target.innerHeight ?? INITIAL_STATE.scrollHeight })
  }

  lazyLoadHandler = (event: any) => {
    const value = event.target.scrollTop
    const total = this.containerRef.current?.clientHeight || 0
    const percentage = (value * 100) / total
    const treshold = this.state.templates.length >= (LIMIT * 2) ? 70 : 45

    if (percentage >= treshold && !this.state.error) {
      this.loadTemplates()
    }
  }

  componentDidMount() {
    this.loadTemplates();
    this.resizeHandler({ target: window })
    this.commonElementHeight = Number(this.maskRef.current?.clientHeight);
    window.addEventListener('resize', this.resizeHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHandler)
    this.scrollRef.current?.removeEventListener('scroll', this.lazyLoadHandler)
  }

  onSelectTemplate = (index: number) => {
    this.setState({
      selected: index,
      title: this.state.title ?? this.state.templates[index].name,
    }, () => {
      this.titleRef.current?.focus()
    })
  }

  render() {
    const TEMPLATE_CATEGORIES = [
      'MURAL',
      'Icebreaker',
      'Understand',
      'Empathize',
      'Brainstorm',
      'Design',
      'Evaluate',
      'Plan',
      'Agile'
    ] as  const;
    const headerHeight = this.commonElementHeight;
    const maskHeight = this.commonElementHeight;
    const scrollHeight = this.state.scrollHeight - maskHeight - headerHeight;

    if (this.state.loading && !this.state.templates.length) {
      return (
        <div className='mural-list-spinner'>
          <CircularProgress />
        </div>
      )
    }

    return (
      <>
      <div className='new-mural-info'>
        {this.state.error && (
          <div data-qa='mural-picker-error'>
            <Alert severity='error' className='mural-picker-error'>
              {this.state.error}
            </Alert>
          </div>
        )}
      </div>

      <div className='new-mural-container'>
        <div className='new-mural-categories'>
          <List component='nav' disablePadding>
            <ListItem disableGutters button selected>
              All templates
            </ListItem>
            <Divider />
            <ListSubheader disableGutters>Browse by category</ListSubheader>
            {TEMPLATE_CATEGORIES.map((category, index) => <ListItem key={index} disableGutters button>{category}</ListItem>)}
          </List>
        </div>
        <div className='new-mural-items'>
          <div ref={this.scrollRef} className='new-mural-items-scroll' style={{ maxHeight: scrollHeight }}>
            <div ref={this.containerRef} className='new-mural-items-container'>
              {this.state.templates.map((template: Template, index) => {
                const isSelected = this.state.selected === index

                return (
                  <div
                    key={index}
                    className={classnames('template-item', {
                      'template-item-selected': isSelected,
                    })}
                  >
                    <RippleEffect onClick={() => this.onSelectTemplate(index)}>
                      <div className={classnames('template-item-img-container', {
                        'blank blank-image': template.id === DEFAULT_BLANK_TEMPLATE_ID
                        })}>
                        {template.id !== DEFAULT_BLANK_TEMPLATE_ID ? <img className='template-item-img' src={template.thumbUrl} alt='thumbnail' /> : ''}
                      </div>
                      <div className={classnames('template-item-typography-container', {
                        'blank': template.id === DEFAULT_BLANK_TEMPLATE_ID
                      })}>
                        <div className='template-item-typography-title'>
                          {template.name}
                        </div>
                        {/* TODO: property 'createdBy' is missing in 'Template' interface */}
                        <div className='template-item-typography-subtitle'>{(template as any).createdBy} Template</div>
                        <div className='template-item-typography-desc'>{template.description}</div>
                      </div>
                    </RippleEffect>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className='new-mural-items-mask' ref={this.maskRef} />
        </div>

        <div className='new-mural-buttons-container' >
          <TextField
            inputRef={this.titleRef}
            value={this.state.title}
            onChange={(event) => this.setState({ error: '', title: event.target.value })}
            label='Title'
            style={{ width: '100%', maxWidth: 320, marginBottom: 21, marginRight: 20 }}
          />
          <SecondaryButton style={{ marginRight: 14 }} onClick={this.props.onCancelAndGoBack} variant='text'>Cancel & go back</SecondaryButton>
          <PrimaryButton
            style={{ minWidth: 120 }}
            onClick={this.createMural}
            variant='contained'
            disabled={this.state.btnLoading}
          >
            Create Mural {this.state.btnLoading && <CircularProgress style={{ marginLeft: 10 }} size={18} color='inherit' />}
          </PrimaryButton>
        </div>
      </div>
      </>
    );
  }
}
