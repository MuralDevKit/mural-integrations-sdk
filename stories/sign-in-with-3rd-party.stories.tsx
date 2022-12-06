import React from 'react';
import {
  DARK_THEME,
  LIGHT_THEME,
} from '../packages/mural-account-chooser/src/components/account-chooser';
import SignUpWith3rdParty from '../packages/mural-account-chooser/src/components/account-chooser/sign-up-with-3rd-party';
// @ts-ignore
import GoogleIcon from '../packages/mural-account-chooser/src/images/google-icon.png?w=32&h=32';
// @ts-ignore
import MicrosoftIcon from '../packages/mural-account-chooser/src/images/microsoft-icon.png?w=32&h=32';

export default {
  title: 'Account Chooser/Sign In With 3rd Party',
  component: SignUpWith3rdParty,
};

export const Google = () => (
  <SignUpWith3rdParty
    name="Google"
    iconSrc={GoogleIcon}
    signUp={() => alert('Sign in with Google')}
    theme={LIGHT_THEME}
  />
);

export const Microsoft = () => (
  <SignUpWith3rdParty
    name="Microsoft"
    iconSrc={MicrosoftIcon}
    signUp={() => alert('Sign in with Microsoft')}
    theme={LIGHT_THEME}
  />
);

export const SSO = () => (
  <SignUpWith3rdParty
    name="SSO"
    signUp={() => alert('Sign in with SSO')}
    theme={LIGHT_THEME}
  />
);

export const GoogleDark = () => (
  <SignUpWith3rdParty
    name="Google"
    iconSrc={GoogleIcon}
    signUp={() => alert('Sign in with Google')}
    theme={DARK_THEME}
  />
);

export const MicrosoftDark = () => (
  <SignUpWith3rdParty
    name="Microsoft"
    iconSrc={MicrosoftIcon}
    signUp={() => alert('Sign in with Microsoft')}
    theme={DARK_THEME}
  />
);

export const SSODark = () => (
  <SignUpWith3rdParty
    name="SSO"
    signUp={() => alert('Sign in with SSO')}
    theme={DARK_THEME}
  />
);
