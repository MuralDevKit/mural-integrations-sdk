import * as React from 'react';
import {
  CreateMuralData,
  CreateMuralResult,
  MuralPickerModal,
} from '../../../packages/mural-picker';
import buildApiClient, {
  Mural,
  buildClientConfig,
} from '../../../packages/mural-client';
import { FAKE_CLIENT_ID, FAKE_MURAL_HOST } from '../../utils';
import { Page } from './types';

const oauthUrl = new URL('http://oauth.testing.rig');

const clientConfig = buildClientConfig({
  appId: FAKE_CLIENT_ID,
  muralHost: FAKE_MURAL_HOST,
  authorizeUri: new URL('/', oauthUrl).href,
  requestTokenUri: new URL('/token', oauthUrl).href,
  refreshTokenUri: new URL('/refresh', oauthUrl).href,
});

const muralPicker: Page = {
  element: () => {
    const apiClient = buildApiClient(clientConfig);

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
