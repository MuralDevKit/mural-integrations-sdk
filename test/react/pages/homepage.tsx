import { Page } from './types';
// import { SessionActivation } from '@muraldevkit/mural-integrations-mural-canvas';
import React from 'react';
import { MuralPicker } from '@muraldevkit/mural-integrations-mural-picker';

const homePage: Page = {
  element: () => {
    return (
      <MuralPicker
        apiClient={null as any}
        onError={() => {}}
        onSelect={console.log}
      />
    );
  },
  items: {},
};
export default homePage;
