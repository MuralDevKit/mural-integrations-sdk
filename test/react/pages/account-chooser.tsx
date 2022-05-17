import * as React from 'react';
import { Page } from './types';

import { AccountChooser } from '@muraldevkit/mural-integrations-mural-account-chooser';
import { getCtxItem } from 'pickled-cucumber/context';
import { FAKE_CLIENT_ID, FAKE_MURAL_HOST } from '../../utils';
import buildApiClient, {
  buildClientConfig,
} from '@muraldevkit/mural-integrations-mural-client';

const oauthUrl = new URL('http://oauth.testing.rig');

const clientConfig = buildClientConfig({
  appId: FAKE_CLIENT_ID,
  muralHost: FAKE_MURAL_HOST,
  authorizeUri: new URL('/', oauthUrl).href,
  requestTokenUri: new URL('/token', oauthUrl).href,
  refreshTokenUri: new URL('/refresh', oauthUrl).href,
});

const accountChooser: Page = {
  element: () => {
    const apiClient = buildApiClient(clientConfig);

    return (
      // @ts-ignore
      <AccountChooser
        apiClient={apiClient}
        hint={getCtxItem('$user-principal')}
        onError={console.error}
      >
        <div data-qa="logged-in-content" />
      </AccountChooser>
    );
  },
  items: {
    'account chooser': 'account-chooser',
    'initialization error': 'initialization-error',
    // 'logged in content': 'logged-in-content',
    'sign in from hint': 'sign-in-from-hint',
    'sign up from hint': 'sign-up-from-hint',
    'sign up with': 'sign-up-with',
    'use another account': 'use-another-account',
  },
};

export default accountChooser;
