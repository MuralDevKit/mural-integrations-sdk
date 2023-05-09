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
  Template,
} from '@muraldevkit/mural-integrations-mural-client';
import cx from 'classnames';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { MURAL_PICKER_ERRORS } from '../../common/errors';
import { getAllRoomsByWorkspace, getAllWorkspaces } from '../../common/get-all';
import { ReactSlot } from '../../common/react';
import { getCommonTrackingProperties } from '../../common/tracking-properties';
import CardList from '../card-list';
import { CardSize } from '../card-list-item';
import { BackButton, PrimaryButton } from '../common';
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
import { useDebounce } from '../../common/hooks/useDebounce';

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

// eslint-disable-next-line no-shadow
enum ViewType {
  CREATE = 'Create',
  RECENT = 'Recent',
  STARRED = 'Starred',
  ALL = 'All',
}

interface StateTypes {
  defaultWorkspace: Workspace | null;
  /** Currently selected workspace */
  workspace: Workspace | null;
  workspaces: Workspace[];

  /** Currently selected mural */
  mural: Mural | null;
  murals: Mural[];
  templates: Template[];

  defaultRooms: Room[] | null;
  /** Currently selected room */
  room: Room | null;
  rooms: Room[];
  viewType: ViewType;
  search: string;
  error: string;
  isLoading: boolean;
}

const useThemeOptions = defaultBuilder<ThemeOptions>({
  preset: 'light',
  cardSize: 'normal',
});

const useSlots = defaultBuilder<Slots>({
  Header: { Self: Header },
});

const DEFAULT_BLANK_TEMPLATE_NAME = 'Blank Template';
const DEFAULT_BLANK_TEMPLATE_ID =
  'gh&rishIOpNm-thON^43D-O&(8&hHjPle$-(kplP&Nm-ujlK8*0^';

const BLANK_TEMPLATE: Template = {
  id: DEFAULT_BLANK_TEMPLATE_ID,
  description: '',
  name: DEFAULT_BLANK_TEMPLATE_NAME,
  publicHash: '',
  thumbUrl: '',
  type: 'default',
  updatedOn: 0,
  workspaceId: '',
  viewLink: '',
} as const;

