import React from 'react';
import SignInWith3rdParty from '../packages/mural-account-chooser/src/components/account-chooser/sign-in-with-3rd-party';
// @ts-ignore
import GoogleIcon from '../packages/mural-account-chooser/src/images/google-icon.png?w=32&h=32';
// @ts-ignore
import MicrosoftIcon from '../packages/mural-account-chooser/src/images/microsoft-icon.png?w=32&h=32';
// @ts-ignore
import MuralIcon from '../packages/mural-account-chooser/src/images/mural-icon.png?w=32&h=32';

export default {
  title: 'Sign In With 3rd Party',
  component: SignInWith3rdParty,
};

export const Google = () => (
  <SignInWith3rdParty
    name="Google"
    iconSrc={GoogleIcon}
    signIn={() => alert('Sign in with Google')}
  />
);

export const Microsoft = () => (
  <SignInWith3rdParty
    name="Microsoft"
    iconSrc={MicrosoftIcon}
    signIn={() => alert('Sign in with Microsoft')}
  />
);

export const SSO = () => (
  <SignInWith3rdParty name="SSO" signIn={() => alert('Sign in with Google')} />
);
