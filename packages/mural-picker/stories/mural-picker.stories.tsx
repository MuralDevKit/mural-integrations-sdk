/* eslint-disable no-console */
import * as React from 'react';
import MuralPicker, {
  PropTypes as MuralPickerPropTypes,
} from '../src/components/mural-picker';
import { Mural } from '../src/types';

export default {
  component: MuralPicker,
  title: 'Mural Picker/Murals',
  args: {
    fetchFn: window.fetch,
    onMuralSelect: (mural: Mural) => {
      console.log('selected mural: ', mural.id);
    },
    handleError: (error: Error, message: string) => {
      console.log('Error: ', error, message);
    },
  } as MuralPickerPropTypes,
};

const Template = (args: MuralPickerPropTypes) => <MuralPicker {...args} />;

// TODO: will need to adjust props to reflect this
export const WithWorkspaces = Template.bind({});

export const WithRooms = Template.bind({});

export const WithMurals = Template.bind({});
// @ts-ignore
WithMurals.parameters = {
  getAllWorkSpaces: () => {
    return {
      json: {
        id: '1blj389',
        isFav: 'true',
        createdBy: {
          firstName: 'Alexxis',
          lastName: 'Johnson',
        },
        title: 'My mural',
        updatedOn: 'some date',
        thumbnailUrl: 'https://mural.co/',
      },
    };
  },
  getWorkSpaceById: {
    json: {
      id: '1blj389',
      isFav: 'true',
      createdBy: {
        firstName: 'Alexxis',
        lastName: 'Johnson',
      },
      title: 'My mural',
      updatedOn: 'some date',
      thumbnailUrl: 'https://mural.co/',
    },
  },
  getMuralsByRoom: {
    json: {
      id: '1blj389',
      isFav: 'true',
      createdBy: {
        firstName: 'Alexxis',
        lastName: 'Johnson',
      },
      title: 'My mural',
      updatedOn: 'some date',
      thumbnailUrl: 'https://mural.co/',
    },
  },
};

export const WithMural = Template.bind({});
export const Error = Template.bind({});

// TODO: which of the following is necessary?
export const Loading = Template.bind({});
export const NoIssues = Template.bind({});
export const Submitting = Template.bind({});
