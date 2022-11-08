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
import { getAllRoomsByWorkspace } from '../../common/get-all';
import { getCommonTrackingProperties } from '../../common/tracking-properties';
import CardList from '../card-list';
import { CardSize } from '../card-list-item';
import MuralPickerError from '../error';
import Header from '../header';
import Loading from '../loading';
import MuralCreate from '../mural-create';
import RoomSelect from '../room-select';
import WorkspaceSelect from '../workspace-select';
import createTheme, { Preset } from '../theme';
import { ReactSlot } from '../../common/react';
import { BackButton, PrimaryButton, threshold } from '../common';
import { Box, FormControl, SvgIcon } from '@material-ui/core';
import cx from 'classnames';
import Measure from 'react-measure';

import '@muraldevkit/mural-integrations-common/styles/common.scss';
import './styles.scss';

// @TECHDEBT — Once we have the @tactivos/ds-icons library
// We can remove this atrocity and `import { plus } from '@tactivos/ds-icons'`
const Plus = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M9.875 13.625a.5.5 0 0 1 .5.5v3.625c0 .69.56 1.25 1.25 1.25h.75c.69 0 1.25-.56 1.25-1.25v-3.625a.5.5 0 0 1 .5-.5h3.625c.69 0 1.25-.56 1.25-1.25v-.75c0-.69-.56-1.25-1.25-1.25h-3.625a.5.5 0 0 1-.5-.5V6.25c0-.69-.56-1.25-1.25-1.25h-.75c-.69 0-1.25.56-1.25 1.25v3.625a.5.5 0 0 1-.5.5H6.25c-.69 0-1.25.56-1.25 1.25v.75c0 .69.56 1.25 1.25 1.25h3.625Z" />
  </svg>
);

const BackArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M8.293 18.707a1 1 0 0 0 1.414-1.414L5.414 13H21a1 1 0 1 0 0-2H5.414l4.293-4.293a1 1 0 0 0-1.414-1.414l-6 6a1 1 0 0 0 0 1.414l6 6Z" />
  </svg>
);

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
        getAllRoomsByWorkspace(this.props.apiClient, q),
        this.props.apiClient.getMuralsByWorkspace(q),
      ]);

      const rooms = uponRooms.sort((a, b) => b.type.localeCompare(a.type));

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

  renderHeader() {
    const slots = useSlots(this.props.slots);
    let title;

    switch (this.state.segue) {
      case Segue.CREATING:
        title = 'Create a mural';
        slots.Header.Action = (props: any) => (
          <BackButton onClick={this.setInitialState} {...props}>
            <SvgIcon>
              <BackArrow />
            </SvgIcon>
          </BackButton>
        );
        break;
      case Segue.PICKING:
        title = 'Choose a mural';
        slots.Header.Action = () => null;
        break;
    }

    return (
      <slots.Header.Self slots={{ ...slots.Header }}>{title}</slots.Header.Self>
    );
  }

  render() {
    const { preset, cardSize } = useThemeOptions(this.props.theme);
    const slots = useSlots(this.props.slots);
    const theme = createTheme(preset);

    return (
      <ThemeProvider theme={theme}>
        <Box className={`mural-picker-body ${preset}`} data-qa="mural-picker">
          {this.renderHeader()}
          <div className={cx('mural-picker-selects')}>
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
            <FormControl
              className="mural-picker-control"
              data-qa="mural-picker-control"
            >
              <Measure bounds>
                {({ measureRef, contentRect }) => {
                  const sz = threshold(contentRect.bounds?.width, {
                    l: 140,
                  });
                  return (
                    <PrimaryButton
                      color="primary"
                      ref={measureRef}
                      disabled={!this.state.room}
                      onClick={this.handleCreate}
                    >
                      <SvgIcon>
                        <Plus />
                      </SvgIcon>
                      {sz.l && <span>New mural</span>}
                    </PrimaryButton>
                  );
                }}
              </Measure>
            </FormControl>
          </div>

          {this.state.error && <MuralPickerError error={this.state.error} />}
          {this.state.segue === Segue.LOADING && <Loading />}
          {this.state.segue === Segue.PICKING && this.state.workspace && (
            <CardList
              murals={this.state.murals}
              cardSize={cardSize}
              onSelect={this.handleMuralSelect}
              onCreate={this.handleCreate}
              onError={this.handleError}
              selectedMural={this.state.mural}
              workspace={this.state.workspace}
            />
          )}

          {this.state.segue === Segue.CREATING &&
            this.state.room &&
            this.state.workspace && (
              <MuralCreate
                apiClient={this.props.apiClient}
                cardSize={cardSize}
                onError={this.handleError}
                onCreate={this.handleFinishCreation}
                onCancel={this.setInitialState}
                room={this.state.room}
                workspace={this.state.workspace}
              />
            )}
        </Box>
      </ThemeProvider>
    );
  }
}
