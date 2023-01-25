import { CircularProgress, FormControl } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import {
  defaultBuilder,
  EventHandler,
} from '@muraldevkit/mural-integrations-common';
import {
  ApiClient,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { PrimaryButton } from '../common';
import createTheme, { Preset } from '../theme';
import WorkspaceSelect from '../workspace-select';
import cx from 'classnames';
import './styles.scss';

export type ThemeOptions = {
  preset: Preset;
};

export interface WorkspacePickerPropTypes {
  apiClient: ApiClient;
  onSelect: EventHandler<[workspace: Workspace]>;
  onError: EventHandler<[error: Error, message: string]>;

  theme?: Partial<ThemeOptions>;
  buttonTitle?: string;
  initialWorkspaceId?: string;
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

const useThemeOptions = defaultBuilder<ThemeOptions>({
  preset: 'light',
});

export default class WorkspacePicker extends React.Component<WorkspacePickerPropTypes> {
  state: StateTypes = INITIAL_STATE;

  async componentDidMount() {
    await this.loadWorkspaces();
  }

  loadWorkspaces = async () => {
    this.setState({ isLoading: true });

    try {
      const eWorkspaces = await this.props.apiClient.getWorkspaces();
      if (eWorkspaces.value.length) {
        const workspace =
          eWorkspaces.value.find(w => w.id === this.props.initialWorkspaceId) ||
          eWorkspaces.value[0];

        this.setState({
          workspace,
          workspaces: eWorkspaces.value,
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

  onWorkspaceSelect = async (workspace: Workspace | null) => {
    this.setState({ workspace, error: '' });
  };

  handleError = (e: Error, displayMsg: string) => {
    this.setState({ error: displayMsg });
    this.props.onError(e, displayMsg);
  };

  onSubmit = async () => {
    if (!this.state.workspace)
      return this.setState({ error: 'Please select a workspace.' });

    this.props.onSelect(this.state.workspace);
  };

  render() {
    const { buttonTitle } = this.props;
    const { error, isLoading } = this.state;
    const { preset } = useThemeOptions(this.props.theme);
    const muiTheme = createTheme(preset);

    if (isLoading) {
      return (
        <ThemeProvider theme={muiTheme}>
          <div className={cx('workspace-picker-body', muiTheme?.palette?.type)}>
            <div className="workspace-list-spinner">
              <CircularProgress />
            </div>
          </div>
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider theme={muiTheme}>
        <div
          className={cx('workspace-picker-body', muiTheme?.palette?.type)}
          data-qa="workspace-picker"
        >
          <div className="select-row">
            <WorkspaceSelect
              workspace={this.state.workspace}
              workspaces={this.state.workspaces}
              onSelect={this.onWorkspaceSelect}
            />
            <FormControl
              className="workspace-picker-control"
              data-qa="workspace-picker-control"
            >
              <PrimaryButton
                data-qa="workspace-picker-button"
                disabled={!this.state.workspace}
                onClick={this.onSubmit}
              >
                {buttonTitle ?? 'Select'}
              </PrimaryButton>
            </FormControl>
          </div>
          {error && (
            <Alert
              severity="error"
              className="workspace-picker-error"
              data-qa="workspace-picker-error"
            >
              {error}
            </Alert>
          )}
        </div>
      </ThemeProvider>
    );
  }
}
