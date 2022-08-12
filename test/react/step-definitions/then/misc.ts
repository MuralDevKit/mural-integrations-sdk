import { fail } from 'assert';
import { SetupFnArgs } from 'pickled-cucumber/types';
import { prettyDOM } from '@testing-library/react';
import { getSession } from '../../../../packages/mural-client';

export default function registerThen({ Then, compare, getCtx }: SetupFnArgs) {
  // USAGE:
  //
  // Then printing document body for debugging
  //
  // If you need to use this step it's easier for others to understand it so
  // please use the explanation space provided on the step :)
  Then('printing document body for debugging', () => {
    console.log(prettyDOM(document.body));
  });

  // USAGE:
  //
  // Then session is in storage
  // Then session is not in storage
  Then('session is( not)? in storage', not => {
    const session = getSession(localStorage);
    compare('is', !!session, not ? 'false' : 'true');
  });

  // USAGE:
  //
  // Then window has been closed
  Then('window has been closed', () => {
    const windowClosed = getCtx('$window-closed') || false;
    if (!windowClosed) fail('Window was not closed');
  });

  // USAGE:
  //
  // Then window has been reloaded
  Then('window has been reloaded', () => {
    const windowReloaded = getCtx('$window-reloaded') || false;
    if (!windowReloaded) fail('Window was not reloaded');
  });
}
