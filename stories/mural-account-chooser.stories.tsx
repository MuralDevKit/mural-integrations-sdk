import React from 'react';
//import { ApiClient } from '../../mural-client/src';
import AccountChooser from '../packages/mural-account-chooser/src/components/account-chooser';
import { ACCOUNT_CHOOSER_ACTION } from '../packages/mural-account-chooser/src/components/account-chooser';
import { AuthorizeParams } from '../packages/mural-account-chooser/src/components/account-chooser/types';

export default {
  title: 'Account Chooser',
  component: (
    <AccountChooser
      apiClient={undefined}
      getAuthUrl={function (
        _options?: AuthorizeParams | undefined,
      ): Promise<string> {
        throw new Error('Function not implemented.');
      }}
      onError={function (e: Error): void {
        throw new Error('Function not implemented.');
      }}
      onSelection={function (
        _url: string,
        _action?: ACCOUNT_CHOOSER_ACTION | undefined,
      ): void {
        throw new Error('Function not implemented.');
      }}
    />
  ),
};

export const Primary = () => (
  <AccountChooser
    apiClient={undefined}
    getAuthUrl={function (
      _options?: AuthorizeParams | undefined,
    ): Promise<string> {
      return Promise.resolve('authUrl');
    }}
    onError={function (e: Error): void {
      return;
    }}
    onSelection={function (
      _url: string,
      _action?: ACCOUNT_CHOOSER_ACTION | undefined,
    ): void {
      return;
    }}
  />
);
