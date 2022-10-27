import { ThemeProvider } from '@material-ui/core/styles';
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
import cx from 'classnames';
import * as React from 'react';
import { MURAL_PICKER_ERRORS } from '../../common/errors';
import { ReactSlot } from '../../common/react';
import createTheme, { Preset } from '../theme';
import { PrimaryButton } from '../common';
import MuralPickerError from '../error';
import Header from '../header';
import Loading from '../loading';
import MuralSelect from '../mural-select';
import RoomSelect from '../room-select';
import WorkspaceSelect from '../workspace-select';

import './styles.scss';

export type Slots = {
  Header: Header['props']['slots'] & {
    Self: ReactSlot<Header>;
  };

  WorkspaceSelect?: WorkspaceSelect['props']['slots'];
  RoomSelect?: RoomSelect['props']['slots'];
};

type ThemeOptions = {
  preset: Preset;
};

export type PropTypes = {
  apiClient: ApiClient;
  onError: EventHandler<[error: Error, message: string]>;
  onSelect: EventHandler<
    [mural: Mural, room: Room | null, workspace: Workspace]
  >;

  ListboxProps?: object | undefined;
  slots?: DeepPartial<Slots>;
  theme?: Partial<ThemeOptions>;
};

interface StateTypes {
  isLoading: boolean;

  workspaces: Workspace[];
  rooms: Room[];
  murals: Mural[];

  error: string;
  workspace: Workspace | null;
  room: Room | null;
  mural: Mural | null;
}

const useSlots = defaultBuilder<Slots>({
  Header: { Self: Header },
});

const useThemeOptions = defaultBuilder<ThemeOptions>({
  preset: 'light',
});

export default class MuralPickerForm extends React.Component<
  PropTypes,
  StateTypes
> {
  state = {
    isLoading: true,
    workspaces: [],
    rooms: [],
    murals: [],
    error: '',
    workspace: null,
    room: null,
    mural: null,
  };

  async componentDidMount() {
    this.onLoading();
    try {
      const eWorkspaces = await this.props.apiClient.getWorkspaces();
      if (eWorkspaces.value.length) {
        const workspace = eWorkspaces.value[0];
        this.setState({ workspaces: eWorkspaces.value, workspace });
        await this.handleWorkspaceSelect(workspace);
      }
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_WORKSPACES);
    }
    this.onLoadingComplete();
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

  handleWorkspaceSelect = async (workspace: Workspace | null) => {
    if (!workspace) {
      // clear selections
      return this.setState({
        workspace: null,
        murals: [],
        mural: null,
        room: null,
        rooms: [],
        error: '',
      });
    }

    try {
      const q = { workspaceId: workspace.id };
      const [eRooms, eMurals] = await Promise.all([
        this.props.apiClient.getRoomsByWorkspace(q),
        this.props.apiClient.getMuralsByWorkspace(q),
      ]);

      const byTypeAsc = (a: Room, b: Room) => b.type.localeCompare(a.type);

      this.setState({
        isLoading: false,
        workspace,
        rooms: eRooms.value.sort(byTypeAsc),
        murals: eMurals.value,
        room: null,
      });
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_ROOM_AND_MURALS);
    }
  };

  handleRoomSelect = async (room: Room | null) => {
    this.setState({ room });

    if (!room) {
      // clear selections
      return this.setState({
        mural: null,
        murals: [],
        error: '',
      });
    }

    try {
      const query = { roomId: room.id };
      const [eMurals] = await Promise.all([
        this.props.apiClient.getMuralsByRoom(query),
      ]);

      this.setState({
        isLoading: false,
        murals: eMurals.value,
      });
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_ROOM_AND_MURALS);
    }
  };

  /**
   * mural selected with intent to open.
   * Behavior on action with intent to open determined by parent component.
   */
  handleSelect = () => {
    try {
      // send selected mural back to parent
      this.props.onSelect(
        this.state.mural!,
        this.state.room,
        this.state.workspace!,
      );
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_SELECTING_MURAL);
    }
  };

  /**
   * Pass to child component to get selected mural
   */
  handleMuralSelect = (mural: Mural | null) => {
    this.setState({
      mural,
      error: '',
    });
  };

  handleError = (e: Error, displayMsg: string) => {
    // display error and send back error data to caller
    this.setState({ error: displayMsg });

    if (this.props.onError) this.props.onError(e, displayMsg);
  };

  render() {
    const slots = useSlots(this.props.slots);
    const { preset } = useThemeOptions(this.props.theme);
    const muiTheme = createTheme(preset);

    return (
      <ThemeProvider theme={muiTheme}>
        <div
          className={cx('mural-picker-body', muiTheme?.palette?.type)}
          data-qa="mural-picker"
        >
          <slots.Header.Self slots={{ ...slots.Header }}>
            Choose a mural
          </slots.Header.Self>
          <div className="select-row">
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
            <MuralSelect
              apiClient={this.props.apiClient}
              workspace={this.state.workspace}
              murals={this.state.murals}
              onError={this.handleError}
              onSelect={this.handleMuralSelect}
            />
          </div>
          <PrimaryButton
            className="mural-select-button"
            data-qa="mural-select-button"
            disabled={!this.state.mural}
            onClick={this.handleSelect}
            size="large"
            variant="contained"
          >
            Open mural
          </PrimaryButton>
          {this.state.error && <MuralPickerError error={this.state.error} />}
          {this.state.isLoading && <Loading />}
        </div>
      </ThemeProvider>
    );
  }
}
