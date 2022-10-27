import { Mural } from '@muraldevkit/mural-integrations-mural-client';
import { MuralPicker } from '@muraldevkit/mural-integrations-mural-picker';
import * as React from 'react';
import { apiClient } from '../helpers/apiClient';
import { Page } from './types';

const muralPicker: Page = {
  element: () => {
    return (
      <MuralPicker
        apiClient={apiClient}
        onSelect={(_: Mural) => {}}
        onError={(_: Error, __: string) => {}}
      />
    );
  },
  items: {
    'mural picker': 'mural-picker',
    'card title': 'card-title',
    'room select': 'room-select',
    'workspace select': 'workspace-select',
    'input room select': 'input-room-select',
  },
};
export default muralPicker;
