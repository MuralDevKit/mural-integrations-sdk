import { MenuItem, FormControl, Select } from '@material-ui/core';
import { EventHandler } from '@muraldevkit/mural-integrations-common';
import { Room, Workspace } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';

import { ViewType } from '../mural-picker';
import './styles.scss';

interface PropTypes {
  workspace: Workspace | null;
  room: Room | null;
  rooms: Room[];
  viewType: ViewType;

  onSelect: EventHandler<[room: Room | null]>;
  disabled?: boolean;
}

export default class RoomSelect extends React.Component<PropTypes> {
  handleSelect = (newValue: any) => {
    if (newValue.target.value == 'default') {
      this.props.onSelect(null);
    }
    const newRoom = this.props.rooms?.find(
      // eslint-disable-next-line no-shadow
      room => room.id == newValue.target.value,
    );
    if (newRoom) this.props.onSelect(newRoom);
  };

  render() {
    const defaultRoom = { id: 'default', name: 'All rooms' };
    const currentRoom = this.props.room ? this.props.room : defaultRoom;
    const isCreateView = this.props.viewType === ViewType.CREATE;
    return (
      <FormControl variant="standard">
        <Select
          labelId="room-select"
          data-qa="room-select"
          value={currentRoom.id}
          onChange={this.handleSelect}
          label="room"
        >
          {!isCreateView && (
            <MenuItem key={defaultRoom.id} value={defaultRoom.id}>
              {defaultRoom.name}
            </MenuItem>
          )}
          {this.props.rooms.map(room => (
            <MenuItem key={room.id} value={room.id}>
              {room.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
}
