import FakeTimers from '@sinonjs/fake-timers';

import { SetupFnArgs } from 'pickled-cucumber/types';

export default function registerGiven({
  Given,
  onTearDown,
  setCtx,
}: SetupFnArgs) {
  // USAGE:
  //
  // Given a fake timer
  Given('a fake timer', () => {
    const clock = FakeTimers.install({
      now: Date.now(),
      shouldClearNativeTimers: true,
    });

    setCtx<FakeTimers.Clock>('$clock', clock);

    onTearDown(() => {
      clock.uninstall();
    });
  });
}
