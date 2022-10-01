import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import withMock from 'storybook-addon-mock';
import {
  AccountStatus,
  // AuthMode,
} from '../packages/mural-account-chooser/src/common/realm';
import AccountChooser from '../packages/mural-account-chooser/src/components/account-chooser';
// import { MockApi, MockApiClient } from './common/mockApi';
import { MockApi, MockApiClient } from './common/mockApi';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Account Chooser',
  component: AccountChooser,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  // argTypes: {
  //   emailHint: string;
  // },
  decorators: [withMock],
} as ComponentMeta<typeof AccountChooser>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof AccountChooser> = args => (
  <AccountChooser {...args} />
);

const onError = () => {};
const authUrl = () => 'url';
export const NoEmailHint = Template.bind({});
const visitor = {
  onSelect: () => {
    alert('Enter mural as visitor.');
  },
};

export const Visitor1 = Template.bind({});
Visitor1.args = {
  visitor,
  apiClient: MockApiClient,
  getAuthUrl: authUrl,
  onSelection: (url, action) => {
    alert(`${url}, ${action}`);
  },
};

export const EmailHint = Template.bind({});
EmailHint.args = {
  hint: 'integrations@mural.co',
  apiClient: MockApiClient,
  onError,
};
EmailHint.parameters = {
  mockData: [MockApi.userRealm(AccountStatus.VALID)],
};

export const EmailHintWithVisitor = Template.bind({});
EmailHintWithVisitor.args = {
  hint: 'integrations@mural.co',
  // apiClient: MockApiClient,
  visitor,
  onError,
};
EmailHint.parameters = {
  mockData: [MockApi.userRealm(AccountStatus.VALID)],
};

export const DarkMode = Template.bind({});
DarkMode.args = {
  visitor,
  theme: 'dark',
  onError,
};

export const DarkModeWithEmailHint = Template.bind({});
DarkModeWithEmailHint.args = {
  visitor,
  theme: 'dark',
  hint: 'integrations@mural.co',
  onError,
};
