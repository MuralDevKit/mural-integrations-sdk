import {
  Mural,
  MuralSummary,
  Room,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import { MuralPicker } from '@muraldevkit/mural-integrations-mural-picker';
import { getCtxItem } from 'pickled-cucumber/context';
import * as React from 'react';
import { apiClient } from '../helpers/apiClient';
import { Page } from './types';

const muralPicker: Page = {
  element: () => {
    return (
      <MuralPicker
        apiClient={apiClient}
        onSelect={(
          _mural: Mural | MuralSummary,
          _room: Room | null,
          _workspace: Workspace,
        ): void | Promise<void> => {}}
        onError={(_: Error, __: string) => {}}
        disableCreate={getCtxItem('$mural-picker-create-disabled')}
      />
    );
  },
  items: {
    'mural picker': 'mural-picker',
    'card title': 'card-title',
    'default tab': 'recent-tab',
    'starred tab': 'starred-tab',
    'all tab': 'all-tab',
    'room select': 'room-select',
    'workspace select': 'workspace-select',
    'input room select': 'input-room-select',
    'mural picker control': 'mural-picker-control',
    'create button': 'create-btn',
  },
};
export default muralPicker;
