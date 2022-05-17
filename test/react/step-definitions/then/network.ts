import { SetupFnArgs } from 'pickled-cucumber/types';
import { getLastUrl } from '../../helpers/jsdom-navigate';

export default function registerWhen({ Then, getCtx, compare }: SetupFnArgs) {
  // USAGE:
  //
  // Then the browser redirects to "/some-relative-url"
  // Then the browser redirects to "https://some-url.com"
  // Then the browser redirects to "https://${SOME_VAR}.com"
  // Then the browser redirects to a url starting with "https://${SOME_VAR}.com"
  Then(
    'the browser redirects to( a url starting with)? (".*")',
    (startsWith, url) =>
      compare(
        startsWith ? 'starts with' : 'is',
        getLastUrl() || window.location.href,
        url,
      ),
  );

  // USAGE:
  //
  // Then there was no browser redirection
  Then('there was no browser redirection', () => {
    compare('is', getLastUrl() || window.location.href, '"about:blank"');
  });

  // USAGE:
  //
  // Then the last opened url is "https://some-url.com"
  Then('the last opened url {op} (".*")', (op, url) =>
    compare(op, getCtx('$opened-url'), url),
  );
}
