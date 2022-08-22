import { AccountChooser } from '@muraldevkit/mural-integrations-mural-account-chooser';
import { getCtxItem } from 'pickled-cucumber/context';
import * as React from 'react';
import { apiClient } from '../helpers/apiClient';
import { Page } from './types';

const accountChooser: Page = {
  element: () => {
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
