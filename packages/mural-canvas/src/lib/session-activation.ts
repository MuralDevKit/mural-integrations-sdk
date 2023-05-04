import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';

/**
 * Request a session activation context from the MURAL canvas to
 * prepare the canvas to safely activate our session using the
 * redirect flow.
 */
export function muralSessionActivationUrl(
  apiClient: ApiClient,
  authUrl: URL | string,
  muralUrl: URL | string,
): URL {
  const authURL = new URL(authUrl.toString());
  const muralURL = new URL(muralUrl.toString());

  const activateURL = new URL('/signin-code/authenticate', muralURL);

  activateURL.searchParams.set('redirectUrl', muralURL.href);
  activateURL.searchParams.set('authUrl', authURL.href);
  activateURL.searchParams.set('clientId', apiClient.config.appId);
  activateURL.searchParams.set('flow', 'redirect');
  activateURL.searchParams.set('t', new Date().getTime().toString()); // disable any caching

  return activateURL;
}

/**
 * Request a session activation context from the MURAL canvas to prepare the
 * canvas to safely activate our session using the RPC flow.
 */
export function muralSessionActivationUrlRpc(
  apiClient: ApiClient,
  muralUrl: URL | string,
): URL {
  const muralURL = new URL(muralUrl.toString());

  const activateURL = new URL('/signin-code/authenticate', muralURL);

  activateURL.searchParams.set('redirectUrl', muralURL.href);
  activateURL.searchParams.set('clientId', apiClient.config.appId);
  activateURL.searchParams.set('flow', 'rpc');
  activateURL.searchParams.set('t', new Date().getTime().toString()); // disable any caching

  return activateURL;
}

/**
 * Generates a session claim URL to activate our current session within
 * the requested MURAL canvas.
 */
export async function muralSessionClaimUrl(
  apiClient: ApiClient,
  muralUrl: URL | string,
  code: string,
): Promise<URL> {
  const redirectUrl = new URL(muralUrl.toString());
  const claimRequestUrl = apiClient.url(
    `/api/v0/authenticate/oauth2/session/${code}`,
  );

  claimRequestUrl.searchParams.set('redirectUrl', redirectUrl.href);

  const res: Response = await apiClient.fetch(claimRequestUrl.href, {
    method: 'PUT',
  });

  const claimUrl = await res.json();
  return new URL(claimUrl);
}

/**
 * Create a Mural session from client app claims.
 */
export async function createMuralSession(
  apiClient: ApiClient,
  code: string,
): Promise<void> {
  const claimRequestUrl = apiClient.url(
    `/api/v0/authenticate/oauth2/session/${code}`,
  );

  await apiClient.fetch(claimRequestUrl.href, { method: 'PUT' });
}
