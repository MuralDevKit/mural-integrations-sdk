import './helpers/jsdom-navigate'; // import this before JSDOM

const { setCtxItem } = require('pickled-cucumber/context');
const jsdom = require('jsdom');

const OPENED_URL = '$opened-url';
const CONFIRM_MESSAGE = '$confirm-message';
const WINDOW_CLOSED = '$window-closed';
const WINDOW_RELOADED = '$window-reloaded';

// Note we can use "external" resources in our tests by specifying them as being
// hosted at `https://external.mock/<whatever>`. These resources will be loaded from
// the `assets` directory next to this file.
const resourceLoader = new jsdom.ResourceLoader({});
const oldFetch = resourceLoader.fetch;
resourceLoader.fetch = (url: string, options: { element: HTMLElement }) => {
  if (options.element.localName === 'iframe') return null;

  if (url.startsWith('https://external.mock/')) {
    const fileUrl = `file://${__dirname}/assets/${url
      .replace('https://external.mock/', '')
      .replace(/[^.a-zA-Z0-9-]+/g, '-')}`.replace(/\\/g, '/');
    return oldFetch.call(resourceLoader, fileUrl, options);
  }

  return oldFetch.call(resourceLoader, url, options);
};

interface ExtendedWindow extends Window {
  analytics: unknown;
  Path2D: unknown;
  Worker: unknown;
}

const options = {
  resources: resourceLoader,
  runScripts: 'dangerously',
  beforeParse(window: ExtendedWindow) {
    // window location mock
    // href should be empty, otherwise it will break scopes.map
    const host = 'testing.rig';
    const protocol = 'http:';
    delete (window as any).location;
    (window as any).location = {
      href: '',
      pathname: '/testing',
      search: '',
      protocol,
      host,
      hash: '',
      hostname: host,
      origin: `${protocol}//${host}`,
      port: '',
      ancestorOrigins: {
        contains: () => false,
        item: () => null,
        length: 0,
      },
      reload: () => {
        setCtxItem(WINDOW_RELOADED, true);
      },
      assign: () => {},
      replace: (url: string) => {
        window.location.href = url;
      },
    };

    window.open = (url: string) => {
      setCtxItem(OPENED_URL, url);
      return null;
    };

    window.close = () => {
      setCtxItem(WINDOW_CLOSED, true);
      return null;
    };

    window.confirm = (message: string) => {
      setCtxItem(CONFIRM_MESSAGE, message);
      return true;
    };
  },
};

const html = `
<!doctype html>
<html>
   <head>
      <meta charset='UTF-8'>
   </head>
   <body>
      <div></div>
   </body>
</html>
`;

require('jsdom-global')(html, options);
