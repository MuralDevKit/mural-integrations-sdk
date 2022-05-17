import * as React from 'react';
import { Page } from './types';

const homePage: Page = {
  element: () => {
    return <div data-qa="home" />;
  },
  items: {},
};
export default homePage;
