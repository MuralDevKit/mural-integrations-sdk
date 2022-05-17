import { SetupFnArgs } from 'pickled-cucumber/types';
import { render } from '@testing-library/react';
import { findPage, getElement, queueRenderPage } from '../../pages';
import { PageName } from '../../pages/types';

export default function registerGiven({ Given, onTearDown }: SetupFnArgs) {
  // USAGE:
  //
  // Given I visit the "mural" route
  Given('I visit the "(.*)" route', route => {
    queueRenderPage(route as PageName);
  });

  // USAGE:
  //
  // Given the route has finished loading
  //
  // APOCALIPTIC NOTE: make sure you understand what this step means before
  // using it. The way the rig works is to `queue` a route render when you call
  // the step above `Given I visit the "something" route` and it gets rendered
  // the first time you actually get a dom element. This step is neeeded for
  // situations where you need the app to have cooled down (e.g. when you open
  // a mural there are a bunch of API calls made) but you want to start
  // asserting after there's nothing else to be done. A good example of this is
  // the test that asserts the `refresh` flow works fine: if the token is no
  // longer valid it'll auto refresh with those "automatic" API calls and not
  // when you want by explicitly saying so in your scenario.
  //
  // All of this will be avoided once this PR is merged and we can properly
  // know when there's a `when` coming
  // https://github.com/tactivos/murally/pull/24613
  Given('the route has finished loading', async () => {
    await getElement();
  });

  Given('"(.*)" route is visited from another window', route => {
    const page = findPage(route as PageName);
    render(page.element());
  });

  // USAGE:
  //
  // Given search params are { "param": ""value" }
  Given(
    'search params are',
    payload => {
      window.location.search = new URLSearchParams(
        JSON.parse(payload),
      ).toString();

      onTearDown(() => {
        window.location.search = '';
      });
    },
    { inline: true },
  );
}
