import reactRouterMock from './mock-react-router';
import { axios } from './axios';

type MockMap = Record<string, any>;
const Module = require('module');

const mock = (requireMockMap: MockMap, profile = true) => {
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function require(path: string) {
    const m = requireMockMap[path];
    if (m !== undefined) return m;

    if (
      path.includes('.sass') ||
      path.includes('.scss') ||
      path.includes('.css') ||
      path.includes('.png')
    )
      return;

    const s = Date.now();
    const v = originalRequire.call(this, path);
    const e = Date.now();
    if (profile && e - s > 1000) {
      // eslint-disable-next-line no-console
      console.log(`Slow require: '${path}' = ${(e - s) / 1000.0}s`);
    }

    return v;
  };
};

// jsdom does not implement the scrollTo method, so we have to mock it
HTMLElement.prototype.scrollTo = () => {};

const MOCK_MAP: MockMap = {
  axios,
  'react-router': reactRouterMock,
  each: {},
  unserialize: {},
};

mock(MOCK_MAP, !process.env.CI);

export default MOCK_MAP;
