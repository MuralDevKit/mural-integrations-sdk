import FakeTimers from '@sinonjs/fake-timers';
import { SetupFnArgs } from 'pickled-cucumber/types';

export default function registerWhen({ getCtx, When }: SetupFnArgs) {
  // USAGE:
  //
  // When the fake timer advances 500 ms
  When('the fake timer advances {int} ms', async timeMs => {
    const timeMsInt = parseInt(timeMs, 10);
    const clock = getCtx<FakeTimers.Clock>('$clock');

    await clock.tickAsync(timeMsInt);
  });
}
