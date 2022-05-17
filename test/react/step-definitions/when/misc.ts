import { SetupFnArgs } from 'pickled-cucumber/types';
import { rerenderPage } from '../../pages';
import { delay } from '../../utils';

export default function registerWhen({ When }: SetupFnArgs) {
  // USAGE:
  //
  // When waiting 20ms
  // When waiting 30ms for something to render
  //
  // If you need to use this step it's easier for others to understand it so
  // please use the explanation space provided on the step :)
  When('waiting {int}ms(.*)', (num, _explanation) => {
    return delay(parseInt(num, 10));
  });

  // USAGE:
  //
  // When the page rerenders
  //
  // This should be removed once we figure out a way to call rerenderPage from
  // window.location.reload in init-jsdom-global.ts. There is an import issue
  // preventing us from doing this easily, so we need to find another way.
  When('the page rerenders', async () => {
    await rerenderPage();
  });
}
