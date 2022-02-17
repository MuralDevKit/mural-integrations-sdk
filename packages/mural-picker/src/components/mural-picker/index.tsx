import * as React from "react";
import { debounce } from "lodash";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  TextField,
} from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  ApiClient,
  Mural,
  Room,
  WorkSpace,
  Template,
} from "@tactivos/mural-integrations-mural-client";
// @ts-ignore
import MuralIcon from "@tactivos/mural-integrations-common/assets/icon.png";
import { CardSize } from "../mural-card";
import MuralList from "../mural-list";
import { DELAYS } from "../../common/delays";
import "./styles.scss";
import CreateNewMural from "../create-new-mural";

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
  onCreateMural: (mural: Mural) => void;
  onMuralSelect: (mural: Mural) => void;
  handleError: (error: Error, message: string) => void;
  cardSize?: CardSize;
  hideLogo?: boolean;
  hideAddButton?: boolean;
  theme?: "light" | "dark";
  ListboxProps?: object | undefined;
}

interface StateTypes {
  isCreateSelected: boolean;
  isLoading: boolean;
  workspaces: WorkSpace[];
  rooms: Room[];
  workspaceRooms: Room[];
  searchedRooms: Room[];
  murals: Mural[];
  mural?: Mural;
  error: string;
  workspace: WorkSpace | null;
  room: Room | null;
  searchingRooms: boolean;
  templates: Template[];
}

const INITIAL_STATE: StateTypes = {
  isCreateSelected: false,
  isLoading: true,
  workspaces: [],
  rooms: [],
  workspaceRooms: [],
  searchedRooms: [],
  murals: [],
  error: "",
  workspace: null,
  room: null,
  searchingRooms: false,
  templates: [],
};

export default class MuralPicker extends React.Component<PropTypes> {
  state: StateTypes = INITIAL_STATE;

  async componentDidMount() {
    this.setState({ isLoading: true });
    try {
      const workspaces = await this.props.apiClient.getAllWorkSpaces();
      if (workspaces?.length) {
        const workspace = workspaces[0];
        this.setState({ workspaces, workspace });
        await this.loadMuralsAndRoomsByWorkspace(workspace);
      }
    } catch (e) {
      this.handleError(e, "Error retrieving workspaces.");
    }
    this.setState({ isLoading: false });
  }

  onWorkspaceSelect = async (
    _: React.ChangeEvent<{}>,
    workspace: WorkSpace | null
  ) => {
    await this.loadMuralsAndRoomsByWorkspace(workspace);
  };

  loadMuralsAndRoomsByWorkspace = async (workspace: WorkSpace | null) => {
    if (!workspace) {
      // clear selections
      return this.setState({
        workspace: null,
        murals: [],
        rooms: [],
        roomId: "",
        error: "",
      });
    }

    this.setState({ isLoading: true, error: "" });

    try {
      const roomPromise = this.props.apiClient.getRoomsByWorkspace(
        workspace.id
      );
      const muralPromise = this.props.apiClient.getMuralsByWorkspaceId(
        workspace.id
      );
      const [rooms, murals] = await Promise.all([roomPromise, muralPromise]);
      const sortedRooms: Room[] = rooms.sort((a, b) =>
        b.type.localeCompare(a.type)
      );
      this.setState({
        isLoading: false,
        workspace,
        workspaceRooms: sortedRooms,
        murals,
        roomId: "",
        room: null,
      });
    } catch (e) {
      this.setState({ isLoading: false });
      this.handleError(e, "Error retrieving room and murals.");
    }
  };

  onRoomSelect = async (_: React.ChangeEvent<{}>, room: Room | null) => {
    if (!room || !this.state.workspace) {
      let murals: Mural[] = [];
      if (this.state.workspace) {
        try {
          this.setState({ isLoading: true, error: "" });
          murals = await this.props.apiClient.getMuralsByWorkspaceId(
            this.state.workspace.id
          );
        } catch (e) {
          this.handleError(e, "Error retrieving room and murals.");
        }
      }
      return this.setState({
        room: null,
        murals,
        isLoading: false,
      });
    }
    try {
      this.setState({ isLoading: true, error: "" });

      const murals = await this.props.apiClient.getMuralsByRoom(room.id);

      this.setState({
        isLoading: false,
        murals,
        room,
      });
    } catch (e) {
      this.setState({ isLoading: false });
      this.props.handleError(e, "Error retrieving room murals.");
    }
  };

  onMuralSelect = (mural: Mural) => {
    try {
      // send selected mural back to parent
      this.props.onMuralSelect(mural);

      this.setState({
        error: "",
        isCreateSelected: false,
        mural,
      });
    } catch (e) {
      this.props.handleError(e, "Error selecting mural.");
    }
  };

  onRoomSearch = debounce(async (title: string) => {
    if (this.state.workspace && title.length > 2) {
      try {
        this.setState({ searchingRooms: true });
        const rooms: Room[] = await this.props.apiClient.searchWorkspaceRooms(
          this.state.workspace.id,
          title
        );
        this.setState({ searchedRooms: rooms, searchingRooms: false });
      } catch (e) {
        this.setState({ searchingRooms: false });
        this.props.handleError(e, "Error searching rooms.");
      }
    } else {
      this.setState({ searchedRooms: [] });
    }
  }, DELAYS.DEBOUNCE_SEARCH);

  loadTemplates = async () => {
    try {
      const templates: Template[] = await this.props.apiClient.getTemplates();
      this.setState({ templates });
    } catch (e) {
      this.props.handleError(e, "Error getting templates.");
    }
  };

