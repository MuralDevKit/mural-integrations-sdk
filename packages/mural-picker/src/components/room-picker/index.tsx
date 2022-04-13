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
  Room,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import './styles.scss';

export interface RoomPickerData {
  roomId: string;
  workspaceId: string;
}

export interface RoomSelectResult {
  error?: string;
}

export interface RoomPickerPropTypes {
  apiClient: ApiClient;
  onRoomSelect: (data: RoomPickerData) => Promise<RoomSelectResult | undefined>;
  handleError: (error: Error, message: string) => void;
  hideLogo?: boolean;
  theme?: 'light' | 'dark';
  buttonTitle: string;
}

interface StateTypes {
  isLoading: boolean;
  workspaces: Workspace[];
  rooms: Room[];
  error: string;
  workspace: Workspace | null;
  room: Room | null;
}

const INITIAL_STATE: StateTypes = {
  isLoading: true,
  workspaces: [],
  rooms: [],
  error: '',
  workspace: null,
  room: null,
};

export default class RoomPicker extends React.Component<RoomPickerPropTypes> {
  state: StateTypes = INITIAL_STATE;

  async componentDidMount() {
    await this.loadWorkspaces();
  }

  loadWorkspaces = async () => {
    this.setState({ isLoading: true });
    try {
      const workspaces = await this.props.apiClient.getWorkspaces();
      if (workspaces?.length) {
        this.setState({ workspaces, isLoading: false });
      }
    } catch (e: any) {
      this.handleError(e, 'Error retrieving workspaces.');
      this.setState({ isLoading: false });
    }
  };

  onWorkspaceSelect = async (
    _: React.ChangeEvent<{}>,
    workspace: Workspace | null,
  ) => {
    this.setState({ workspace, error: '' });
    await this.loadRoomsByWorkspace(workspace);
  };

  loadRoomsByWorkspace = async (workspace: Workspace | null) => {
    if (!workspace) {
      return this.setState({
        workspace: null,
        rooms: [],
        roomId: '',
      });
    }
    try {
      this.setState({ isLoading: true });
      const rooms = await this.props.apiClient.getRoomsByWorkspace(
        workspace.id,
      );
      const sortedRooms = rooms.sort((a, b) => b.type.localeCompare(a.type));
      this.setState({
        isLoading: false,
        workspace,
        rooms: sortedRooms,
        roomId: '',
        room: null,
      });
    } catch (e: any) {
      this.setState({ isLoading: false });
      this.handleError(e, 'Error retrieving rooms.');
    }
  };

  handleError = (e: Error, displayMsg: string) => {
    this.setState({ error: displayMsg });
    this.props.handleError(e, displayMsg);
  };

  getRoomGroup = (room?: Room) => {
    if (!room) return '';
    return room.type === 'private' ? 'PRIVATE ROOMS' : 'OPEN ROOMS';
  };

  onRoomSelect = async (_: React.ChangeEvent<{}>, room: Room | null) => {
    this.setState({ room, error: '' });
  };

  onSubmit = async () => {
    if (!this.state.workspace) {
      return this.setState({ error: 'Please select a workspace.' });
    }
    if (!this.state.room) {
      return this.setState({ error: 'Please select a room.' });
    }

    const result = await this.props.onRoomSelect({
      roomId: this.state.room.id,
      workspaceId: this.state.workspace.id,
    });

    if (result?.error) {
      this.setState({
        error: result.error,
      });
    }
  };

  render() {
    const { theme, buttonTitle } = this.props;
    const { error, isLoading } = this.state;
    const currentTheme = theme || 'light';
    const muiTheme = createMuiTheme({
      palette: {
        type: currentTheme,
        text: { primary: currentTheme === "light" ? "#585858" : "#a7a7a7" },
        primary: {
          main: '#FF0066',
        },
      },
      typography: {
        fontFamily: 'Proxima Nova'
      }
    });

    return (
      <ThemeProvider theme={muiTheme}>
        <div className={`room-picker-body ${theme}`}>
          <div className="select-row">
            <FormControl
              className="room-picker-select"
              data-qa="workspace-select"
            >
              <div className="select-label">
                <InputLabel shrink>WORKSPACE</InputLabel>
              </div>
              <div className="workspace-list">
                <Autocomplete
                  id="workspace-select"
                  options={this.state.workspaces}
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
                  value={this.state.workspace}
                  groupBy={() => 'SWITCH TO'}
                  onChange={this.onWorkspaceSelect}
                />
              </div>
            </FormControl>
            <FormControl className="room-picker-select" data-qa="room-select">
              <div className="select-label">
                <InputLabel shrink>ROOM</InputLabel>
              </div>
              <div className="room-list">
                <Autocomplete
                  id="room-select"
                  options={this.state.rooms}
                  getOptionLabel={option => {
                    return option?.name || '';
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder="Find a room..."
                      variant="outlined"
                    />
                  )}
                  value={this.state.room}
                  disabled={!this.state.workspace}
                  groupBy={this.getRoomGroup}
                  onChange={this.onRoomSelect}
                />
              </div>
            </FormControl>
          </div>
          {error && (
            <div data-qa="room-picker-error">
              <Alert severity="error" className="mural-picker-error">
                {error}
              </Alert>
            </div>
          )}
          <FormControl className="workspace-button">
            <button
              className="room-picker-button"
              data-qa="room-picker-button"
              onClick={this.onSubmit}
            >
              {buttonTitle}
            </button>
          </FormControl>

          {isLoading && (
            <div className="mural-list-spinner">
              <CircularProgress />
            </div>
          )}
        </div>
      </ThemeProvider>
    );
  }
}
