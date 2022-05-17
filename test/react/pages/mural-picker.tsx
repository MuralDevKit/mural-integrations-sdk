import { Mural } from '@muraldevkit/mural-integrations-mural-client';
import {
  CreateMuralData,
  CreateMuralResult,
  MuralPickerModal,
} from '@muraldevkit/mural-integrations-mural-picker';
import * as React from 'react';
import { apiClient } from '../helpers/apiClient';
import { Page } from './types';

const muralPicker: Page = {
  element: () => {
    return (
      <MuralPickerModal
        apiClient={apiClient}
        onCreateMural={async (
          _: CreateMuralData,
        ): Promise<CreateMuralResult | undefined> => {
          // eslint-disable-next-line no-useless-return
          return;
        }}
        onMuralSelect={(_: Mural) => {}}
        handleError={(_: Error, __: string) => {}}
      />
    );
  },
  items: {
    'choose mural button': 'choose-mural-button',
    'mural picker modal': 'mural-picker-modal',
    'mural title': 'mural-title',
    'room select': 'room-select',
    'workspace select': 'workspace-select',
    'input room select': 'input-room-select',
  },
};
export default muralPicker;
