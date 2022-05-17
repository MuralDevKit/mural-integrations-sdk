import pickledCucumber, { SetupFn } from 'pickled-cucumber';
import { EventEmitter } from 'events';

import axios from 'axios';
import React from 'react';

console.info('=== Runtime ===');
console.info(`  React: `, React.version);
console.info(`  axios: `, axios.VERSION);

import './init-jsdom-global';
import './init-globals';
import './mocks';

// '@testing-library/react' must be be imported after jsdom-global
// eslint-disable-next-line import/first
import { cleanup, configure } from '@testing-library/react';

import registerGiven from './step-definitions/given';
import registerWhen from './step-definitions/when';
import registerThen from './step-definitions/then';

import * as fetch from './mocks/fetch';
import * as muralApi from './mocks/mural-api';
import muralApiEntities from './entities/mural-api';

const setup: SetupFn = args => {
  const { After, Before, BeforeAll } = args;

  BeforeAll(async () => {
    await waitForDocumentReady();
  });

  Before(async () => {
    muralApi.registerGlobalRoutes();
  });

  After(async () => {
    window.location.href = 'about:blank';
    cleanup();
    fetch.reset();
    localStorage.clear();
    sessionStorage.clear();
  });

  configure({ testIdAttribute: 'data-qa' });
  fetch.initialize();

  registerGiven(args);
  registerWhen(args);
  registerThen(args);
};

const eventEmitter = new EventEmitter();
document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    eventEmitter.emit('documentReady');
  }
};

async function waitForDocumentReady() {
  if (document.readyState !== 'complete') {
    await new Promise(resolve => eventEmitter.once('documentReady', resolve));
  }
}

pickledCucumber(setup, {
  aliases: {
    descriptor: /\[([^\]]*)\]/,
    float: /-?\d+\.?\d*/,
  },
  entities: muralApiEntities,
  usage: !process.env.CI,
});
