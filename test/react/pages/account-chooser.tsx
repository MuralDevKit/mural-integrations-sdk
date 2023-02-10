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
        getAuthUrl={(_options: any) => {
          return Promise.resolve('url');
        }}
        onSelection={(_url: any, _action: any) => {}}
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
    'continue as visitor': 'continue-as-visitor',
    'continue with email': 'continue-with-email',
    'sign up with': 'sign-up-with',
    'send verification email': 'send-verification-email',
    'create or signin': 'create-or-signin',
  },
};

export default accountChooser;
