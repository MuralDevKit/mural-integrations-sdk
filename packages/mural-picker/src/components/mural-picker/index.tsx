import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import {
  ApiClient,
  Mural,
  Room,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { MURAL_PICKER_ERRORS } from '../../common/errors';
import MuralPickerError from '../error';
import Header from '../header';
import Loading from '../loading';
import { CardSize } from '../mural-card';
import MuralList from '../mural-list';
import RoomSelect from '../room-select';
import WorkspaceSelect from '../workspace-select';
import './styles.scss';

export interface CreateMuralData {
  roomId: string;
  title: string;
  workspaceId: string;
}

export interface CreateMuralResult {
  error?: string;
}

export interface PropTypes {
  apiClient: ApiClient;
  handleError: (error: Error, message: string) => void;
  cardSize?: CardSize;
  hideLogo?: boolean;
  hideAddButton?: boolean;
  theme?: 'light' | 'dark';
  ListboxProps?: object | undefined;

  onCreateMural: (
    mural: CreateMuralData,
  ) => Promise<CreateMuralResult | undefined>;
  onMuralSelect: (mural: Mural) => void;
}

interface StateTypes {
  isCreateSelected: boolean;
  isLoading: boolean;
  isSearchingRooms: boolean;

  workspaces: Workspace[];
  rooms: Room[];
  workspaceRooms: Room[];
  searchedRooms: Room[];
  murals: Mural[];
  mural?: Mural;
  error: string;
  workspace: Workspace | null;
  room: Room | null;
}

const INITIAL_STATE: StateTypes = {
  isCreateSelected: false,
  isLoading: true,
  isSearchingRooms: false,

  workspaces: [],
  rooms: [],
  workspaceRooms: [],
  searchedRooms: [],
  murals: [],
  error: '',
  workspace: null,
  room: null,
};

export default class MuralPicker extends React.Component<PropTypes> {
  state: StateTypes = INITIAL_STATE;

  async componentDidMount() {
    this.setState({ isLoading: true });
    try {
      const workspaces = await this.props.apiClient.getWorkspaces();
      const lastActiveWorkspaceId =
        await this.props.apiClient.getLastActiveWorkspaceId();
      if (workspaces?.length) {
        let workspace;
        if (lastActiveWorkspaceId) {
          workspace =
            workspaces.find(
              workspace => workspace.id === lastActiveWorkspaceId,
            ) || workspaces[0];
        } else {
          workspace = workspaces[0];
        }
        this.setState({ workspaces, workspace });
        await this.loadMuralsAndRoomsByWorkspace(workspace);
      }
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_WORKSPACES);
    }
    this.setState({ isLoading: false });
  }

  onLoading = () => {
    this.setState({
      isLoading: true,
      error: '',
    });
  };

  onLoadingComplete = () => {
    this.setState({
      isLoading: false,
    });
  };

  onWorkspaceSelect = async (
    _: React.ChangeEvent<{}>,
    workspace: Workspace | null,
  ) => {
    await this.loadMuralsAndRoomsByWorkspace(workspace);
  };

  loadMuralsAndRoomsByWorkspace = async (workspace: Workspace | null) => {
    if (!workspace) {
      // clear selections
      return this.setState({
        workspace: null,
        murals: [],
        mural: null,
        rooms: [],
        roomId: '',
        error: '',
      });
    }

    this.setState({ isLoading: true, error: '' });

    try {
      const roomPromise = this.props.apiClient.getRoomsByWorkspace(
        workspace.id,
      );
      const muralPromise = this.props.apiClient.getMuralsByWorkspace(
        workspace.id,
      );
      const [rooms, murals] = await Promise.all([roomPromise, muralPromise]);
      const sortedRooms: Room[] = rooms.sort((a, b) =>
        b.type.localeCompare(a.type),
      );
      this.setState({
        isLoading: false,
        workspace,
        workspaceRooms: sortedRooms,
        murals,
        roomId: '',
        room: null,
      });
    } catch (e: any) {
      this.setState({ isLoading: false });
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_ROOM_AND_MURALS);
    }
  };

  onRoomSelect = (room: Room | null, murals: Mural[]) => {
    this.setState({
      room,
      murals,
      isLoading: false,
    });
  };

  /**
   * Passed to child components to get room search results
   */
  onRoomSearch = (searchedRooms: Room[]) => {
    this.setState({ searchedRooms, isSearchingRooms: false });
  };

  /**
   * mural selected via grid/cards
   */
  onMuralSelect = (mural: Mural) => {
    /*
     * Despite the types making this.props.onMuralSelect required in cases where components using this method are rendered,
     * it is possible that with updates it could be invoked when not defined.
     */
    if (!this.props.onMuralSelect) {
      this.handleError(
        new Error(
          'onMuralSelect was invoked when not passed as prop from parent',
        ),
        MURAL_PICKER_ERRORS.ERR_SELECTING_MURAL,
      );
      return;
    }

    try {
      // send selected mural back to parent
      this.props.onMuralSelect(mural);

      this.setState({
        error: '',
        isCreateSelected: false,
        mural,
      });
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_SELECTING_MURAL);
    }
  };

  onCreateMural = async (_?: string) => {
    /*
     * Despite the types making this.props.onCreateMural required in cases where components using this method are rendered,
     * it is possible that with updates it could be invoked when not defined.
     */
    if (!this.props.onCreateMural) {
      this.handleError(
        new Error(
          'onCreateMural was invoked when not passed as prop from parent',
        ),
        MURAL_PICKER_ERRORS.ERR_SELECTING_MURAL,
      );
      return;
    }

    // TODO: incorporate template selection when public API is ready
    if (!this.state.workspace) {
      return this.setState({ error: MURAL_PICKER_ERRORS.ERR_SELECT_WORKSPACE });
    }
    if (!this.state.room) {
      return this.setState({ error: MURAL_PICKER_ERRORS.ERR_SELECT_ROOM });
    }

    this.setState({
      error: '',
      isCreateSelected: true,
      mural: undefined,
    });

    const result = await this.props.onCreateMural({
      roomId: this.state.room.id,
      title: '', // leaving title blank for now
      workspaceId: this.state.workspace.id,
    });

    if (result?.error) {
      this.setState({
        error: result.error,
      });
    }
  };

  handleError = (e: Error, displayMsg: string) => {
    // display error and send back error data to caller
    this.setState({ error: displayMsg });
    this.props.handleError(e, displayMsg);
  };

  getRoomGroup = (room?: Room) => {
    if (!room) return '';
    return room.type === 'private' ? 'PRIVATE ROOMS' : 'OPEN ROOMS';
  };

  render() {
    const { cardSize, hideLogo, theme } = this.props;
    const currentTheme = theme || 'light';
    const muiTheme = createMuiTheme({
      palette: {
        type: currentTheme,
        text: { primary: currentTheme === 'light' ? '#585858' : '#a7a7a7' },
      },
    });

    return (
      <ThemeProvider theme={muiTheme}>
        <div className={`mural-picker-body ${theme}`} data-qa="mural-picker">
          <Header hideLogo={hideLogo} />
          <div className={'mural-picker-selects'}>
            <WorkspaceSelect
              workspace={this.state.workspace}
              workspaces={this.state.workspaces}
              ListboxProps={this.props.ListboxProps}
              onWorkspaceSelect={this.onWorkspaceSelect}
            ></WorkspaceSelect>

            <RoomSelect
              apiClient={this.props.apiClient}
              handleError={this.props.handleError}
              isSearchingRooms={this.state.isSearchingRooms}
              workspace={this.state.workspace}
              room={this.state.room}
              workspaceRooms={this.state.workspaceRooms}
              searchedRooms={this.state.searchedRooms}
              onRoomSelect={this.onRoomSelect}
              onRoomSearch={this.onRoomSearch}
              onLoading={this.onLoading}
              onLoadingComplete={this.onLoadingComplete}
            ></RoomSelect>
          </div>
          {/* TODO: add search */}
          {this.state.error && <MuralPickerError error={this.state.error} />}
          {this.state.isLoading && <Loading />}
          {!this.state.isLoading && (
            <MuralList
              workspace={this.state.workspace}
              room={this.state.room}
              isCreateSelected={this.state.isCreateSelected}
              murals={this.state.murals}
              selectedMural={this.state.mural}
              onMuralSelect={this.onMuralSelect}
              onCreateMural={this.onCreateMural}
              handleError={this.handleError}
              cardSize={cardSize || 'normal'}
              hideAddButton={!!this.props.hideAddButton}
            />
          )}

          {/* TODO: add create-new-mural flow */}
        </div>
      </ThemeProvider>
    );
  }
}