const MuralPicker = ({
  apiClient,
  slots,
  onSelect,
  disableCreate = false,
  theme,
  onError,
}: PropTypes) => {
  const [room, setRoom] = useState<StateTypes['room']>(null);
  const [rooms, setRooms] = useState<StateTypes['rooms']>([]);
  const [defaultRooms, setDefaultRooms] = useState<StateTypes['defaultRooms']>(
    [],
  );
  const [allMurals, setAllMurals] = useState<StateTypes['murals']>([]);
  const [recentMurals, setRecentMurals] = useState<StateTypes['murals']>([]);
  const [starredMurals, setStarredMurals] = useState<StateTypes['murals']>([]);
  const [murals, setMurals] = useState<StateTypes['murals']>([]);
  const [templates, setTemplates] = useState<StateTypes['templates']>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<
    StateTypes['templates']
  >([]);
  const [mural, setMural] = useState<StateTypes['mural']>(null);
  const [workspaces, setWorkspaces] = useState<StateTypes['workspaces']>([]);
  const [workspace, setWorkspace] = useState<StateTypes['workspace']>(null);
  const [defaultWorkspace, setDefaultWorkspace] =
    useState<StateTypes['defaultWorkspace']>(null);
  const [error, setError] = useState<StateTypes['error']>('');
  const [search, setSearch] = useState<StateTypes['search']>('');
  const [isLoading, setIsLoading] = useState<StateTypes['isLoading']>(false);
  const [viewType, setViewType] = useState<StateTypes['viewType']>(
    ViewType.RECENT,
  );

  const muralType: {
    [x: string]: Mural[];
  } = {
    Recent: recentMurals,
    Starred: starredMurals,
    All: allMurals,
  };
  // Clone the ApiClient to avoid impacting other consumers of the client
  // when we call abort()
  const apiClientRef = useRef(apiClient.clone());

  const trackDisplay = () => {
    // Track using the original ApiClient to avoid aborting these requests
    apiClient.track('Mural picker displayed', {
      ...getCommonTrackingProperties(),
      clientAppId: apiClient.config.appId,
      workspace: workspace?.name,
    });
  };

  const handleError = async (e: Error, displayMsg: string) => {
    // Ignore aborted request errors
    if (e.name === 'AbortError') {
      return;
    }
    setError(displayMsg);

    if (onError) {
      onError(e, displayMsg);
    }
  };

  const getInitialWorkspaceData = async () => {
    const [currentWorkspaces, currentUser] = await Promise.all([
      getAllWorkspaces(apiClientRef.current),
      apiClientRef.current.getCurrentUser(),
    ]);
    setWorkspaces(currentWorkspaces);
    const lastActiveWorkspaceId = currentUser.value.lastActiveWorkspace;
    if (currentWorkspaces.length) {
      const currentWorkspace =
        currentWorkspaces.find(w => w.id === lastActiveWorkspaceId) ||
        currentWorkspaces[0];
      setDefaultWorkspace(currentWorkspace);
      setWorkspace(currentWorkspace);
    }
  };

  useEffect(() => {
    getInitialWorkspaceData();
  }, []);

  useEffect(() => {
    const fetchRoomData = async () => {
      // don't need to re fetch on defaults
      if (defaultRooms?.length && workspace === defaultWorkspace) {
        setRooms(defaultRooms || []);
        setIsLoading(false);
      } else if (workspace) {
        try {
          const q = {
            workspaceId: workspace.id,
          };
          const uponRooms = await getAllRoomsByWorkspace(
            apiClientRef.current,
            q,
          );
          const sortedRooms = uponRooms.sort((a, b) =>
            a.name.localeCompare(b.name),
          );
          if (workspace === defaultWorkspace) {
            setDefaultRooms(sortedRooms);
            setIsLoading(false);
          }
          // room must be set for create view
          isCreateView ? setRoom(sortedRooms[0]) : setRoom(null);
          setRooms(sortedRooms);
        } catch (e: any) {
          handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_ROOMS);
        }
      }
    };
    fetchRoomData();
    // load rooms once workspace is available
  }, [workspace]);

  useEffect(() => {
    // handle initial room load
    if (viewType !== ViewType.ALL && viewType !== ViewType.CREATE) {
      // navigate to default tab after rooms are set to allow create mural
      handleSwitchTabs(ViewType.RECENT);
      trackDisplay();
    }
    // handle switching workspaces on all tab
    if (viewType === ViewType.ALL) {
      updateAllView();
    }
    // handle switching workspace on create view
    if (viewType === ViewType.CREATE && !search) {
      handleFetchTemplates();
    }
  }, [rooms]);

  const templateSearch = (q?: string) => {
    if (q) {
      const qEncoded = encodeURIComponent(q);
      return apiClientRef.current.searchCrossWorkspaceTemplates({
        q: qEncoded,
      });
    } else {
      if (workspace) {
        return apiClientRef.current.getTemplatesByWorkspace({
          workspaceId: workspace?.id,
        });
      }
    }
  };

  const muralSearch = (q: string) => {
    const qEncoded = encodeURIComponent(q);
    return apiClientRef.current.searchCrossWorkspaceMurals({ q: qEncoded });
  };

  const handleFetchTemplates = async () => {
    try {
      const templatesResult = await templateSearch();
      // do not append to prev state for search
      if (!search) {
        setTemplates(prevState => [
          ...prevState,
          ...(templatesResult?.value || []),
        ]);
      } else {
        setTemplates(templatesResult?.value || []);
      }
      setIsLoading(false);
    } catch (e: any) {
      handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_TEMPLATES);
      setIsLoading(false);
    }
  };

  const handleSwitchTabs = async (tab: ViewType, newMural?: any) => {
    setIsLoading(true);
    setError('');
    setRoom(null);
    setViewType(tab);
    // mural tab data exists
    if (muralType[tab].length > 0) {
      // add mural to Recent murals and select it
      if (newMural) {
        // recent tab to display new mural first and select it
        setRecentMurals([newMural.mural, ...muralType[tab]]);
        setMurals([newMural.mural, ...muralType[tab]]);
        setMural(newMural.mural);
        onSelect(newMural.mural, newMural.room, newMural.workspace!);
      } else {
        setMurals(muralType[tab]);
        if (tab === ViewType.ALL) {
          setWorkspace(defaultWorkspace);
        }
      }
      setIsLoading(false);
      // need to fetch mural tab data
    } else {
      setMurals([]);
      getMuralsByTab(tab);
    }
  };

  const getMuralsByTab = async (tab: string) => {
    switch (tab) {
      case 'Recent': {
        try {
          const recentMuralsResult =
            await apiClientRef.current.getCrossWorkspaceRecentMurals();
          setRecentMurals(recentMuralsResult?.value);
          setMurals(recentMuralsResult?.value);
          setIsLoading(false);
        } catch (e: any) {
          onError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_MURALS);
        }
        break;
      }
      case 'Starred': {
        try {
          const starredMuralsResult =
            await apiClientRef.current.getCrossWorkspaceStarredMurals();
          setStarredMurals(starredMuralsResult?.value);
          setMurals(starredMuralsResult?.value);
          setIsLoading(false);
        } catch (e: any) {
          onError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_MURALS);
        }
        break;
      }
      case 'All': {
        try {
          if (defaultWorkspace) {
            // this call has known performance issues
            const allMuralsResult =
              await apiClientRef.current.getMuralsByWorkspace({
                workspaceId: defaultWorkspace.id,
              });
            setRoom(null);
            setAllMurals(allMuralsResult?.value);
            setMurals(allMuralsResult?.value);
            setIsLoading(false);
          }
        } catch (e: any) {
          onError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_MURALS);
        }
        break;
      }
    }
  };

  const updateAllView = async () => {
    apiClientRef.current.abort();
    try {
      if (workspace) {
        // this call has known performance issues
        const allMuralsResult = await apiClientRef.current.getMuralsByWorkspace(
          {
            workspaceId: workspace?.id,
          },
        );
        setRoom(null);
        setMurals(allMuralsResult?.value);
        setIsLoading(false);
      }
    } catch (e: any) {
      onError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_MURALS);
    }
  };

  const handleWorkspaceSelect = async (currentWorkspace?: Workspace | null) => {
    // Abort in-flight requests
    apiClientRef.current.abort();
    if (currentWorkspace) {
      if (viewType === ViewType.ALL) {
        setIsLoading(true);
      }
      setError('');
      setMurals([]);
      setWorkspace(currentWorkspace);
    }
  };

  const handleRoomSelect = async (selectedRoom: Room | null) => {
    if (!selectedRoom) {
      return handleWorkspaceSelect(workspace);
    }
    // Abort in-flight requests
    apiClientRef.current.abort();

    try {
      // nothing loads for create view changes
      setRoom(selectedRoom);
      if (viewType === ViewType.ALL) {
        setIsLoading(true);
        if (selectedRoom) {
          const q = {
            roomId: selectedRoom.id,
          };
          const eMurals = await apiClientRef.current.getMuralsByRoom(q);
          setMurals(eMurals.value);
          setIsLoading(false);
        }
      }
    } catch (e: any) {
      handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_ROOM_MURALS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMuralSelect = (selectedMural: Mural) => {
    try {
      setError('');
      setMural(selectedMural);
      onSelect(selectedMural, room, workspace!);
    } catch (e: any) {
      handleError(e, MURAL_PICKER_ERRORS.ERR_SELECTING_MURAL);
    }
  };

  const handleViewCreate = async (fromSearch?: boolean) => {
    setSearch('');
    setViewType(ViewType.CREATE);
    try {
      if (fromSearch) {
        // use existing rooms
        const templatesResult = await templateSearch();
        // ensuring only 1 blank template
        setTemplates([
          ...new Set([...[BLANK_TEMPLATE], ...(templatesResult?.value || [])]),
        ]);
      } else {
        // set defaults
        setRoom(defaultRooms ? defaultRooms[0] : null);
        setWorkspace(defaultWorkspace);
        if (defaultTemplates.length > 0) {
          setTemplates(defaultTemplates);
        } else {
          // get first time defaults
          setIsLoading(true);
          const templatesResult = await templateSearch();
          // ensuring only 1 blank template
          const defaultTemps = [
            ...new Set([
              ...[BLANK_TEMPLATE],
              ...(templatesResult?.value || []),
            ]),
          ];
          setDefaultTemplates(defaultTemps);
          setTemplates(defaultTemps);
        }
      }
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      onError(
        e,
        fromSearch
          ? MURAL_PICKER_ERRORS.ERR_SEARCH_TEMPLATES
          : MURAL_PICKER_ERRORS.ERR_RETRIEVING_TEMPLATES,
      );
    }
  };

  const handleClickCreate = async () => {
    handleViewCreate();
  };

  const handleFinishCreation = async (
    newMural: Mural,
    currentRoom: Room,
    currentWorkspace: Workspace,
  ) => {
    setSearch('');
    // switch tabs and show new mural
    handleSwitchTabs(ViewType.RECENT, {
      mural: newMural,
      room: currentRoom,
      workspace: currentWorkspace,
    });
  };

  const debouncedSearch = useDebounce(search, 1000);

  useEffect(() => {
    const loadSearchResults = async () => {
      if (debouncedSearch.length <= 2) {
        setIsLoading(false);
        setError('Please enter at least 3 characters to search');
        return;
      }
      try {
        if (viewType === ViewType.CREATE) {
          const eTemplates = await templateSearch(debouncedSearch);
          setTemplates(eTemplates?.value.length ? eTemplates?.value : []);
          setIsLoading(false);
        } else {
          const eMurals = await muralSearch(debouncedSearch);
          setMurals(eMurals?.value.length ? eMurals?.value : []);
          setIsLoading(false);
        }
      } catch (e: any) {
        onError(
          e,
          viewType == ViewType.CREATE
            ? MURAL_PICKER_ERRORS.ERR_SEARCH_TEMPLATES
            : MURAL_PICKER_ERRORS.ERR_SEARCH_MURALS,
        );
        setIsLoading(false);
      }
    };
    if (debouncedSearch !== '') {
      setIsLoading(true);
      loadSearchResults();
    } else {
      // clearing search on create page should take you back to create view
      if (viewType === 'Create') {
        handleViewCreate(true);
      } else {
        // clearing search should take you back to prev view
        handleSwitchTabs(viewType);
      }
    }
  }, [debouncedSearch]);

  const handleSearchChange = (event: { target: { value: string } }) => {
    setMurals([]);
    setTemplates([]);
    setIsLoading(true);
    setError('');
    setSearch(event.target.value);
  };

  const renderPartialHeader = () => {
    // should not be a slot because we want uniform interactions?
    // render slot for empty space on other side (ppl pass logout)
    // render search + back button
    const currentSlots = useSlots(slots);
    const isCreateView = viewType === ViewType.CREATE;
    const title = isCreateView ? 'Search for templates' : 'Search for murals';
    if (isCreateView || search) {
      currentSlots.Header.Action = (props: any) => (
        <BackButton
          onClick={() => {
            setTemplates([]);
            setSearch('');
            setError('');
            isCreateView && search
              ? handleViewCreate()
              : handleSwitchTabs(isCreateView ? ViewType.RECENT : viewType);
          }}
          {...props}
        >
          <SvgIcon>
            <BackArrow />
          </SvgIcon>
        </BackButton>
      );
    } else {
      currentSlots.Header.Action = () => null;
    }

    return (
      <>
        <currentSlots.Header.Self
          slots={{ ...currentSlots.Header }}
        ></currentSlots.Header.Self>
        <TextField
          className="search-input"
          value={search}
          onChange={handleSearchChange}
          variant="outlined"
          label={title}
          placeholder={title}
        />
      </>
    );
  };
  const renderTabButton = (tab: ViewType) => {
    return (
      <button
        onClick={() => handleSwitchTabs(tab)}
        className={cx({
          'mural-search-type-selected': viewType === tab,
          'mural-search-type': true,
        })}
      >
        {tab}
      </button>
    );
  };

  const { preset, cardSize } = useThemeOptions(theme);
  const currentSlots = useSlots(slots);
  const createdTheme = createTheme(preset);
  const isSearching = search;
  const isCreateView = viewType === ViewType.CREATE;
  const isStarredView = viewType === ViewType.STARRED;
  const isRecentView = viewType === ViewType.RECENT;
  const isAllView = viewType === ViewType.ALL;
  // do not show filters on tabs (except all), do not show on tab search views
  const showFilters =
    !isRecentView && !isStarredView && !(isAllView && isSearching);
  !(isRecentView && isSearching) && !(isStarredView && isSearching);
  const showTabs = !isSearching && !isCreateView;
  const showCreateBtn = !isCreateView && !disableCreate;
  const displayCreateView =
    (isCreateView || (isCreateView && isSearching)) && room && workspace;
  return (
    <ThemeProvider theme={createdTheme}>
      <Box className={`mural-picker-body ${preset}`} data-qa="mural-picker">
        <div className="mural-header-row">
          {renderPartialHeader()}
          {showCreateBtn && (
            <FormControl
              className="mural-create-control"
              data-qa="mural-picker-control"
            >
              <PrimaryButton
                color="primary"
                disabled={!(defaultRooms && defaultRooms[0])}
                onClick={handleClickCreate}
                title="Create new mural"
              >
                <SvgIcon>
                  <Plus />
                </SvgIcon>
                <span>New mural</span>
              </PrimaryButton>
            </FormControl>
          )}
        </div>
        {showTabs && (
          <div className="mural-search-type-container">
            {renderTabButton(ViewType.RECENT)}
            {renderTabButton(ViewType.STARRED)}
            {renderTabButton(ViewType.ALL)}
          </div>
        )}

        {showFilters && (
          <div className={cx('mural-picker-selects')}>
            <WorkspaceSelect
              workspace={workspace}
              workspaces={workspaces}
              onSelect={handleWorkspaceSelect}
            />
            <RoomSelect
              workspace={workspace}
              room={room}
              rooms={rooms}
              onSelect={handleRoomSelect}
              slots={currentSlots.RoomSelect}
            />
          </div>
        )}

        {search && (
          <div>{`${
            isCreateView ? templates.length : murals.length
          } results for "${search}"`}</div>
        )}
        {error && <MuralPickerError error={error} />}
        {isLoading && <Loading />}
        {!isLoading && murals && !isCreateView && (
          <CardList
            murals={murals}
            cardSize={cardSize}
            onSelect={handleMuralSelect}
            onCreate={handleClickCreate}
            onError={handleError}
            selectedMural={mural}
          />
        )}

        {displayCreateView && (
          <MuralCreate
            // fetchTemplates={handleFetchTemplates}
            apiClient={apiClientRef.current}
            cardSize={cardSize}
            onError={handleError}
            onCreate={handleFinishCreation}
            room={isCreateView ? room : defaultRooms![0]}
            templates={templates}
            workspace={workspace}
          />
        )}
      </Box>
    </ThemeProvider>
  );
};
export default MuralPicker;
