import { Canvas } from '@muraldevkit/mural-integrations-mural-canvas';
import * as React from 'react';
import { apiClient } from '../helpers/apiClient';
import { Page } from './types';

const page: Page = {
  element: () => {
    // @ts-ignore
    return <Canvas apiClient={apiClient} />;
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
