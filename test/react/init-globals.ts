import { createFakeStorage } from './helpers/fake-storage';

const fakeLocalStorage = new Map<string, string>();
const fakeSessionStorage = new Map<string, string>();

globalThis.localStorage = createFakeStorage(fakeLocalStorage);
globalThis.sessionStorage = createFakeStorage(fakeSessionStorage);
globalThis.crypto = {
  getRandomValues: <T>(_: T) => {
    return ('123456' as any) as T;
  },
} as Crypto;
globalThis.cancelAnimationFrame = () => {};

const CONSOLE_EXCEPTIONS = [
  'has been deprecated and replaced by',
  'Material-UI:',
  'For the benefit of assistive technologies',
  'Warning:',
  'Rollbar is not initialized',
];
['error', 'warn', 'log'].forEach(method => {
  const oldFn = (console as any)[method];
  (console as any)[method] = function fn(...stuff: any[]) {
    if (
      typeof stuff[0] === 'string' &&
      CONSOLE_EXCEPTIONS.some(s => stuff[0].indexOf(s) >= 0)
    ) {
      return;
    }
    return oldFn.call(this, ...stuff);
  };
});

// Drop tracking
const oldDebug = console.debug;
console.debug = function debug(...stuff: any[]) {
  if (typeof stuff[0] === 'string') {
    return;
  }
  return oldDebug.call(this, ...stuff);
};
