import { Page } from './types';

// import { SessionActivation } from '@muraldevkit/mural-integrations-mural-canvas';
import { MuralPicker } from '@muraldevkit/mural-integrations-mural-picker';
import React from 'react';

const homePage: Page = {
  element: () => {
    return (
      <MuralPicker
        apiClient={null as any}
        handleError={() => {}}
        onCreateMural={console.log as any}
        onMuralSelect={console.log}
      />
    );
  },
  items: {},
};
export default homePage;
