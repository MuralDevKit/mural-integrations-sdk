import jwt from 'jsonwebtoken';
import {
  generateState,
  Session,
  setupSessionStore,
  storeState,
  validateState,
} from './session';

export type TokenHandlerConfig = {
  authorizeUri: string;
  requestTokenUri: string;
  refreshTokenUri: string;
};

export type AuthenticatedFetchConfig = {
  authorizeFn: ReturnType<typeof authorizeHandler>;
  requestTokenFn: ReturnType<typeof requestTokenHandler>;
  refreshTokenFn: ReturnType<typeof refreshTokenHandler>;
  sessionStore: ReturnType<typeof setupSessionStore>;
};

let fetchConfig: AuthenticatedFetchConfig;

export const authenticated = () => {
  const session = fetchConfig.sessionStore.get();
  return !!(session && !isTokenExpired(session.refreshToken));
};

const authenticatedFetch = async (
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> => {
  // setup all the handlers
  await verifyTokensExpiration();

  const initWithAuth = {
    ...init,
    headers: withAuthenticationToken(init.headers || {}),
  };

  try {
    return fetch(input, initWithAuth).then(checkStatus);
  } catch (err) {
    const errorHandler = catchAuthenticationError(input, initWithAuth);
    return errorHandler(err);
  }
};

function withAuthenticationToken(headers: HeadersInit) {
  const session = fetchConfig.sessionStore.get();
  const accessToken = session && session.accessToken;

  if (!accessToken) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${accessToken}`,
  };
}

async function verifyTokensExpiration() {
  const session = fetchConfig.sessionStore.get();
  if (session) {
    if (isTokenExpired(session.refreshToken)) {
      fetchConfig.sessionStore.delete();
    } else if (isTokenExpired(session.accessToken)) {
      await fetchConfig.refreshTokenFn({ store: true });
    }
  }
}

function isTokenExpired(token: string) {
  const result = jwt.decode(token) as { [key: string]: any };
  if (result && result.exp) {
    if (Date.now() < result.exp * 1000) {
      return false;
    }
  }
  return true;
}

export class FetchError extends Error {
  response?: Response;
}

function checkStatus(response: Response) {
  if (response.ok) return response;

  const error = new FetchError(
    `Request to ${new URL(response.url).pathname} failed with status ${
      response.status
    }`,
  );
  error.response = response;
  throw error;
}

function catchAuthenticationError(input: RequestInfo, init: RequestInit = {}) {
  return async (error: { response: Response }): Promise<Response> => {
    const session = fetchConfig.sessionStore.get();
    const res = await extractErrorResponse(error.response);

    if (
      res.status === 401 &&
      res.text === 'Need to Refresh' &&
      session &&
      session.refreshToken
    ) {
      await fetchConfig.refreshTokenFn({ store: true });
      // For api retry we should use the newly refreshed token and not the original one
      return authenticatedFetch(input, init);
    }

    /*
   There's currently a bug on mural-api side which causes that some possible errors are transformed into CORS error.
     - This appends because 'Access-Control-Allow-Origin' is not set correctly when an error occurs
     - So temporarily we are dealing with the invalid session error when status is 0
     - TODO: update this code when mural-api bug is fixed
    */
    const invalidSessionError = res.status === 0 || res.status === 401;
    if (invalidSessionError) {
      fetchConfig.sessionStore.delete();
      window.location.reload();

      // resolving here to ensure we aren't retrying forever
      return Promise.resolve(error.response as Response);
    }

    throw {
      ...error,
      response: error.response ? { ...error.response, ...res } : undefined,
    };
  };
}

async function extractErrorResponse(res?: Response) {
  if (!res) return { status: 0, json: undefined, text: undefined };
  let text: string | undefined;
  let json: any;

  try {
    text = await res.text();
    json = text && text.match(/^[[{"]/) ? JSON.parse(text) : undefined;
    if (json) text = undefined;
    // eslint-disable-next-line no-empty
  } catch (_) {}

  return {
    json,
    text,
    status: res.status,
  };
}

export const authorizeHandler = (config: TokenHandlerConfig) => async (
  redirectUri?: string,
  opts = { store: false },
): Promise<string> => {
  const state = generateState();

  // validate that the state hasn't been tampered
  const params = new URLSearchParams();
  if (redirectUri) params.set('redirectUri', redirectUri);
  params.set('state', state);

  const url = `${config.authorizeUri}?${params}`;

  const authorizeUrl = await fetch(url, { method: 'GET' })
    .then(checkStatus)
    .then(res => res.text());

  if (opts.store) {
    storeState(state);
  }

  return authorizeUrl;
};

export const requestTokenHandler = (config: TokenHandlerConfig) => async (
  code: string,
  state: string,
  opts = { store: false },
): Promise<Session> => {
  // validate that the state hasn't been tampered
  if (!validateState(state)) throw new Error('INVALID_STATE');

  const url = `${config.requestTokenUri}?code=${code}`;
  const session = await fetch(url, { method: 'GET' })
    .then(checkStatus)
    .then(res => res.json());

  if (opts.store) {
    fetchConfig.sessionStore.set(session);
  }

  return session;
};

export const refreshTokenHandler = (config: TokenHandlerConfig) => async (
  opts = { store: false },
): Promise<Session> => {
  const staleSession = fetchConfig.sessionStore.get();
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      refreshToken: staleSession && staleSession.refreshToken,
    }),
  };

  const freshSession: Session = await fetch(config.refreshTokenUri, options)
    .then(checkStatus)
    .then(res => res.json());

  if (opts.store) {
    fetchConfig.sessionStore.set(freshSession);
  }

  return freshSession;
};

// This is a shortcut as this file as multiple dependencies
// we'll ensure we require the call to `setup` or anyways
// something would break down the road
export default function setup(
  config: AuthenticatedFetchConfig,
): typeof authenticatedFetch {
  fetchConfig = config;

  return authenticatedFetch;
}
