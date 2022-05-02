import {
  CircularProgress,
  FormControl,
  InputLabel,
  TextField,
} from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  ApiClient,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import './styles.scss';

export interface WorkspacePickerData {
  workspaceId: string;
}

export interface WorkspacePickerPropTypes {
  apiClient: ApiClient;
  buttonTitle?: string;
  handleError: (error: Error, message: string) => void;
  hideLogo?: boolean;
  initialWorkspaceId?: string;
  onWorkspaceSelect: (workspace: Workspace) => void;
  theme?: 'light' | 'dark';
}

interface StateTypes {
  error: string;
  isLoading: boolean;
  workspace: Workspace | null;
  workspaces: Workspace[];
}

const INITIAL_STATE: StateTypes = {
  error: '',
  isLoading: true,
  workspace: null,
  workspaces: [],
};

export default class WorkspacePicker extends React.Component<WorkspacePickerPropTypes> {
  state: StateTypes = INITIAL_STATE;

  async componentDidMount() {
    await this.loadWorkspaces();
  }

  loadWorkspaces = async () => {
    this.setState({ isLoading: true });
    try {
      const workspaces = await this.props.apiClient.getWorkspaces();
      if (workspaces.value.length) {
        let workspace;
        if (this.props.initialWorkspaceId) {
          workspace = workspaces.value.find(
            w => w.id === this.props.initialWorkspaceId,
          );
        }

        this.setState({
          workspace,
          workspaces: workspaces.value,
          isLoading: false,
        });
      }
    } catch (e: any) {
      this.handleError(e, 'Error retrieving workspaces.');
      this.setState({
        isLoading: false,
        error: 'Error retrieving workspaces.',
      });
    }
  };

  onWorkspaceSelect = async (
    _: React.ChangeEvent<{}>,
    workspace: Workspace | null,
  ) => {
    this.setState({ workspace, error: '' });
  };

  handleError = (e: Error, displayMsg: string) => {
    this.setState({ error: displayMsg });
    this.props.handleError(e, displayMsg);
  };

  onSubmit = async () => {
    if (!this.state.workspace)
      return this.setState({ error: 'Please select a workspace.' });
    this.props.onWorkspaceSelect(this.state.workspace);
  };

  render() {
    const { theme, buttonTitle } = this.props;
    const { error, isLoading } = this.state;
    const currentTheme = theme || 'light';
    const muiTheme = createMuiTheme({
      palette: {
        type: currentTheme,
        text: { primary: currentTheme === 'light' ? '#585858' : '#a7a7a7' },
      },
    });

    if (isLoading) {
      return (
        <ThemeProvider theme={muiTheme}>
          <div className={`workspace-picker-body ${theme}`}>
            <div className="workspace-list-spinner">
              <CircularProgress />
            </div>
          </div>
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider theme={muiTheme}>
        <div className={`workspace-picker-body ${theme}`}>
          <div className="select-row">
            <FormControl
              className="workspace-picker-select"
              data-qa="workspace-select"
            >
              <div className="select-label">
                <InputLabel shrink>WORKSPACE</InputLabel>
              </div>
              <div className="workspace-list" data-qa="workspace-list">
                <Autocomplete
                  id="workspace-select"
                  options={this.state.workspaces}
                  getOptionLabel={option => {
                    return option.name || '';
                  }}
                  fullWidth
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder="Find a workspace..."
                      variant="outlined"
                    />
                  )}
                  value={this.state.workspace}
                  groupBy={() => 'SWITCH TO'}
                  onChange={this.onWorkspaceSelect}
                />
              </div>
            </FormControl>

            <FormControl
              className="workspace-picker-button-control"
              data-qa="workspace-picker-button-control"
            >
              <button
                className="workspace-picker-button"
                data-qa="workspace-picker-button"
                onClick={this.onSubmit}
              >
                {buttonTitle}
              </button>
            </FormControl>
          </div>
          {error && (
            <div data-qa="workspace-picker-error">
              <Alert severity="error" className="workspace-picker-error">
                {error}
              </Alert>
            </div>
          )}
        </div>
      </ThemeProvider>
    );
  }
}
