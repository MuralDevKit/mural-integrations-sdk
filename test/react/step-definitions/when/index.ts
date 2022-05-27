import { SetupFnArgs } from 'pickled-cucumber/types';

import input from './input';
import misc from './misc';
import window from './window';

export default function registerWhen(args: SetupFnArgs) {
  input(args);
  misc(args);
  window(args);
}
