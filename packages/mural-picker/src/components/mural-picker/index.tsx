import * as React from "react";
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
} from "mural-integrations-mural-client";
// @ts-ignore
import MuralIcon from "mural-integrations-common/assets/icon.png";
import { CardSize } from "../mural-card";
import MuralList from "../mural-list";
import "./styles.scss";

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
  onCreateMural: (
    mural: CreateMuralData
  ) => Promise<CreateMuralResult | undefined>;
  onMuralSelect: (mural: Mural) => void;
  handleError: (error: Error, message: string) => void;
  cardSize?: CardSize;
  hideLogo?: boolean;
  hideAddButton?: boolean;
  theme?: "light" | "dark";
}

interface StateTypes {
  isCreateSelected: boolean;
  isLoading: boolean;
  workspaces: WorkSpace[];
  rooms: Room[];
  murals: Mural[];
  mural?: Mural;
  error: string;
  workspace: WorkSpace | null;
  room: Room | null;
}

const INITIAL_STATE: StateTypes = {
  isCreateSelected: false,
  isLoading: true,
  workspaces: [],
  rooms: [],
  murals: [],
  error: "",
  workspace: null,
  room: null,
};

export default class MuralPicker extends React.Component<PropTypes> {
  state: StateTypes = INITIAL_STATE;

  async componentDidMount() {
    this.setState({ isLoading: true });
    try {
      const workspaces = await this.props.apiClient.getAllWorkSpaces();
      if (workspaces?.length) {
        this.setState({ workspaces });
        await this.loadMuralsAndRoomsByWorkspace(workspaces[0]);
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
      });
    }

    this.setState({ isLoading: true });

    try {
      const roomPromise = this.props.apiClient.getRoomsByWorkspace(
        workspace.id
      );
      const muralPromise = this.props.apiClient.getMuralsByWorkspaceId(
        workspace.id
      );
      const [rooms, murals] = await Promise.all([roomPromise, muralPromise]);
      const sortedRooms = rooms.sort((a, b) => b.type.localeCompare(a.type));
      this.setState({
        isLoading: false,
        workspace,
        rooms: sortedRooms,
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
          this.setState({ isLoading: true });
          murals = await this.props.apiClient.getMuralsByWorkspaceId(
            this.state.workspace.id
          );
        } catch (e) {
          this.setState({ isLoading: false });
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
      this.setState({ isLoading: true });

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
      this.handleError(e, "Error selecting mural.");
    }
  };

  onCreateMural = async (_?: string) => {
    // TODO: incorporate template selection when public API is ready
    if (!this.state.workspace) {
      return this.setState({ error: "Please select a workspace." });
    }
    if (!this.state.room) {
      return this.setState({ error: "Please select a room." });
    }

    this.setState({
      error: "",
      isCreateSelected: true,
      mural: undefined,
    });

    const result = await this.props.onCreateMural({
      roomId: this.state.room.id,
      title: "", // leaving title blank for now
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
              />
            </div>
          </FormControl>
          <FormControl className="mural-picker-select" data-qa="room-select">
            <div className="select-label">
              <InputLabel shrink>ROOM</InputLabel>
            </div>
            <Autocomplete
              id="room-select"
              options={this.state.rooms}
              getOptionLabel={(option) => {
                return option?.name || "";
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Find a room..."
                  variant="outlined"
                />
              )}
              value={this.state.room}
              disabled={!this.state.workspace}
              groupBy={this.getRoomGroup}
              onChange={this.onRoomSelect}
            />
          </FormControl>
          {/* TODO: add search */}
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
              cardSize={cardSize || "normal"}
              hideAddButton={!!this.props.hideAddButton}
            />
          )}

          {/* TODO: add create-new-mural flow */}
        </div>
      </ThemeProvider>
    );
  }
}
