import { SetupFnArgs } from 'pickled-cucumber/types';

import dom from './dom';
import misc from './misc';
import network from './network';

export default function registerThen(args: SetupFnArgs) {
  dom(args);
  misc(args);
  network(args);
}
