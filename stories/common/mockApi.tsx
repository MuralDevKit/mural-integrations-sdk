import { AccountStatus } from '../../packages/mural-account-chooser/src/common/realm';
import { AuthMode } from '../../packages/mural-account-chooser/src/common/realm';

export const MockApiClient = {
  url: (str: string) => ({
    href: `mockApi${str}`,
  }),
};

export const MockApi = {
  userRealm: (
    accountStatus?: AccountStatus,
    authUrl?: string,
    identityProviderName?: AuthMode,
    requireConsent?: boolean,
  ) => {
    return {
      url: 'mockApi/api/v0/user/realm',
      method: 'POST',
      status: 200,
      response: {
        accountStatus,
        authUrl,
        requireConsent,
        identityProviderName: identityProviderName?.toLowerCase(),
      },
    };
  },
};

export default MockApiClient;
