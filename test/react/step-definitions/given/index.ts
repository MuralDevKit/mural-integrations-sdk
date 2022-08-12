import { SetupFnArgs } from 'pickled-cucumber/types';

import api from './api';
import misc from './misc';
import route from './route';

export default function registerGiven(args: SetupFnArgs) {
  api(args);
  misc(args);
  route(args);
}
