import * as React from 'react';
import { Page } from './types';
import { SessionActivation } from '../../../packages/mural-canvas';

const oAuthSessionActivation: Page = {
  element: () => {
    // @ts-ignore
    return <SessionActivation />;
  },
  items: {},
};

export default oAuthSessionActivation;
