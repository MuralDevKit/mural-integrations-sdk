import React from 'react';
import { ACCOUNT_CHOOSER_ACTION } from '../packages/mural-account-chooser/dist';
import AccountChooser, {
  AuthorizeParams,
} from '../packages/mural-account-chooser/src/components/account-chooser';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Account Chooser',
  component: AccountChooser,
};

const apiClient = {};
const authUrl = (_options?: AuthorizeParams) => Promise.resolve('url');
const onSelection = (_url: string, action?: ACCOUNT_CHOOSER_ACTION) => {
  alert(action);
};
const onError = () => {};
const visitor = {
  onSelect: () => {
    alert('Enter mural as visitor.');
  },
};

export const NoEmailHintWithVisitor = () => (
  <AccountChooser
    apiClient={apiClient}
    getAuthUrl={authUrl}
    onSelection={onSelection}
    onError={onError}
    visitor={visitor}
    theme="light"
  />
);

export const NoEmailHintNoVisitor = () => (
  <AccountChooser
    apiClient={apiClient}
    getAuthUrl={authUrl}
    onSelection={onSelection}
    onError={onError}
    theme="light"
  />
);

export const EmailHint = () => (
  <AccountChooser
    apiClient={apiClient}
    hint="integrations@mural.co"
    getAuthUrl={authUrl}
    onSelection={onSelection}
    onError={onError}
    theme="light"
  />
);

export const EmailHintWithVisitor = () => (
  <AccountChooser
    apiClient={apiClient}
    hint="integrations@mural.co"
    getAuthUrl={authUrl}
    onSelection={onSelection}
    onError={onError}
    visitor={visitor}
    theme="light"
  />
);

export const DarkMode = () => (
  <AccountChooser
    apiClient={apiClient}
    getAuthUrl={authUrl}
    onSelection={onSelection}
    onError={onError}
    visitor={visitor}
    theme="dark"
  />
);

export const DarkModeWithEmailHint = () => (
  <AccountChooser
    apiClient={apiClient}
    hint="integrations@mural.co"
    getAuthUrl={authUrl}
    onSelection={onSelection}
    onError={onError}
    visitor={visitor}
    theme="dark"
  />
);
