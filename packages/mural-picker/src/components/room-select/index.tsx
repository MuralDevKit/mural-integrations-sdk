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

  // TODO: cleanup file when select components are working
  render() {
    const defaultRoom = { id: 'default', name: 'All rooms' };
    const currentRoom = this.props.room ? this.props.room : defaultRoom;
    // const currentRooms = this.props.rooms;
    const isCreateView = this.props.viewType === ViewType.CREATE;
    return (
      <FormControl variant="standard">
        <Select
          labelId="workspace-select"
          value={currentRoom.id}
          onChange={this.handleSelect}
          label="workspace"
        >
          {!isCreateView && (
            <MenuItem key={defaultRoom.id} value={defaultRoom.id}>
              {defaultRoom.name}
            </MenuItem>
          )}
          {this.props.rooms.map(workspace => (
            <MenuItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      // <MrlSelect
      //   attrs={{
      //     'data-qa': 'room-select',
      //   }}
      //   hookChange={this.handleSelect}
      //   kind="inline"
      //   state={currentRooms ? 'default' : 'disabled'}
      //   labelId="room-select"
      // >
      //   <MrlSelectMenu selected={'room-' + currentRoom.id} slot="menu">
      //     {!isCreateView && (
      //       <MrlSelectItem
      //         key={'room-' + defaultRoom.id}
      //         id={'room-' + defaultRoom.id}
      //         isFocused={currentRoom.id === 'room-' + defaultRoom.id}
      //         state={
      //           currentRoom.id == 'room-' + defaultRoom.id
      //             ? 'selected'
      //             : 'default'
      //         }
      //         value={'room-' + defaultRoom.id}
      //       >
      //         {defaultRoom.name}
      //       </MrlSelectItem>
      //     )}
      //     {currentRooms?.map(room => {
      //       const roomId = 'room-' + room.id;
      //       return (
      //         <MrlSelectItem
      //           key={roomId}
      //           id={roomId}
      //           isFocused={currentRoom.id === room.id}
      //           state={currentRoom.id == room.id ? 'selected' : 'default'}
      //           value={roomId}
      //         >
      //           {room.name}
      //         </MrlSelectItem>
      //       );
      //     })}
      //   </MrlSelectMenu>
      // </MrlSelect>
    );
  }
}
