import Button from "@material-ui/core/Button";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import {
  ApiClient,
  Mural,
  Room,
  Workspace,
} from "@tactivos/mural-integrations-mural-client";
import * as React from "react";
import { MURAL_PICKER_ERRORS } from "../../common/errors";
import MuralPickerError from "../error";
import Header from "../header";
import Loading from "../loading";
import MuralSelect from "../mural-select";
import RoomSelect from "../room-select";
import WorkspaceSelect from "../workspace-select";
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
  handleError: (error: Error, message: string) => void;
  theme?: "light" | "dark";
  ListboxProps?: object | undefined;
  onMuralSelect: (mural: Mural) => void;
  hideLogo?: boolean;
}

interface StateTypes {
  isLoading: boolean;
  isSearchingMurals: boolean;
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
  searchedMurals: Mural[];
}

const INITIAL_STATE: StateTypes = {
  isLoading: true,
  isSearchingRooms: false,
  isSearchingMurals: false,
  workspaces: [],
  rooms: [],
  workspaceRooms: [],
  searchedRooms: [],
  murals: [],
  error: "",
  workspace: null,
  room: null,
  searchedMurals: [],
};

export default class MuralPickerBase extends React.Component<PropTypes> {
  state: StateTypes = INITIAL_STATE;

  async componentDidMount() {
    this.onLoading();
    try {
      const workspaces = await this.props.apiClient.getWorkspaces();
      if (workspaces?.length) {
        const workspace = workspaces[0];
        this.setState({ workspaces, workspace });
        await this.loadMuralsAndRoomsByWorkspace(workspace);
      }
    } catch (e) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_RETRIEVING_WORKSPACES);
    }
    this.onLoadingComplete();
  }

  onLoading = () => {
    this.setState({
      isLoading: true,
      error: "",
    });
  };

  onLoadingComplete = () => {
    this.setState({
      isLoading: false,
    });
  };

  onWorkspaceSelect = async (
    _: React.ChangeEvent<{}>,
    workspace: Workspace | null
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
        roomId: "",
        error: "",
      });
    }

    this.onLoading();

    try {
      const roomPromise = this.props.apiClient.getRoomsByWorkspace(
        workspace.id
      );
      const muralPromise = this.props.apiClient.getMuralsByWorkspace(
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
      this.onLoadingComplete();
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
   * mural selected with intent to open.
   * Behavior on action with intent to open determined by parent component.
   */
  onMuralSelect = () => {
    try {
      // send selected mural back to parent
      this.props.onMuralSelect(this.state.mural!);
    } catch (e) {
      this.handleError(e, MURAL_PICKER_ERRORS.ERR_SELECTING_MURAL);
    }
  };

  /**
   * Pass to child components to get mural search results
   */
  onMuralSearch = (searchedMurals: Mural[]) => {
    this.setState({
      searchedMurals,
      isSearchingMurals: false,
    });
  };

  /**
   * Pass to child component to get selected mural
   */
  onMuralPick = (mural: Mural | null) => {
    this.setState({
      mural,
      error: "",
    });
  };

  handleError = (e: Error, displayMsg: string) => {
    // display error and send back error data to caller
    this.setState({ error: displayMsg });
    this.props.handleError(e, displayMsg);
  };

  render() {
    const { hideLogo, theme } = this.props;
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
          <Header hideLogo={hideLogo} />
          <div className={"mural-picker-selects"}>
            <WorkspaceSelect
              workspace={this.state.workspace}
              workspaces={this.state.workspaces}
              ListboxProps={this.props.ListboxProps}
              onWorkspaceSelect={this.onWorkspaceSelect}
            ></WorkspaceSelect>

            <RoomSelect
              apiClient={this.props.apiClient}
              handleError={this.props.handleError}
              workspace={this.state.workspace}
              room={this.state.room}
              workspaceRooms={this.state.workspaceRooms}
              searchedRooms={this.state.searchedRooms}
              isSearchingRooms={this.state.isSearchingRooms}
              onRoomSelect={this.onRoomSelect}
              onRoomSearch={this.onRoomSearch}
              onLoading={this.onLoading}
              onLoadingComplete={this.onLoadingComplete}
            ></RoomSelect>
            <MuralSelect
              apiClient={this.props.apiClient}
              onMuralSearch={this.onMuralSearch}
              onMuralPick={this.onMuralPick}
              workspace={this.state.workspace}
              disabled={!this.state.workspace}
              murals={this.state.murals}
              searchedMurals={this.state.searchedMurals}
              isSearchingMurals={this.state.isSearchingMurals}
              handleError={this.props.handleError}
            ></MuralSelect>
          </div>
          <Button
            className="mural-select-button"
            disabled={!this.state.mural}
            onClick={this.onMuralSelect}
            color="secondary"
            size="large"
            variant="contained"
          >
            Open mural
          </Button>
          {this.state.error && <MuralPickerError error={this.state.error} />}
          {this.state.isLoading && <Loading />}
        </div>
      </ThemeProvider>
    );
  }
}
