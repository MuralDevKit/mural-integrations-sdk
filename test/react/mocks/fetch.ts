import fetchMock from 'fetch-mock';
import { ROUTES as muralApiRoutes } from './mural-api';
// import { ROUTES as integrationsApiRoutes } from './integrations-api';

export const initialize = () => {
  fetchMock.config.warnOnFallback = false;
  fetchMock.config.overwriteRoutes = true;

  fetchMock.catch((url: string, opts) => {
    console.log(
      `WARN The following request ${opts.method} "${url}" has been called and is not mocked in 'src/test/react/mocks/network-mock.ts'`,
    );

    // Return empty string here to ignore unmatched url call
    return '';
  });

  reset();
};

export const ROUTES = { ...muralApiRoutes };

export const mockApi = (
  route: keyof typeof ROUTES,
  method: string,
  status: number,
  body?: {},
) => fetchMock.mock({ url: ROUTES[route], method }, { status, body });

export const reset = () => {
  fetchMock.restore();
};
