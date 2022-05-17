import requireMocks from 'pickled-cucumber/require';

import { MockAnalytics } from './analytics';
import { axios } from './axios';

const mongoMock = require('mongo-mock');

requireMocks({
  'analytics-node': MockAnalytics,
  axios,
  mongodb: mongoMock,
  ratelimiter: class {
    get(
      fn: (
        err: null,
        limit: { remaining: number; reset: number; total: number },
      ) => void,
    ) {
      fn(null, { remaining: 1, reset: 2, total: 3 });
    }
  },
  rollbar: {
    error: (e: any) => {
      console.log('ERROR', e);
    },
  },
});
