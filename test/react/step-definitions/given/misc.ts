import { SetupFnArgs } from 'pickled-cucumber/types';
import { setSession } from '../../../../packages/mural-client';
import { DELAYS as MURAL_PICKER_DELAY } from '../../../../packages/mural-picker';
import { dummyToken, get, set } from '../../../utils';

export default function registerGiven({
  Given,
  setCtx,
  onTearDown,
}: SetupFnArgs) {
  // USAGE:
  //
  // Given I'm logged in
  Given(
    "I'm logged in",
    (claims?: string) => {
      setSession(
        {
          accessToken: dummyToken(JSON.parse(claims || '{}')),
          refreshToken: dummyToken(),
        },
        localStorage,
      );
    },
    {
      optional: 'with claims',
    },
  );

  // USAGE:
  //
  // Given store session storage "mural.oauth.state" in S
  Given(
    'store session storage "(.*)" in {variable}',
    (storageKey, variable) => {
      setCtx(variable, sessionStorage.getItem(storageKey));
    },
  );

  // USAGE:
  //
  // Given I have "/url" in "store_key" of local storage
  Given('I have "(.*)" in "(.*)" of local storage', (value, storageKey) => {
    localStorage.setItem(storageKey, value);
  });

  // USAGE FOR MURAL PICKER:
  //
  // Given mural picker delay "ASYNC_TIMEOUT" is 0ms
  //
  Given('mural picker delay "(.*)" is {int}ms', (delayName, ms) => {
    const prev = get(MURAL_PICKER_DELAY, delayName);
    set(MURAL_PICKER_DELAY, delayName, ms);
    onTearDown(() => {
      set(MURAL_PICKER_DELAY, delayName, prev);
    });
  });
}
