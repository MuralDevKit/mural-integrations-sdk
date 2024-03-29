import { CircularProgress, FormControl } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
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
import cx from 'classnames';
import * as React from 'react';
import { MURAL_PICKER_ERRORS } from '../../common/errors';
import { getAllWorkspaces } from '../../common/get-all';
import { ReactSlot } from '../../common/react';
import { PrimaryButton } from '../common';
import RoomSelect from '../room-select-slots';
import createTheme, { Preset } from '../theme';
import WorkspaceSelectSlots from '../workspace-select-slots';
import './styles.scss';

interface Slots {
  WorkspaceSelectSlots: WorkspaceSelectSlots['props']['slots'] & {
    Self: ReactSlot<WorkspaceSelectSlots>;
  };
  RoomSelect: RoomSelect['props']['slots'] & {
    Self: ReactSlot<RoomSelect>;
  };
}

type ThemeOptions = {
  preset: Preset;
};

export interface PropTypes {
  apiClient: ApiClient;
  onSelect: EventHandler<[room: Room, workspace: Workspace]>;

  buttonTitle?: string;
  onError?: EventHandler<[error: Error, message: string]>;
  slots?: DeepPartial<Slots>;
  theme?: Partial<ThemeOptions>;
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

const useThemeOptions = defaultBuilder<ThemeOptions>({
  preset: 'light',
});

const useSlots = defaultBuilder<Slots>({
  WorkspaceSelectSlots: {
    Self: WorkspaceSelectSlots,
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
      const workspaces = await getAllWorkspaces(this.props.apiClient);
      if (workspaces.length) {
        this.setState({ workspaces, isLoading: false });
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

  handleWorkspaceSelectSlots = async (workspace: Workspace | null) => {
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
    const { buttonTitle } = this.props;
    const { error, isLoading } = this.state;
    const slots = useSlots(this.props.slots);
    const { preset } = useThemeOptions(this.props.theme);
    const muiTheme = createTheme(preset);

    const controlGlyph = isLoading ? (
      <CircularProgress />
    ) : (
      buttonTitle ?? 'Select'
    );

    return (
      <ThemeProvider theme={muiTheme}>
        <div
          className={cx('room-picker-body', muiTheme?.palette?.type)}
          data-qa="room-picker"
        >
          <div className="select-row">
            <slots.WorkspaceSelectSlots.Self
              workspace={this.state.workspace}
              workspaces={this.state.workspaces}
              onSelect={this.handleWorkspaceSelectSlots}
              slots={slots.WorkspaceSelectSlots}
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
              <PrimaryButton
                className="room-picker-button"
                data-qa="room-picker-button"
                disabled={!this.state.room}
                onClick={this.handleSubmit}
              >
                {controlGlyph}
              </PrimaryButton>
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
