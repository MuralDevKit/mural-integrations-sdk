import buildApiClient, {
  setupAuthenticatedFetch,
  authorizeHandler,
  requestTokenHandler,
  refreshTokenHandler,
  setupSessionStore,
} from '@muraldevkit/mural-integrations-mural-client';
import { FAKE_CLIENT_ID, FAKE_MURAL_HOST } from '../../utils';

const oauthUrl = new URL('http://oauth.testing.rig');

const fetchConfig = {
  authorizeUri: new URL('/', oauthUrl).href,
  requestTokenUri: new URL('/token', oauthUrl).href,
  refreshTokenUri: new URL('/refresh', oauthUrl).href,
};

const fetchFn = setupAuthenticatedFetch({
  authorizeFn: authorizeHandler(fetchConfig),
  requestTokenFn: requestTokenHandler(fetchConfig),
  refreshTokenFn: refreshTokenHandler(fetchConfig),
  sessionStore: setupSessionStore(localStorage),
});

export const apiClient = buildApiClient(fetchFn, {
  appId: FAKE_CLIENT_ID,
  muralHost: FAKE_MURAL_HOST,
  integrationsHost: FAKE_MURAL_HOST,
});
