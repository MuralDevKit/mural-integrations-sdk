import { Room, Workspace } from '@muraldevkit/mural-integrations-mural-client';
import { RoomPicker } from '@muraldevkit/mural-integrations-mural-picker';
import { setCtxItem } from 'pickled-cucumber/context';
import * as React from 'react';
import { apiClient } from '../helpers/apiClient';
import { Page } from './types';

const roomPicker: Page = {
  element: () => {
    const onSelect = (room: Room | null, workspace: Workspace | null) => {
      setCtxItem('$lastSelectedRoom', room);
      setCtxItem('$lastSelectedWorkspace', workspace);
    };

    return (
      <RoomPicker
        apiClient={apiClient}
        onSelect={onSelect}
        onError={(_: Error, __: string) => {}}
      />
    );
  },
  items: {
    'room picker': 'room-picker',
    'room select': 'room-select',
    'room select button': 'room-picker-button',
    'workspace select': 'workspace-select',
  },
};

export default roomPicker;
