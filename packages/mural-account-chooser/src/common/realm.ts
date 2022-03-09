import axios from 'axios';

// eslint-disable-next-line no-shadow
export enum AccountStatus {
  UNKNOWN = -1,
  UNKNOWN_SSO,
  UNVERIFIED,
  VALID,
  UNKNOWN_BLOCKED,
}

// eslint-disable-next-line no-shadow
export enum AuthMode {
  GOOGLE = 'Google',
  MICROSOFT = 'Microsoft',
  ENTERPRISE_SSO = 'SSO',
  PASSWORD = 'Password',
}

export interface RealmResponse {
  accountStatus: AccountStatus;
  canAccessTenant: boolean;
  authUrl: string;
  identityProviderName: string;
  overridable: boolean;
  requireConsent: boolean;
}

export const getMuralRealm = async (webAppUrl: string, email: string) => {
  const response = await axios.post(`${webAppUrl}/api/v0/user/realm`, {
    email,
  });
  return response.data as RealmResponse;
};

export const getAuthMode = (realm: RealmResponse): AuthMode => {
  if (realm.authUrl) {
    if (realm.identityProviderName === 'google') return AuthMode.GOOGLE;
    if (realm.identityProviderName === 'microsoft') return AuthMode.MICROSOFT;
    return AuthMode.ENTERPRISE_SSO;
  }
  return AuthMode.PASSWORD;
};
