import { CircularProgress, FormControl } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import {
  DeepPartial,
  defaultBuilder,
  EventHandler,
} from '@muraldevkit/mural-integrations-common';
import {
  ApiClient,
  Room,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { MURAL_PICKER_ERRORS } from '../../common/errors';
import { ReactSlot } from '../../common/react';
import RoomSelect from '../room-select';
import WorkspaceSelect from '../workspace-select';
import './styles.scss';

interface Slots {
  WorkspaceSelect: WorkspaceSelect['props']['slots'] & {
    Self: ReactSlot<WorkspaceSelect>;
  };
  RoomSelect: RoomSelect['props']['slots'] & {
    Self: ReactSlot<RoomSelect>;
  };
}

export interface PropTypes {
  apiClient: ApiClient;
  onSelect: EventHandler<[room: Room, workspace: Workspace]>;

  buttonTitle?: string;
  onError?: EventHandler<[error: Error, message: string]>;
  theme?: 'light' | 'dark';

  slots?: DeepPartial<Slots>;
}

interface StateTypes {
  isLoading: boolean;
  workspaces: Workspace[];
  rooms: Room[];
  error: string;
  workspace: Workspace | null;
  room: Room | null;
  searchedRooms: Room[] | null;
}

const INITIAL_STATE: StateTypes = {
  isLoading: true,
  workspaces: [],
  rooms: [],
  searchedRooms: null,
  error: '',
  workspace: null,
  room: null,
};

const useSlots = defaultBuilder<Slots>({
  WorkspaceSelect: {
    Self: WorkspaceSelect,
  },
  RoomSelect: {
    Self: RoomSelect,
  },
});

export default class RoomPicker extends React.Component<PropTypes> {
  state: StateTypes = INITIAL_STATE;

  async componentDidMount() {
    await this.loadWorkspaces();
  }

  loadWorkspaces = async () => {
    this.setState({ isLoading: true });
    try {
      const eWorkspaces = await this.props.apiClient.getWorkspaces();
      if (eWorkspaces.value.length) {
        this.setState({ workspaces: eWorkspaces.value, isLoading: false });
      }
    } catch (e: any) {
      this.handleError(e, 'Error retrieving workspaces.');
      this.setState({ isLoading: false });
    }
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
      const eRooms = await this.props.apiClient.getRoomsByWorkspace({
        workspaceId: workspace.id,
      });
      const rooms = eRooms.value.sort((a, b) => b.type.localeCompare(a.type));
      this.setState({
        isLoading: false,
        workspace,
        rooms: rooms,
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

    if (this.props.onError) {
      this.props.onError(e, displayMsg);
    }
  };

  getRoomGroup = (room?: Room) => {
    if (!room) return '';
    return room.type === 'private' ? 'PRIVATE ROOMS' : 'OPEN ROOMS';
  };

  handleRoomsSearch = async (query: any) => {
    if (!query) {
      return this.setState({ searchedRooms: null });
    }

    if (!this.state.workspace) return;
    if (query.title.length <= 2) return;

    try {
      const eRooms = await this.props.apiClient.searchRoomsByWorkspace(query);
      this.setState({ searchedRooms: eRooms.value });
    } catch (e: any) {
      if (!this.props.onError) throw e;

      this.props.onError(e, MURAL_PICKER_ERRORS.ERR_SEARCH_MURALS);
    }
  };

  handleWorkspaceSelect = async (workspace: Workspace | null) => {
    this.setState({ workspace, error: '' });
    await this.loadRoomsByWorkspace(workspace);
  };

  handleRoomSelect = async (room: Room | null) => {
    this.setState({ room, error: '' });
  };

  handleSubmit = async () => {
    if (!this.state.workspace) {
      return this.setState({ error: 'Please select a workspace.' });
    }
    if (!this.state.room) {
      return this.setState({ error: 'Please select a room.' });
    }

    this.props.onSelect(this.state.room, this.state.workspace);
  };

  render() {
    const { theme, buttonTitle } = this.props;
    const { error, isLoading } = this.state;
    const slots = useSlots(this.props.slots);

    const controlGlyph = isLoading ? (
      <CircularProgress />
    ) : (
      buttonTitle ?? 'Select'
    );

    // @TECHDEBT: use the main theme
    const currentTheme = theme || 'light';
    const muiTheme = createMuiTheme({
      palette: {
        type: currentTheme,
        text: { primary: currentTheme === 'light' ? '#585858' : '#a7a7a7' },
        primary: {
          main: '#FF0066',
        },
      },
      typography: {
        fontFamily: 'Proxima Nova',
      },
    });

    return (
      <ThemeProvider theme={muiTheme}>
        <div className={`room-picker-body ${theme}`}>
          <div className="select-row">
            <slots.WorkspaceSelect.Self
              workspace={this.state.workspace}
              workspaces={this.state.workspaces}
              onSelect={this.handleWorkspaceSelect}
              slots={slots.WorkspaceSelect}
            />

            <slots.RoomSelect.Self
              workspace={this.state.workspace}
              room={this.state.room}
              rooms={this.state.searchedRooms || this.state.rooms}
              onSearchQuery={this.handleRoomsSearch}
              onSelect={this.handleRoomSelect}
              slots={slots.RoomSelect}
            />

            <FormControl className="room-picker-control">
              <button
                className="mural-button room-picker-button"
                data-qa="room-picker-button"
                onClick={this.handleSubmit}
              >
                {controlGlyph}
              </button>
            </FormControl>
          </div>
          {error && (
            <Alert
              severity="error"
              className="room-picker-error"
              data-qa="room-picker-error"
            >
              {error}
            </Alert>
          )}
        </div>
      </ThemeProvider>
    );
  }
}