  onCreateMural = async (title: string, template: Template) => {
    try {
      if (!title) {
        return this.setState({ error: "Please enter a title for a new Mural." });
      }

      if (!template) {
        return this.setState({ error: "Please select a template." }); 
      }
      const newMural = await this.props.apiClient.createMuralFromTemplate(
        title,
        this.state!.room!.id,
        template.id
      );
      console.log("==== New Mural =====", newMural);
      console.log("====== State ======", this.state);

      // todo Need to pass a new mural in to a callback for use it in the outer app.

      this.props.onCreateMural(newMural.value);
    } catch (e) {
      this.props.handleError(e, "Error creating a new mural.");
    }

    // if (result?.error) {
    //   this.setState({
    //     error: result.error,
    //   });
    // }
  };

  onCreateMuralButtonHandler = async () => {
    if (!this.state.workspace) {
      return this.setState({ error: "Please select a workspace." });
    }
    if (!this.state.room) {
      return this.setState({ error: "Please select a room." });
    }
    if (!this.state.templates.length) {
      await this.loadTemplates();
    }

    this.setState({
      error: "",
      isCreateSelected: true,
      mural: undefined,
    });
  };

  onCancelAndGoBack() {
    this.setState((state) => {
      return { ...state, isCreateSelected: false };
    });
  }

  handleError = (e: Error, displayMsg: string) => {
    // display error and send back error data to caller
    this.setState({ error: displayMsg });
    this.props.handleError(e, displayMsg);
  };

  getRoomGroup = (room?: Room) => {
    if (!room) return "";
    return room.type === "private" ? "PRIVATE ROOMS" : "OPEN ROOMS";
  };

  render() {
    const { cardSize, hideLogo, theme } = this.props;
    const currentTheme = theme || "light";
    const muiTheme = createMuiTheme({
      palette: {
        type: currentTheme,
        text: { primary: currentTheme === "light" ? "#585858" : "#a7a7a7" },
      },
    });

    return (
      <ThemeProvider theme={muiTheme}>
        <div className={`mural-picker-body ${theme}`} data-qa="mural-picker">
          <h2>
            {!hideLogo && (
              <img
                className="choose-mural-logo"
                src={MuralIcon}
                alt="Mural logo"
              />
            )}
            <span className="choose-mural-title">Choose a mural</span>
          </h2>
          <div className={"mural-picker-selects"}>
            <FormControl
              className="mural-picker-select"
              data-qa="workspace-select"
            >
              <div className="select-label">
                <InputLabel shrink>WORKSPACE</InputLabel>
              </div>
              <div className="workspace-list">
                <Autocomplete
                  id="workspace-select"
                  options={this.state.workspaces}
                  ListboxProps={this.props.ListboxProps}
                  getOptionLabel={(option) => {
                    return option.name || "";
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Find a workspace..."
                      variant="outlined"
                    />
                  )}
                  value={this.state.workspace}
                  groupBy={() => "SWITCH TO"}
                  onChange={this.onWorkspaceSelect}
                  noOptionsText={"No results"}
                />
              </div>
            </FormControl>
            <FormControl className="mural-picker-select" data-qa="room-select">
              <div className="select-label">
                <InputLabel shrink>ROOM</InputLabel>
              </div>
              <Autocomplete
                id="room-select"
                options={
                  this.state.searchedRooms.length === 0
                    ? this.state.workspaceRooms
                    : this.state.searchedRooms
                }
                ListboxProps={this.props.ListboxProps}
                getOptionLabel={(option) => {
                  return option?.name || "";
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Find a room..."
                    variant="outlined"
                    inputProps={{
                      ...params.inputProps,
                      "data-qa": "input-room-select",
                    }}
                  />
                )}
                value={this.state.room}
                disabled={!this.state.workspace}
                groupBy={this.getRoomGroup}
                onChange={this.onRoomSelect}
                onInputChange={(
                  event: React.ChangeEvent<{}>,
                  input: string
                ) => {
                  if (event && event.type === "change") {
                    this.onRoomSearch(input);
                  }
                }}
                onClose={(_event: React.ChangeEvent<{}>, _reason: string) => {
                  this.setState({ searchedRooms: [] });
                }}
                getOptionSelected={(option: Room, value: Room) =>
                  option.id === value.id
                }
                loading={this.state.searchingRooms}
                noOptionsText={"No results"}
              />
            </FormControl>
          </div>
          {this.state.error && (
            <div data-qa="mural-picker-error">
              <Alert severity="error" className="mural-picker-error">
                {this.state.error}
              </Alert>
            </div>
          )}

          {this.state.isLoading && (
            <div className="mural-list-spinner">
              <CircularProgress />
            </div>
          )}
          {!this.state.isCreateSelected && !this.state.isLoading && (
            <MuralList
              workspace={this.state.workspace}
              room={this.state.room}
              isCreateSelected={this.state.isCreateSelected}
              murals={this.state.murals}
              selectedMural={this.state.mural}
              onMuralSelect={this.onMuralSelect}
              onCreateMuralButtonHandler={this.onCreateMuralButtonHandler}
              handleError={this.handleError}
              cardSize={cardSize || "normal"}
              hideAddButton={!!this.props.hideAddButton}
            />
          )}

          {/* TODO: add create-new-mural flow */}
          {this.state.isCreateSelected && this.state.room && (
            <React.Fragment>
              <CreateNewMural
                templates={this.state.templates}
                token=""
                onCancelAndGoBack={this.onCancelAndGoBack.bind(this)}
                onCreateMural={this.onCreateMural}
                room={this.state.room.id}
              />
            </React.Fragment>
          )}
        </div>
      </ThemeProvider>
    );
  }
}
