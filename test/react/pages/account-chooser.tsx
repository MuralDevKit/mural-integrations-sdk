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
    'sign up': 'sign-up',
    'sign in as visitor': 'sign-in-as-visitor',
    'continue with email': 'continue-with-email',
    'sign up with': 'sign-up-with',
    'send verification email': 'send-verification-email',
    'use another account': 'use-another-account',
  },
};

export default accountChooser;
