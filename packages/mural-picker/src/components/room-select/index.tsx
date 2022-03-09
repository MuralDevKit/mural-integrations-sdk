import { FormControl, InputLabel, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  ApiClient,
  Mural,
  Room,
  Workspace,
} from '@tactivos/mural-integrations-mural-client';
import { debounce } from 'lodash';
import * as React from 'react';
import { DELAYS } from '../../common/delays';

// TODO: move to common file
// eslint-disable-next-line no-shadow
enum ERRORS {
  ERR_RETRIEVING_MURALS = 'Error retrieving murals.',
  ERR_RETRIEVING_WORKSPACES = 'Error retrieving workspaces.',
  ERR_RETRIEVING_ROOM_AND_MURALS = 'Error retrieving room and murals.',
  ERR_RETRIEVING_ROOM_MURALS = 'Error retrieving room murals.',
  ERR_SELECTING_MURAL = 'Error selecting mural.',
  ERR_SELECT_WORKSPACE = 'Please select a workspace.',
  ERR_SELECT_ROOM = 'Please select a room.',
  ERR_SELECT_MURAL = 'Please select a mural.',
  ERR_SEARCH_NO_MURALS_FOUND = 'No murals found.',
  ERR_SEARCH_MURALS = 'Error searching for murals.',
}

interface PropTypes {
  apiClient: ApiClient;
  handleError: (error: Error, message: string) => void;
  workspace: Workspace | null;
  room: Room | null;
  workspaceRooms: Room[];
  searchedRooms: Room[];
  isSearchingRooms: boolean;
  ListboxProps?: object | undefined;
  onRoomSelect: (room: Room | null, murals: Mural[]) => void;
  onRoomSearch: (searchedRooms: Room[]) => void;
  onLoading: () => void;
  onLoadingComplete: () => void;
}

export default class RoomSelect extends React.Component<PropTypes> {
  state = {
    isSearchingRooms: false,
  };

  onRoomSearch = debounce(async (title: string) => {
    if (this.props.workspace && title.length > 2) {
      try {
        this.setState({ isSearchingRooms: true });
        const rooms: Room[] = await this.props.apiClient.searchRoomsByWorkspace(
          this.props.workspace.id,
          title,
        );
        this.setState({ isSearchingRooms: false });
        this.props.onRoomSearch(rooms);
      } catch (e) {
        this.setState({ isSearchingRooms: false });
        this.props.handleError(e, 'Error searching rooms.');
      }
    } else {
      this.props.onRoomSearch([]);
    }
  }, DELAYS.DEBOUNCE_SEARCH);

  onRoomSelect = async (_: React.ChangeEvent<{}>, room: Room | null) => {
    if (!room || !this.props.workspace) {
      let murals: Mural[] = [];
      if (this.props.workspace) {
        try {
          this.props.onLoading();
          murals = await this.props.apiClient.getMuralsByWorkspace(
            this.props.workspace.id,
          );
        } catch (e) {
          this.props.handleError(e, ERRORS.ERR_RETRIEVING_ROOM_AND_MURALS);
        }
      }
      this.props.onLoadingComplete();
      this.props.onRoomSelect(null, murals);
    } else {
      try {
        this.props.onLoading();

        const murals = await this.props.apiClient.getMuralsByRoom(room.id);

        this.props.onLoadingComplete();
        this.props.onRoomSelect(room, murals);
      } catch (e) {
        this.props.onLoadingComplete();
        this.props.handleError(e, ERRORS.ERR_RETRIEVING_ROOM_MURALS);
      }
    }
  };

  getRoomGroup = (room?: Room) => {
    if (!room) return '';
    return room.type === 'private' ? 'PRIVATE ROOMS' : 'OPEN ROOMS';
  };

  render() {
    return (
      <React.Fragment>
        <FormControl className="mural-picker-select" data-qa="room-select">
          <div className="select-label">
            <InputLabel shrink>ROOM</InputLabel>
          </div>
          <Autocomplete
            id="room-select"
            options={
              this.props.searchedRooms.length === 0
                ? this.props.workspaceRooms
                : this.props.searchedRooms
            }
            ListboxProps={this.props.ListboxProps}
            getOptionLabel={option => {
              return option?.name || '';
            }}
            renderInput={params => (
              <TextField
                {...params}
                placeholder="Find a room..."
                variant="outlined"
                inputProps={{
                  ...params.inputProps,
                  'data-qa': 'input-room-select',
                }}
              />
            )}
            value={this.props.room}
            disabled={!this.props.workspace}
            groupBy={this.getRoomGroup}
            onChange={this.onRoomSelect}
            onInputChange={(event: React.ChangeEvent<{}>, input: string) => {
              if (event?.type === 'change') {
                this.onRoomSearch(input);
              }
            }}
            onClose={(_event: React.ChangeEvent<{}>, _reason: string) => {
              // clear searched rooms on autocomplete close
              this.props.onRoomSearch([]);
            }}
            getOptionSelected={(option: Room, value: Room) =>
              option.id === value.id
            }
            loading={this.state.isSearchingRooms}
            noOptionsText={'No results'}
          />
        </FormControl>
      </React.Fragment>
    );
  }
}
