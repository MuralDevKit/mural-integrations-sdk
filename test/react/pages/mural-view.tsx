import * as React from 'react';
import { Page } from './types';
import { Canvas } from '../../../packages/mural-canvas';

const page: Page = {
  element: () => {
    // @ts-ignore
    return <Canvas />;
  },
  items: {
    'access denied': 'access-denied',
    'account chooser': 'account-chooser',
    'continue as visitor': 'continue-as-visitor',
    'mural canvas': 'mural-canvas',
    'mural deleted': 'mural-deleted',
    'sign in required': 'sign-in-required',
  },
};

export default page;
