import buildApiClient, {
  buildClientConfig,
} from '@muraldevkit/mural-integrations-mural-client';
import { FAKE_CLIENT_ID, FAKE_MURAL_HOST } from '../../utils';

const oauthUrl = new URL('http://oauth.testing.rig');

const clientConfig = buildClientConfig({
  appId: FAKE_CLIENT_ID,
  muralHost: FAKE_MURAL_HOST,
  authorizeUri: new URL('/', oauthUrl).href,
  requestTokenUri: new URL('/token', oauthUrl).href,
  refreshTokenUri: new URL('/refresh', oauthUrl).href,
});

export const apiClient = buildApiClient(clientConfig);
