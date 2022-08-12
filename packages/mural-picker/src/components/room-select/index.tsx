import { FormControl, InputLabel, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  DeepPartial,
  defaultBuilder,
  EventHandler,
} from '@muraldevkit/mural-integrations-common';
import { Room, Workspace } from '@muraldevkit/mural-integrations-mural-client';
import debounce from 'lodash/debounce';
import * as React from 'react';
import { DELAYS } from '../../common/delays';
import { ReactSlot } from '../../common/react';
import './styles.scss';

interface Slots {
  LabelText: ReactSlot;
}

interface PropTypes {
  workspace: Workspace | null;
  room: Room | null;
  rooms: Room[];

  onSelect: EventHandler<[room: Room | null]>;

  onSearchQuery?: EventHandler<
    [query: { workspaceId: string; title: string } | false]
  >;
  ListboxProps?: object | undefined;
  disabled?: boolean;

  slots?: DeepPartial<Slots>;
}

interface StateTypes {
  isSearchingRooms: boolean;
}

const useSlots = defaultBuilder<Slots>({
  LabelText: () => <span>ROOM</span>,
});

export default class RoomSelect extends React.Component<PropTypes, StateTypes> {
  state = {
    isSearchingRooms: false,
  };

  handleSelect = async (_: React.ChangeEvent<{}>, room: Room | null) => {
    this.props.onSelect(room);
  };

  handleInputChange = async (event: React.ChangeEvent<{}>, input: string) => {
    if (!this.props.onSearchQuery) return;
    if (!this.props.workspace) return;
    if (event?.type !== 'change') return;

    try {
      this.setState({ isSearchingRooms: true });
      await this.props.onSearchQuery({
        workspaceId: this.props.workspace.id,
        title: input,
      });
    } finally {
      this.setState({ isSearchingRooms: false });
    }
  };

  handleInputClose = () => {
    if (!this.props.onSearchQuery) return;

    this.props.onSearchQuery(false);
  };

  getRoomGroup = (room?: Room) => {
    if (!room) return '';
    return room.type === 'private' ? 'PRIVATE ROOMS' : 'OPEN ROOMS';
  };

  render() {
    const slots = useSlots(this.props.slots);

    return (
      <FormControl className="room-select" data-qa="room-select">
        <div className="select-label">
          <InputLabel shrink>
            <slots.LabelText />
          </InputLabel>
        </div>
        <Autocomplete
          id="room-select"
          options={this.props.rooms}
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
          onChange={this.handleSelect}
          onInputChange={debounce(
            this.handleInputChange,
            DELAYS.DEBOUNCE_SEARCH,
          )}
          onClose={this.handleInputClose}
          getOptionSelected={(option: Room, value: Room) =>
            option.id === value.id
          }
          loading={this.state.isSearchingRooms}
          noOptionsText={'No results'}
        />
      </FormControl>
    );
  }
}
