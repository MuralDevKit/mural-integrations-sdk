import { SetupFnArgs } from 'pickled-cucumber/types';
import { fail } from 'assert';
import { mockApi, ROUTES } from '../../mocks/fetch';

export default function registerGiven({ Given }: SetupFnArgs) {
  // USAGE:
  // 'api' value should be present on ROUTES enum (network-mock.ts)
  //
  // Given the GET TIMER api response is 200 status with
  // """
  //  {} -> body content
  // """
  const ROUTE_TYPES = Object.keys(ROUTES).join('|');
  Given(
    `the (GET|PUT|POST|PATCH|DELETE) (${ROUTE_TYPES}) api response is {int} status`,
    (method, routeVar, status, payload) => {
      const route = routeVar as keyof typeof ROUTES;
      if (!ROUTES[route])
        return fail(`${routeVar} route is not defined in network-mock.ts`);

      mockApi(route, method, parseInt(status, 10), JSON.parse(payload || '{}'));
    },
    { optional: 'with' },
  );
}
