import React from 'react';
import SignUpWith3rdParty from '../packages/mural-account-chooser/src/components/account-chooser/sign-up-with-3rd-party';
// @ts-ignore
import GoogleIcon from '../packages/mural-account-chooser/src/images/google-icon.png?w=32&h=32';
// @ts-ignore
import MicrosoftIcon from '../packages/mural-account-chooser/src/images/microsoft-icon.png?w=32&h=32';
// @ts-ignore
import MuralIcon from '../packages/mural-account-chooser/src/images/mural-icon.png?w=32&h=32';

export default {
  title: 'Sign In With 3rd Party',
  component: SignUpWith3rdParty,
};

export const Google = () => (
  <SignUpWith3rdParty
    name="Google"
    iconSrc={GoogleIcon}
    signIn={() => alert('Sign in with Google')}
    theme="light"
  />
);

export const Microsoft = () => (
  <SignUpWith3rdParty
    name="Microsoft"
    iconSrc={MicrosoftIcon}
    signIn={() => alert('Sign in with Microsoft')}
    theme="light"
  />
);

export const SSO = () => (
  <SignUpWith3rdParty
    name="SSO"
    signIn={() => alert('Sign in with SSO')}
    theme="light"
  />
);

export const GoogleDark = () => (
  <SignUpWith3rdParty
    name="Google"
    iconSrc={GoogleIcon}
    signIn={() => alert('Sign in with Google')}
    theme="dark"
  />
);

export const MicrosoftDark = () => (
  <SignUpWith3rdParty
    name="Microsoft"
    iconSrc={MicrosoftIcon}
    signIn={() => alert('Sign in with Microsoft')}
    theme="dark"
  />
);

export const SSODark = () => (
  <SignUpWith3rdParty
    name="SSO"
    signIn={() => alert('Sign in with SSO')}
    theme="dark"
  />
);
