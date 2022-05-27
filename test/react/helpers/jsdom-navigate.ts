import { getCtxItem, setCtxItem } from 'pickled-cucumber/context';

const LAST_URL = '$last-url';
export const getLastUrl = () => getCtxItem<string>(LAST_URL);
export const setLastUrl = (s: string) => setCtxItem(LAST_URL, s);

// Note: this is an implementation details of JSDOM that we are monkeypatching
// updating JSDOM might break this. The original intention of this patch is to
// provide a mocked implementation of browser navigation (e.g. follow a link by
// clicking an <a href> element).
const jsdomNavigation = require('jsdom/lib/jsdom/living/window/navigation');

const originalNavigate = jsdomNavigation.navigate;

// This is yet another JSDOM implementation detail, they use their own
// implementation whatwg's url parser spec and this is what they pass in their
// internal functions, in particular `navigate`.
const { serializeURL } = require('whatwg-url');

// eslint-disable-next-line func-names
jsdomNavigation.navigate = function (...args: unknown[]) {
  const newUrl = args[1] as {
    scheme: string;
    username?: string;
    password?: string;
    host?: string;
    port?: number;
    path: string[];
    query?: string;
    fragment?: string;
  };
  // For now we are only interested in data urls, everything else we let it
  // fallthrough. There is no reason why we couldn't capture more stuff here
  // just be mindful of not breaking other stuff. When in doubt check the
  // original `navigate` implementation in the JSDOM source.
  if (newUrl && newUrl.scheme === 'data') {
    setLastUrl(serializeURL(newUrl));
    return;
  }
  return originalNavigate.call(this, ...args);
};
