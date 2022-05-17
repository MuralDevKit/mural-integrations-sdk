import * as React from 'react';
import { Page } from './types';
import AuthenticationWrapper from '../../../routes/msteams/components/authentication-wrapper';
import withMsTeams from '../../../routes/msteams/components/with-ms-teams';

const authenticationWrapper: Page = {
  element: () => {
    const WrappedComponent = withMsTeams(AuthenticationWrapper);
    return (
      // @ts-ignore
      <WrappedComponent>
        <div data-qa="logged-in-content" />
      </WrappedComponent>
    );
  },
  items: {
    'account chooser': 'account-chooser',
    'initialization error': 'initialization-error',
    'logged in content': 'logged-in-content',
    'sign in from hint': 'sign-in-from-hint',
    'sign up from hint': 'sign-up-from-hint',
    'sign up with': 'sign-up-with',
    'use another account': 'use-another-account',
  },
};

export default authenticationWrapper;
