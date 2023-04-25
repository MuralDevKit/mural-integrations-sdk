import { Box, FormControl, SvgIcon, TextField } from '@material-ui/core';
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
import cx from 'classnames';
import * as React from 'react';
import Measure from 'react-measure';
import { MURAL_PICKER_ERRORS } from '../../common/errors';
import { getAllRoomsByWorkspace, getAllWorkspaces } from '../../common/get-all';
import { ReactSlot } from '../../common/react';
import { getCommonTrackingProperties } from '../../common/tracking-properties';
import CardList from '../card-list';
import { CardSize } from '../card-list-item';
import { BackButton, PrimaryButton, threshold } from '../common';
import MuralPickerError from '../error';
import Header from '../header';
import Loading from '../loading';
import MuralCreate from '../mural-create';
import RoomSelect from '../room-select';
import createTheme, { Preset } from '../theme';
import WorkspaceSelect from '../workspace-select';

import '@muraldevkit/mural-integrations-common/styles/common.scss';
import './styles.scss';

// @TECHDEBT — Once we have the @tactivos/ds-icons library
// We can remove this atrocity and `import { plus } from '@tactivos/ds-icons'`
import { ReactComponent as BackArrow } from '@muraldevkit/mural-integrations-common/assets/icons/arrow-back.svg';
import { ReactComponent as Plus } from '@muraldevkit/mural-integrations-common/assets/icons/plus.svg';

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
  disableCreate?: boolean;
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
  muralType: string;
  /** Currently selected workspace */
  workspace: Workspace | null;
  search: string;
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
    muralType: 'Recent',
    mural: null,
    room: null,
    workspace: null,
    search: '',

    error: '',
  };

  private apiClient: ApiClient;

  constructor(props: PropTypes) {
    super(props);

    // Clone the ApiClient to avoid impacting other consumers of the client when
    // we call abort()
    this.apiClient = this.props.apiClient.clone();
  }

  useTransition = (to: Segue) => () => this.transition(to);

  transition = (to: Segue) => this.setState({ segue: to });

  trackDisplay = () => {
    // Track using the original ApiClient to avoid aborting these requests
    this.props.apiClient.track('Mural picker displayed', {
      ...getCommonTrackingProperties(),
      clientAppId: this.props.apiClient.config.appId,
      workspace: this.state.workspace?.name,
    });
  };

  async componentDidMount() {
    try {
      this.transition(Segue.LOADING);

      const [workspaces, currentUser] = await Promise.all([
        getAllWorkspaces(this.apiClient),
        this.apiClient.getCurrentUser(),
      ]);
      const lastActiveWorkspaceId = currentUser.value.lastActiveWorkspace;

      if (workspaces.length) {
        const workspace =
          workspaces.find(w => w.id === lastActiveWorkspaceId) || workspaces[0];

        await this.handleWorkspaceSelect(workspace);

        const roomsUnsorted = await getAllRoomsByWorkspace(this.apiClient, {
          workspaceId: workspace.id,
        });

        const rooms = roomsUnsorted.sort((a, b) =>
          b.type.localeCompare(a.type),
        );

        this.setState(
          { workspaces, workspace, rooms, room: rooms[0] },
          this.trackDisplay,
        );
      }
    } catch (e: any) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_WORKSPACES);
    } finally {
      this.transition(Segue.PICKING);
    }
  }

  handleWorkspaceSelect = async (workspace: Workspace | null) => {
    // Abort in-flight requests
    this.apiClient.abort();

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
        getAllRoomsByWorkspace(this.apiClient, q),
        this.apiClient.getMuralsByWorkspace(q),
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

    // Abort in-flight requests
    this.apiClient.abort();

    try {
      this.transition(Segue.LOADING);
      const q = {
        roomId: room.id,
      };

      const eMurals = await this.apiClient.getMuralsByRoom(q);

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
      return this.setState({ workspace: this.state.workspaces[0] });
    }

    if (!this.state.room) {
      return this.setState({ room: this.state.rooms[0] });
    }

    this.setState({
      error: '',
      segue: Segue.CREATING,
      mural: null,
    });
  };

  setInitialState = () => {
    this.setState({ segue: Segue.PICKING, search: '' });
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
    // Ignore aborted request errors
    if (e.name === 'AbortError') {
      return;
    }

    this.setState({ error: displayMsg });

    if (this.props.onError) {
      this.props.onError(e, displayMsg);
    }
  };

  getRoomGroup = (room?: Room) => {
    if (!room) return '';
    return room.type === 'private' ? 'PRIVATE ROOMS' : 'OPEN ROOMS';
  };

  renderPartialHeader() {
    const slots = useSlots(this.props.slots);
    let title;

    switch (this.state.segue) {
      case Segue.CREATING:
        title = 'Search for templates';
        slots.Header.Action = (props: any) => (
          <BackButton onClick={this.setInitialState} {...props}>
            <SvgIcon>
              <BackArrow />
            </SvgIcon>
          </BackButton>
        );
        break;
      case Segue.SEARCHING:
        title = 'Search for murals';
        slots.Header.Action = (props: any) => (
          <BackButton onClick={this.setInitialState} {...props}>
            <SvgIcon>
              <BackArrow />
            </SvgIcon>
          </BackButton>
        );
        break;
      case Segue.PICKING:
        title = 'Search for murals';
        slots.Header.Action = () => null;
        break;
    }

    return (
      <>
        <slots.Header.Self slots={{ ...slots.Header }}></slots.Header.Self>
        <TextField
          className="search-input"
          value={this.state.search}
          onChange={event => {
            console.log(event.target.value);
            return this.setState({
              error: '',
              search: event.target.value,
              segue: Segue.SEARCHING,
            });
          }}
          variant="outlined"
          label={title}
          placeholder={title}
        />
      </>
    );
  }

  render() {
    const { preset, cardSize } = useThemeOptions(this.props.theme);
    const slots = useSlots(this.props.slots);
    const theme = createTheme(preset);

    const showFilters =
      !this.state.search &&
      (this.state.segue === Segue.CREATING || this.state.muralType == 'All');
    const showTabs =
      !this.state.search &&
      (this.state.muralType == 'All' ||
        this.state.muralType == 'Recent' ||
        this.state.muralType == 'Starred');

    return (
      <ThemeProvider theme={theme}>
        <Box className={`mural-picker-body ${preset}`} data-qa="mural-picker">
          <div className="mural-header-row">
            {this.renderPartialHeader()}
            {!this.props.disableCreate && (
              <FormControl
                className="mural-create-control"
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
                        title="Create new mural"
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
            )}
          </div>
          {showTabs && (
            <div className="mural-search-type-container">
              <button
                onClick={() =>
                  this.setState({
                    muralType: 'Recent',
                    murals: this.state.murals,
                  })
                }
                className={cx({
                  'mural-search-type-selected':
                    this.state.muralType === 'Recent',
                  'mural-search-type': true,
                })}
              >
                Recent
              </button>
              <button
                onClick={() =>
                  this.setState({
                    muralType: 'Starred',
                    murals: this.state.murals,
                  })
                }
                className={cx({
                  'mural-search-type-selected':
                    this.state.muralType === 'Starred',
                  'mural-search-type': true,
                })}
              >
                Starred
              </button>
              <button
                onClick={() =>
                  this.setState({ muralType: 'All', murals: this.state.murals })
                }
                className={cx({
                  'mural-search-type-selected': this.state.muralType === 'All',
                  'mural-search-type': true,
                })}
              >
                All
              </button>
            </div>
          )}

          {showFilters && (
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
            </div>
          )}
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

          {this.state.segue === Segue.SEARCHING &&
            this.state.workspace &&
            this.state.search && (
              <>
                <div>{`${this.state.murals.length} results for "${this.state.search}"`}</div>
                <CardList
                  murals={this.state.murals}
                  cardSize={cardSize}
                  onSelect={this.handleMuralSelect}
                  onCreate={this.handleCreate}
                  onError={this.handleError}
                  selectedMural={this.state.mural}
                  workspace={this.state.workspace}
                />
              </>
            )}
          {this.state.segue === Segue.CREATING &&
            this.state.room &&
            this.state.workspace && (
              <MuralCreate
                apiClient={this.apiClient}
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
