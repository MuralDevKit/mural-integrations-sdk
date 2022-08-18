import {
  ThemeOptions as MuiThemeOptions,
  ThemeProvider,
} from '@material-ui/core/styles';
import {
  DeepPartial,
  defaultBuilder,
  EventHandler,
} from '@muraldevkit/mural-integrations-common';
import {
  ApiClient,
  Mural,
  Room,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { MURAL_PICKER_ERRORS } from '../../common/errors';
import { getCommonTrackingProperties } from '../../common/tracking-properties';
import CardList from '../card-list';
import { CardSize } from '../card-list-item';
import MuralPickerError from '../error';
import Header from '../header';
import Loading from '../loading';
import MuralCreate from '../mural-create';
import RoomSelect from '../room-select';
import WorkspaceSelect from '../workspace-select';
import './styles.scss';
import createTheme, { Preset } from '../theme';
import { ReactSlot } from '../../common/react';

export type ThemeOptions = {
  preset: Preset;
  cardSize: CardSize;
  overrides?: MuiThemeOptions;
};

export type Slots = {
  AddButton?: ReactSlot;

  Header: Header['props']['slots'] & {
    Self: ReactSlot<Header>;
  };

  WorkspaceSelect?: WorkspaceSelect['props']['slots'];
  RoomSelect?: RoomSelect['props']['slots'];
};

interface PropTypes {
  apiClient: ApiClient;
  onError: EventHandler<[error: Error, message: string]>;
  onSelect: EventHandler<
    [mural: Mural, room: Room | null, workspace: Workspace]
  >;

  theme?: DeepPartial<ThemeOptions>;
  slots?: DeepPartial<Slots>;
}

interface StateTypes {
  segue: Segue;

  workspaces: Workspace[];
  rooms: Room[];
  murals: Mural[];

  /** Currently selected mural */
  mural: Mural | null;

  /** Currently selected room */
  room: Room | null;

  /** Currently selected workspace */
  workspace: Workspace | null;

  error: string;
}

enum Segue {
  CREATING = 'creating',
  LOADING = 'loading',
  SEARCHING = 'searching',
  PICKING = 'picking',
}

const useThemeOptions = defaultBuilder<ThemeOptions>({
  preset: 'light',
  cardSize: 'normal',
});

const useSlots = defaultBuilder<Slots>({
  Header: { Self: Header },
});

export default class MuralPicker extends React.Component<
  PropTypes,
  StateTypes
> {
  state: StateTypes = {
    segue: Segue.LOADING,

    workspaces: [],
    rooms: [],
    murals: [],

    mural: null,
    room: null,
    workspace: null,

    error: '',
  };

  useTransition = (to: Segue) => () => this.transition(to);

  transition = (to: Segue) => this.setState({ segue: to });

  trackDisplay = () => {
    this.props.apiClient.track('Mural picker displayed', {
      ...getCommonTrackingProperties(),
      clientAppId: this.props.apiClient.config.appId,
      workspace: this.state.workspace?.name,
    });
  };

  async componentDidMount() {
    try {
      this.transition(Segue.LOADING);

      const eWorkspaces = await this.props.apiClient.getWorkspaces();
      const currentUser = await this.props.apiClient.getCurrentUser();
      const lastActiveWorkspaceId = currentUser.value.lastActiveWorkspace;

      if (eWorkspaces.value.length) {
        const workspace =
          eWorkspaces.value.find(w => w.id === lastActiveWorkspaceId) ||
          eWorkspaces.value[0];

        this.setState(
          { workspaces: eWorkspaces.value, workspace },
          this.trackDisplay,
        );

        await this.handleWorkspaceSelect(workspace);
      }
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_WORKSPACES);
    } finally {
      this.transition(Segue.PICKING);
    }
  }

  handleWorkspaceSelect = async (workspace: Workspace | null) => {
    if (!workspace) {
      // clear selections
      return this.setState({
        workspace: null,
        murals: [],
        mural: null,
        rooms: [],
        room: null,
        error: '',
      });
    }

    try {
      this.transition(Segue.LOADING);

      const q = {
        workspaceId: workspace.id,
      };

      const [uponRooms, uponMurals] = await Promise.all([
        this.props.apiClient.getRoomsByWorkspace(q),
        this.props.apiClient.getMuralsByWorkspace(q),
      ]);

      const rooms: Room[] = uponRooms.value.sort((a, b) =>
        b.type.localeCompare(a.type),
      );

      this.setState({
        workspace,
        rooms: rooms,
        murals: uponMurals.value,

        // Reset the currently selected room
        room: null,
      });
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_ROOM_AND_MURALS);
    } finally {
      this.transition(Segue.PICKING);
    }
  };

  handleRoomSelect = async (room: Room | null) => {
    if (!room) {
      return this.handleWorkspaceSelect(this.state.workspace);
    }

    try {
      this.transition(Segue.LOADING);
      const q = {
        roomId: room.id,
      };

      const eMurals = await this.props.apiClient.getMuralsByRoom(q);

      this.setState({
        room: room,
        murals: eMurals.value,
      });
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_MURALS);
    } finally {
      this.transition(Segue.PICKING);
    }
  };

  handleMuralSelect = (mural: Mural) => {
    try {
      this.setState({
        error: '',
        mural,
      });
      this.props.apiClient.track('Selected mural from picker', {
        ...getCommonTrackingProperties(),
        clientAppId: this.props.apiClient.config.appId,
        workspace: this.state.workspace?.name,
        muralId: mural.id,
      });
      this.props.onSelect(mural, this.state.room, this.state.workspace!);
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_SELECTING_MURAL);
    }
  };

  handleCreate = async () => {
    if (!this.state.workspace) {
      return this.setState({ error: MURAL_PICKER_ERRORS.ERR_SELECT_WORKSPACE });
    }

    if (!this.state.room) {
      return this.setState({ error: MURAL_PICKER_ERRORS.ERR_SELECT_ROOM });
    }

    this.setState({
      error: '',
      segue: Segue.CREATING,
      mural: null,
    });
  };

  setInitialState = () => {
    this.setState({ segue: Segue.PICKING });
  };

  handleFinishCreation = async (mural: Mural) => {
    this.setInitialState();

    // Let's add this new mural to our list of displayed mural
    this.setState(state => ({
      mural,
      murals: [mural, ...state.murals],
    }));

    this.props.onSelect(mural, this.state.room, this.state.workspace!);
  };

  handleError = async (e: Error, displayMsg: string) => {
    this.setState({ error: displayMsg });

    if (this.props.onError) {
      this.props.onError(e, displayMsg);
    }
  };

  getRoomGroup = (room?: Room) => {
    if (!room) return '';
    return room.type === 'private' ? 'PRIVATE ROOMS' : 'OPEN ROOMS';
  };

  render() {
    const { preset, cardSize } = useThemeOptions(this.props.theme);
    const slots = useSlots(this.props.slots);
    const theme = createTheme(preset);

    const title =
      this.state.segue === Segue.CREATING ? 'Create a mural' : 'Choose a mural';

    return (
      <ThemeProvider theme={theme}>
        <div className={`mural-picker-body ${preset}`} data-qa="mural-picker">
          <slots.Header.Self slots={{ ...slots.Header }}>
            {title}
          </slots.Header.Self>
          <div className={'mural-picker-selects'}>
            <WorkspaceSelect
              workspace={this.state.workspace}
              workspaces={this.state.workspaces}
              onSelect={this.handleWorkspaceSelect}
              slots={slots.WorkspaceSelect}
            />
            <RoomSelect
              workspace={this.state.workspace}
              room={this.state.room}
              rooms={this.state.rooms}
              onSelect={this.handleRoomSelect}
              slots={slots.RoomSelect}
            />
          </div>

          {this.state.error && <MuralPickerError error={this.state.error} />}
          {this.state.segue === Segue.LOADING && <Loading />}
          {this.state.segue === Segue.PICKING && (
            <CardList
              murals={this.state.murals}
              selectedMural={this.state.mural}
              cardSize={cardSize}
              hideAddButton={!slots.AddButton === null}
              onSelect={this.handleMuralSelect}
              onCreate={this.handleCreate}
              onError={this.handleError}
            />
          )}

          {this.state.segue === Segue.CREATING &&
            this.state.room &&
            this.state.workspace && (
              <MuralCreate
                apiClient={this.props.apiClient}
                room={this.state.room}
                workspace={this.state.workspace}
                onError={this.handleError}
                onCreate={this.handleFinishCreation}
                onCancel={this.setInitialState}
              />
            )}
        </div>
      </ThemeProvider>
    );
  }
}
