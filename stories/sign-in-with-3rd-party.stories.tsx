import React from 'react';
import {
  darkTheme,
  lightTheme,
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
    theme={lightTheme}
  />
);

export const Microsoft = () => (
  <SignUpWith3rdParty
    name="Microsoft"
    iconSrc={MicrosoftIcon}
    signUp={() => alert('Sign in with Microsoft')}
    theme={lightTheme}
  />
);

export const SSO = () => (
  <SignUpWith3rdParty
    name="SSO"
    signUp={() => alert('Sign in with SSO')}
    theme={lightTheme}
  />
);

export const GoogleDark = () => (
  <SignUpWith3rdParty
    name="Google"
    iconSrc={GoogleIcon}
    signUp={() => alert('Sign in with Google')}
    theme={darkTheme}
  />
);

export const MicrosoftDark = () => (
  <SignUpWith3rdParty
    name="Microsoft"
    iconSrc={MicrosoftIcon}
    signUp={() => alert('Sign in with Microsoft')}
    theme={darkTheme}
  />
);

export const SSODark = () => (
  <SignUpWith3rdParty
    name="SSO"
    signUp={() => alert('Sign in with SSO')}
    theme={darkTheme}
  />
);
