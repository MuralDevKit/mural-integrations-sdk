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
import { ApiClient, Template, Mural } from '@tactivos/mural-integrations-mural-client';
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
const defaultBlankTemplateName = 'Blank Template'; 

export default class CreateNewMural extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = INITIAL_STATE;
  scrollRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  titleRef: React.RefObject<HTMLInputElement>;

  constructor(props: PropTypes) {
    super(props)
    this.scrollRef = React.createRef()
    this.containerRef = React.createRef()
    this.titleRef = React.createRef()
  }

  loadTemplates = async () => {
    if (this.state.loading) {
      return
    }

    this.setState({ loading: true }, async () => {
      try {
        const blankTemplate: Template = { id: '', description: '', name: defaultBlankTemplateName, publicHash: '', thumbUrl: ''};
        const data = await this.props.apiClient.getTemplates(LIMIT.toString(), this.state.nextToken);
        const templates = [blankTemplate, ...Array.from(this.state.templates), ...(data.value || [])];
        this.setState({ templates, nextToken: data.next, loading: false, error: '' });
      } catch (exception) {
        this.setState({ loading: false, error: 'Error getting templates.' })
      }
    })
  };

  createMural = () => {
    const { title } = this.state
    const { roomId, workspaceId } = this.props
    const template = this.state.templates[this.state.selected]

    try {
      if (!title) {
        this.setState({ error: "Please enter a title for a new Mural." });
        return
      }

      if (!template) {
        this.setState({ error: "Please select a template." }); 
        return
      }
      this.setState({ btnLoading: true }, async () => {
        let data;
        if (template.name === defaultBlankTemplateName) {
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
    const actionsHeight = 70;
    const headerHeight = 114;
    const maskHeight = 114;
    const scrollHeight = this.state.scrollHeight - maskHeight - headerHeight

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
            <ListItem disableGutters button>MURAL</ListItem>
            <ListItem disableGutters button>Icebreaker</ListItem>
            <ListItem disableGutters button>Understand</ListItem>
            <ListItem disableGutters button>Empathize</ListItem>
            <ListItem disableGutters button>Brainstorm</ListItem>
            <ListItem disableGutters button>Design</ListItem>
            <ListItem disableGutters button>Evaluate</ListItem>
            <ListItem disableGutters button>Plan</ListItem>
            <ListItem disableGutters button>Agile</ListItem>
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
                      <div className={`template-item-img-container ${template.name === defaultBlankTemplateName ? 'blank blank-image': ''}`}>
                        {template.name !== defaultBlankTemplateName ? <img className='template-item-img' src={template.thumbUrl} alt='thumbnail' /> : ''}
                      </div>
                      <div className={`template-item-typography-container' ${template.name === defaultBlankTemplateName ? 'blank': ''}`}>
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
          
          <div className='new-mural-items-mask' style={{ height: maskHeight }} />
        </div>

        <div className='new-mural-buttons-container' style={{ height: actionsHeight }}>
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
