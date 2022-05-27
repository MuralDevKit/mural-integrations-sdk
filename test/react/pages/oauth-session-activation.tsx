import * as React from 'react';
import { Page } from './types';
import { SessionActivation } from '@muraldevkit/mural-integrations-mural-canvas';
import { apiClient } from '../helpers/apiClient';

const oAuthSessionActivation: Page = {
  element: () => {
    // @ts-ignore
    return <SessionActivation apiClient={apiClient} />;
  },
  items: {},
};

export default oAuthSessionActivation;
