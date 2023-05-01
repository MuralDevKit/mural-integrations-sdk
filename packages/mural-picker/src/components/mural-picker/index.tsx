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
import { useState, useEffect, useRef } from 'react';
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

export interface PropTypes {
  apiClient: ApiClient;
  onError: EventHandler<[error: Error, message: string]>;
  onSelect: EventHandler<
    [mural: Mural, room: Room | null, workspace: Workspace]
  >;

  theme?: DeepPartial<ThemeOptions>;
  slots?: DeepPartial<Slots>;
  disableCreate?: boolean;
}

enum Segue {
  CREATING = 'creating',
  LOADING = 'loading',
  SEARCHING = 'searching',
  PICKING = 'picking',
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

const useThemeOptions = defaultBuilder<ThemeOptions>({
  preset: 'light',
  cardSize: 'normal',
});

const useSlots = defaultBuilder<Slots>({
  Header: { Self: Header },
});

const MuralPicker = ({
  apiClient,
  slots,
  onSelect,
  disableCreate = false,
  theme,
  onError,
}: PropTypes) => {
  const [state, setState] = useState<StateTypes>({
    segue: Segue.LOADING,
    workspaces: [],
    workspace: null,
    rooms: [],
    room: null,
    murals: [],
    mural: null,
    muralType: 'Recent',
    search: '',
    error: '',
  });

  // Clone the ApiClient to avoid impacting other consumers of the client
  // when we call abort()
  const apiClientRef = useRef(apiClient.clone());

  const transition = (to: Segue) => setState({ ...state, segue: to });

  const trackDisplay = () => {
    // Track using the original ApiClient to avoid aborting these requests
    apiClient.track('Mural picker displayed', {
      ...getCommonTrackingProperties(),
      clientAppId: apiClient.config.appId,
      workspace: state.workspace?.name,
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        transition(Segue.LOADING);

        const [workspaces, currentUser] = await Promise.all([
          getAllWorkspaces(apiClientRef.current),
          apiClientRef.current.getCurrentUser(),
        ]);
        const lastActiveWorkspaceId = currentUser.value.lastActiveWorkspace;

        if (workspaces.length) {
          const workspace =
            workspaces.find(w => w.id === lastActiveWorkspaceId) ||
            workspaces[0];

          await handleWorkspaceSelect(workspace);

          const roomsUnsorted = await getAllRoomsByWorkspace(
            apiClientRef.current,
            {
              workspaceId: workspace.id,
            },
          );

          const rooms = roomsUnsorted.sort((a, b) =>
            b.type.localeCompare(a.type),
          );

          setState({
            ...state,
            workspaces,
            workspace,
            rooms,
            room: null,
          });
          trackDisplay();
        }
      } catch (e: any) {
        handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_WORKSPACES);
      } finally {
        transition(Segue.PICKING);
      }
    };
    fetchInitialData();
  }, []);

  const handleWorkspaceSelect = async (workspace: Workspace | null) => {
    // Abort in-flight requests
    apiClientRef.current.abort();

    if (!workspace) {
      // clear selections
      setState({
        ...state,
        workspace: null,
        murals: [],
        mural: null,
        rooms: [],
        room: null,
        error: '',
      });
      return;
    }

    try {
      transition(Segue.LOADING);

      const q = {
        workspaceId: workspace.id,
      };

      const [uponRooms, uponMurals] = await Promise.all([
        getAllRoomsByWorkspace(apiClientRef.current, q),
        apiClientRef.current.getMuralsByWorkspace(q),
      ]);

      const rooms = uponRooms.sort((a, b) => b.type.localeCompare(a.type));

      setState({
        ...state,
        workspace,
        rooms: rooms,
        murals: uponMurals.value,

        // Reset the currently selected room
        room: null,
      });
    } catch (e: any) {
      handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_ROOM_AND_MURALS);
    } finally {
      transition(Segue.PICKING);
    }
  };

  const handleRoomSelect = async (room: Room | null) => {
    if (!room) {
      return handleWorkspaceSelect(state.workspace);
    }

    // Abort in-flight requests
    apiClientRef.current.abort();

    try {
      transition(Segue.LOADING);
      const q = {
        roomId: room.id,
      };

      const eMurals = await apiClientRef.current.getMuralsByRoom(q);

      setState({
        ...state,
        room: room,
        murals: eMurals.value,
      });
    } catch (e: any) {
      handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_MURALS);
    } finally {
      transition(Segue.PICKING);
    }
  };

  const handleMuralSelect = (mural: Mural) => {
    try {
      setState({
        ...state,
        error: '',
        mural,
      });
      onSelect(mural, state.room, state.workspace!);
    } catch (e: any) {
      handleError(e, MURAL_PICKER_ERRORS.ERR_SELECTING_MURAL);
    }
  };

  const handleCreate = async () => {
    if (!state.workspace) {
      return setState({ ...state, workspace: state.workspaces[0] });
    }

    if (!state.room) {
      return setState({ ...state, room: state.rooms[0] });
    }

    setState({
      ...state,
      error: '',
      segue: Segue.CREATING,
      mural: null,
    });
  };

  const setInitialState = () => {
    setState({ ...state, segue: Segue.PICKING, search: '' });
  };

  const handleFinishCreation = async (mural: Mural) => {
    setInitialState();

    // Let's add this new mural to our list of displayed mural
    setState(prevState => ({
      ...prevState,
      mural,
      murals: [mural, ...prevState.murals],
    }));

    onSelect(mural, state.room, state.workspace!);
  };

  const handleError = async (e: Error, displayMsg: string) => {
    // Ignore aborted request errors
    if (e.name === 'AbortError') {
      return;
    }

    setState({ ...state, error: displayMsg });

    if (onError) {
      onError(e, displayMsg);
    }
  };

  const renderPartialHeader = () => {
    const currentSlots = useSlots(slots);
    let title;

    switch (state.segue) {
      case Segue.CREATING:
        title = 'Search for templates';
        currentSlots.Header.Action = (props: any) => (
          <BackButton onClick={setInitialState} {...props}>
            <SvgIcon>
              <BackArrow />
            </SvgIcon>
          </BackButton>
        );
        break;
      case Segue.SEARCHING:
        title = 'Search for murals';
        currentSlots.Header.Action = (props: any) => (
          <BackButton onClick={setInitialState} {...props}>
            <SvgIcon>
              <BackArrow />
            </SvgIcon>
          </BackButton>
        );
        break;
      case Segue.PICKING:
        title = 'Search for murals';
        currentSlots.Header.Action = () => null;
        break;
    }

    return (
      <>
        <currentSlots.Header.Self
          slots={{ ...currentSlots.Header }}
        ></currentSlots.Header.Self>
        <TextField
          className="search-input"
          value={state.search}
          onChange={event => {
            console.log(event.target.value);
            return setState({
              ...state,
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
  };

  const { preset, cardSize } = useThemeOptions(theme);
  const currentSlots = useSlots(slots);
  const createdTheme = createTheme(preset);
  const { search, segue, muralType } = state;
  const showFilters =
    !search && (segue === Segue.CREATING || muralType == 'All');
  const showTabs =
    !search &&
    (muralType == 'All' || muralType == 'Recent' || muralType == 'Starred');

  return (
    <ThemeProvider theme={createdTheme}>
      <Box className={`mural-picker-body ${preset}`} data-qa="mural-picker">
        <div className="mural-header-row">
          {renderPartialHeader()}
          {!disableCreate && (
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
                      disabled={!state.room}
                      onClick={handleCreate}
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
                setState({
                  ...state,
                  muralType: 'Recent',
                  murals: state.murals,
                })
              }
              className={cx({
                'mural-search-type-selected': state.muralType === 'Recent',
                'mural-search-type': true,
              })}
            >
              Recent
            </button>
            <button
              onClick={() =>
                setState({
                  ...state,
                  muralType: 'Starred',
                  murals: state.murals,
                })
              }
              className={cx({
                'mural-search-type-selected': state.muralType === 'Starred',
                'mural-search-type': true,
              })}
            >
              Starred
            </button>
            <button
              onClick={() =>
                setState({
                  ...state,
                  muralType: 'All',
                  murals: state.murals,
                })
              }
              className={cx({
                'mural-search-type-selected': state.muralType === 'All',
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
              workspace={state.workspace}
              workspaces={state.workspaces}
              onSelect={handleWorkspaceSelect}
              slots={currentSlots.WorkspaceSelect}
            />
            <RoomSelect
              workspace={state.workspace}
              room={state.room}
              rooms={state.rooms}
              onSelect={handleRoomSelect}
              slots={currentSlots.RoomSelect}
            />
          </div>
        )}
        {state.error && <MuralPickerError error={state.error} />}
        {state.segue === Segue.LOADING && <Loading />}
        {state.segue === Segue.PICKING && state.workspace && (
          <CardList
            murals={state.murals}
            cardSize={cardSize}
            onSelect={handleMuralSelect}
            onCreate={handleCreate}
            onError={handleError}
            selectedMural={state.mural}
            workspace={state.workspace}
          />
        )}

        {state.segue === Segue.SEARCHING && state.workspace && state.search && (
          <>
            <div>{`${state.murals.length} results for "${state.search}"`}</div>
            <CardList
              murals={state.murals}
              cardSize={cardSize}
              onSelect={handleMuralSelect}
              onCreate={handleCreate}
              onError={handleError}
              selectedMural={state.mural}
              workspace={state.workspace}
            />
          </>
        )}
        {state.segue === Segue.CREATING && state.room && state.workspace && (
          <MuralCreate
            apiClient={apiClientRef.current}
            cardSize={cardSize}
            onError={handleError}
            onCreate={handleFinishCreation}
            onCancel={setInitialState}
            room={state.room}
            workspace={state.workspace}
          />
        )}
      </Box>
    </ThemeProvider>
  );
};
export default MuralPicker;
