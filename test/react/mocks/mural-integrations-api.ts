import fetchMock from 'fetch-mock';

export const ROUTES = {
  TRACK: `glob:*/integrations/api/v0/track`,
};

export const registerGlobalRoutes = () => {
  fetchMock.post(ROUTES.TRACK, 201);
};
