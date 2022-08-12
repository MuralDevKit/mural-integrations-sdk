import { SetupFnArgs } from 'pickled-cucumber/types';

export default function registerWhen({ When }: SetupFnArgs) {
  // USAGE:
  //
  // When receive window post message "message_example"
  When(
    'receive window post message',
    payload => {
      window.postMessage(JSON.parse(payload), '*');
    },
    { inline: true },
  );
}
