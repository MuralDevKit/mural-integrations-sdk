import React from 'react';
import { AuthMode } from '@muraldevkit/mural-integrations-mural-account-chooser/src/common/realm';
import {
  DARK_THEME,
  LIGHT_THEME,
} from '@muraldevkit/mural-integrations-mural-account-chooser/src/components/account-chooser';
import SignUpWith3rdParty from '@muraldevkit/mural-integrations-mural-account-chooser/src/components/account-chooser/sign-up-with-3rd-party';

export default {
  title: 'Account Chooser/Sign In With 3rd Party',
  component: SignUpWith3rdParty,
};

export const Google = () => (
  <SignUpWith3rdParty
    name="Google"
    authMode={AuthMode.GOOGLE}
    signUp={() => alert('Sign in with Google')}
    theme={LIGHT_THEME}
  />
);

export const Microsoft = () => (
  <SignUpWith3rdParty
    name="Microsoft"
    authMode={AuthMode.MICROSOFT}
    signUp={() => alert('Sign in with Microsoft')}
    theme={LIGHT_THEME}
  />
);

export const SSO = () => (
  <SignUpWith3rdParty
    name="SSO"
    authMode={AuthMode.ENTERPRISE_SSO}
    signUp={() => alert('Sign in with SSO')}
    theme={LIGHT_THEME}
  />
);

export const GoogleDark = () => (
  <SignUpWith3rdParty
    name="Google"
    authMode={AuthMode.GOOGLE}
    signUp={() => alert('Sign in with Google')}
    theme={DARK_THEME}
  />
);

export const MicrosoftDark = () => (
  <SignUpWith3rdParty
    name="Microsoft"
    authMode={AuthMode.MICROSOFT}
    signUp={() => alert('Sign in with Microsoft')}
    theme={DARK_THEME}
  />
);

export const SSODark = () => (
  <SignUpWith3rdParty
    name="SSO"
    authMode={AuthMode.ENTERPRISE_SSO}
    signUp={() => alert('Sign in with SSO')}
    theme={DARK_THEME}
  />
);
