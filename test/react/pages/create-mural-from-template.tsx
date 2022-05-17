import * as React from 'react';
import { Page } from './types';

const createMuralFromTemplate: Page = {
  element: () => {
    // @ts-ignore
    return <div />;
  },
  items: {
    'create mural from template': 'create-mural-from-template',
    'invalid permissions error': 'invalid-permissions-error',
    'room picker error': 'room-picker-error',
    'room select button': 'room-picker-button',
    'room select': 'room-select',
    'workspace select': 'workspace-select',
  },
};
export default createMuralFromTemplate;
