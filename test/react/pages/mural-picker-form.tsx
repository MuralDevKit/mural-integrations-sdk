import { Mural } from '@muraldevkit/mural-integrations-mural-client';
import { MuralPickerForm } from '@muraldevkit/mural-integrations-mural-picker';
import * as React from 'react';
import { apiClient } from '../helpers/apiClient';
import { Page } from './types';

const muralPickerForm: Page = {
  element: () => {
    return (
      <MuralPickerForm
        apiClient={apiClient}
        onSelect={(_: Mural) => {}}
        onError={(_: Error, __: string) => {}}
      />
    );
  },
  items: {
    'mural picker': 'mural-picker',
    'mural select': 'mural-select',
    'workspace select': 'workspace-select',
    'room select': 'room-select',
  },
};
export default muralPickerForm;
