import { SetupFnArgs } from 'pickled-cucumber/types';

import input from './input';
import misc from './misc';
import timer from './timer';
import window from './window';

export default function registerWhen(args: SetupFnArgs) {
  input(args);
  misc(args);
  timer(args);
  window(args);
}
