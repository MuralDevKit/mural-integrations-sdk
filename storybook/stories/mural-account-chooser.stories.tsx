import React from 'react';
import {
  AccountChooser,
  ACCOUNT_CHOOSER_ACTION,
} from '@muraldevkit/mural-integrations-mural-account-chooser';

// TODO: Remove this
const blackHole: any = new Proxy(() => {}, {
  get: () => {
    return blackHole;
  },
  apply: () => {
    return blackHole;
  },
});

const apiClient = blackHole;

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default { title: 'Account Chooser', component: AccountChooser };

const authUrl = (_options?: any) => Promise.resolve('url');
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
