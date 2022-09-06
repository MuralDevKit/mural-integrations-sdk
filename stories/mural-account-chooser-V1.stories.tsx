import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import withMock from 'storybook-addon-mock';
import {
  AccountStatus,
  AuthMode,
} from '../packages/mural-account-chooser/src/common/realm';
import AccountChooserV1 from '../packages/mural-account-chooser/src/components/account-chooser/indexV1';
import { MockApi, MockApiClient } from './common/mockApi';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Account Chooser V1',
  component: AccountChooserV1,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  // argTypes: {
  //   emailHint: string;
  // },
  decorators: [withMock],
} as ComponentMeta<typeof AccountChooserV1>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof AccountChooserV1> = args => (
  <AccountChooserV1 {...args} />
);

export const SignIn = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
SignIn.args = {
  theme: 'light',
};

// export const DarkTheme = Template.bind({});
// DarkTheme.args = {
//   theme: 'dark',
// };

export const Visitor = Template.bind({});
Visitor.args = {
  visitor: true,
};

export const HintEmailSignIn = Template.bind({});
HintEmailSignIn.args = {
  hint: 'integrations@mural.co',
  apiClient: MockApiClient,
};
HintEmailSignIn.parameters = {
  mockData: [MockApi.userRealm(AccountStatus.VALID)],
};

export const HintEmailSignInWithVisitorOption = Template.bind({});
HintEmailSignInWithVisitorOption.args = {
  hint: 'integrations@mural.co',
  apiClient: MockApiClient,
  visitor: true,
};
HintEmailSignInWithVisitorOption.parameters = {
  mockData: [MockApi.userRealm(AccountStatus.VALID)],
};

export const HintEmailSignInWithGoogle = Template.bind({});
HintEmailSignInWithGoogle.args = {
  hint: 'something@gmail.com',
  apiClient: MockApiClient,
};
HintEmailSignInWithGoogle.parameters = {
  mockData: [
    MockApi.userRealm(
      AccountStatus.UNVERIFIED,
      'authUrl',
      AuthMode.GOOGLE,
      false,
    ),
  ],
};

export const HintEmailSignInWithMicrosoft = Template.bind({});
HintEmailSignInWithMicrosoft.args = {
  hint: 'something@outlook.com',
  apiClient: MockApiClient,
};
HintEmailSignInWithMicrosoft.parameters = {
  mockData: [
    MockApi.userRealm(
      AccountStatus.VALID,
      'authUrl',
      AuthMode.MICROSOFT,
      false,
    ),
  ],
};

export const HintEmailSignInWithSSO = Template.bind({});
HintEmailSignInWithSSO.args = {
  hint: 'something@company.com',
  apiClient: MockApiClient,
};
HintEmailSignInWithSSO.parameters = {
  mockData: [
    MockApi.userRealm(
      AccountStatus.UNVERIFIED,
      'authUrl',
      AuthMode.ENTERPRISE_SSO,
      false,
    ),
  ],
};

export const HintEmailSignUp = Template.bind({});
HintEmailSignUp.args = {
  hint: 'something@email.com',
  apiClient: MockApiClient,
};
HintEmailSignUp.parameters = {
  mockData: [MockApi.userRealm()],
};

export const HintEmailSignUpWithMicrosoft = Template.bind({});
HintEmailSignUpWithMicrosoft.args = {
  hint: 'something@outlook.com',
  apiClient: MockApiClient,
};
HintEmailSignUpWithMicrosoft.parameters = {
  mockData: [
    MockApi.userRealm(undefined, 'authUrl', AuthMode.MICROSOFT, false),
  ],
};

export const HintEmailSignUpWithMSConsentRequired = Template.bind({});
HintEmailSignUpWithMSConsentRequired.args = {
  hint: 'something@outlook.com',
  apiClient: MockApiClient,
};
HintEmailSignUpWithMSConsentRequired.parameters = {
  mockData: [MockApi.userRealm(undefined, 'authUrl', AuthMode.MICROSOFT, true)],
};

export const HintEmailSignUpWithGoogleConsentRequired = Template.bind({});
HintEmailSignUpWithGoogleConsentRequired.args = {
  hint: 'something@gmail.com',
  apiClient: MockApiClient,
};
HintEmailSignUpWithGoogleConsentRequired.parameters = {
  mockData: [MockApi.userRealm(undefined, 'authUrl', AuthMode.GOOGLE, true)],
};

export const HintEmailSignUpWithSSOConsentRequired = Template.bind({});
HintEmailSignUpWithSSOConsentRequired.args = {
  hint: 'something@company.com',
  apiClient: MockApiClient,
};
HintEmailSignUpWithSSOConsentRequired.parameters = {
  mockData: [
    MockApi.userRealm(undefined, 'authUrl', AuthMode.ENTERPRISE_SSO, true),
  ],
};
