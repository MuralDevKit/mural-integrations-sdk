import {
  MrlSelect,
  MrlSelectItem,
  MrlSelectMenu,
} from '@muraldevkit/ds-component-form-elements-react';
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

interface DefaultRoom {
  id: string;
  name: string;
}
interface StateTypes {
  isCreateView: boolean;
  currentRoom: Room | DefaultRoom;
  currentRooms: Room[];
}

const INITIAL_STATE: StateTypes = {
  isCreateView: false,
  currentRoom: { id: 'null', name: 'All rooms' },
  currentRooms: [],
};

export default class RoomSelect extends React.Component<PropTypes, StateTypes> {
  state: StateTypes = INITIAL_STATE;
  handleSelect = (newValue: any) => {
    if (newValue == 'room-default') {
      this.props.onSelect(null);
    }
    const newRoom = this.state.currentRooms?.find(
      // eslint-disable-next-line no-shadow
      room => `room-${room.id.toString()}` == newValue,
    );
    console.log(newRoom, 'the new selection');
    if (newRoom) this.props.onSelect(newRoom);
  };

  // TODO: cleanup file when select components are working
  render() {
    const defaultRoom = { id: 'default', name: 'All rooms' };
    const currentRoom = this.props.room ? this.props.room : defaultRoom;
    const currentRooms = this.props.rooms;
    const isCreateView = this.props.viewType === ViewType.CREATE;
    return (
      <MrlSelect
        attrs={{
          'data-qa': 'room-select',
        }}
        hookChange={this.handleSelect}
        kind="inline"
        state={currentRooms ? 'default' : 'disabled'}
        labelId="room-select"
      >
        <MrlSelectMenu selected={'room-' + currentRoom.id} slot="menu">
          {!isCreateView && (
            <MrlSelectItem
              key={'room-' + defaultRoom.id}
              id={'room-' + defaultRoom.id}
              isFocused={currentRoom.id === 'room-' + defaultRoom.id}
              state={
                currentRoom.id == 'room-' + defaultRoom.id
                  ? 'selected'
                  : 'default'
              }
              value={'room-' + defaultRoom.id}
            >
              {defaultRoom.name}
            </MrlSelectItem>
          )}
          {currentRooms?.map(room => {
            const roomId = 'room-' + room.id;
            return (
              <MrlSelectItem
                key={roomId}
                id={roomId}
                isFocused={currentRoom.id === room.id}
                state={currentRoom.id == room.id ? 'selected' : 'default'}
                value={roomId}
              >
                {room.name}
              </MrlSelectItem>
            );
          })}
        </MrlSelectMenu>
      </MrlSelect>
    );
  }
}
