import * as jwt from 'jsonwebtoken';
import * as qs from 'qs';
import {
  generateState,
  OauthTokens,
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

export class InvalidSessionError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'InvalidSessionError';
  }
}

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
    const response = await fetch(input, initWithAuth);
    return await checkStatus(response);
  } catch (err: any) {
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
  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }

  static async fromResponse(response: Response) {
    const fetchError = new FetchError(
      `Request to ${response.url} failed with status ${response.status}`,
      response,
    );
    await fetchError.readResponseContent();
    return fetchError;
  }

  async readResponseContent() {
    const { text, json } = await extractErrorContent(this.response);
    this.text = text;
    this.json = json;
  }

  json?: {};
  response: Response;
  text?: string;
}

async function checkStatus(response: Response) {
  if (response.ok) return response;
  throw await FetchError.fromResponse(response);
}

function catchAuthenticationError(input: RequestInfo, init: RequestInit = {}) {
  return async (error: FetchError | Error): Promise<Response> => {
    const session = fetchConfig.sessionStore.get();

    if (
      error instanceof FetchError &&
      error.response.status === 401 &&
      error.text === 'Need to Refresh' &&
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
     - So temporarily we are dealing any networking errors as an invalid session
     - TODO: update this code when mural-api bug is fixed
    */
    const invalidSessionError =
      !(error instanceof FetchError) || error.response.status === 401;
    if (invalidSessionError) {
      fetchConfig.sessionStore.delete();
      throw new InvalidSessionError();
    }

    throw error;
  };
}

async function extractErrorContent(response: Response) {
  let text: string | undefined;
  let json: any;

  try {
    text = await response.text();
    json =
      text && text.match(new RegExp('^[[{"]')) ? JSON.parse(text) : undefined;
    if (json) text = undefined;
    // eslint-disable-next-line no-empty
  } catch (_) {}

  return {
    json,
    text,
  };
}

const encodeAutoParam = (auto: boolean | AutomaticOptions): string => {
  if (typeof auto === 'boolean') {
    return auto.toString();
  }

  const payload = Buffer.from(JSON.stringify(auto)).toString('base64');
  return `json:${payload}`;
};

interface AutomaticOptions {
  email: string;
  action: 'signin' | 'signup';
  consentSso?: boolean;
}

export interface AuthorizeParams {
  auto?: boolean | AutomaticOptions;
  signup?: boolean;
  reauthenticate?: boolean;
  forward?: {
    [key: string]: unknown;
  };
}

export interface AuthorizeHandlerOptions {
  authorizeParams?: AuthorizeParams;
  storeState: boolean;
}

export const authorizeHandler = (config: TokenHandlerConfig) => async (
  redirectUri?: string,
  opts: AuthorizeHandlerOptions = { storeState: false },
): Promise<string> => {
  const state = generateState();

  const params = qs.stringify(
    {
      state,
      redirectUri,
      auto: opts.authorizeParams?.auto
        ? encodeAutoParam(opts.authorizeParams.auto)
        : undefined,
      signup: opts.authorizeParams?.signup || undefined,
      reauthenticate: opts.authorizeParams?.reauthenticate || undefined,
      ...opts.authorizeParams?.forward,
    },
    { encode: true },
  );

  const url = `${config.authorizeUri}?${params}`;

  const authorizeUrl = await fetch(url, { method: 'GET' })
    .then(checkStatus)
    .then(res => res.text());

  if (opts.storeState) {
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
): Promise<OauthTokens> => {
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

  const freshSession: OauthTokens = await fetch(config.refreshTokenUri, options)
    .then(checkStatus)
    .then(res => res.json());

  if (opts.store) {
    fetchConfig.sessionStore.set(freshSession);
  }

  return freshSession;
};

// This is a shortcut as this file as multiple dependencies
// we'll ensure we require the call to `setup` or anyways
// something would break down the road.
//
// Having a module-level configuration makes it easier to
// import the fetchFn from multiple files.
//
// This should be treated as a singleton.
export default function setup(
  config: AuthenticatedFetchConfig,
): typeof authenticatedFetch {
  fetchConfig = config;

  return authenticatedFetch;
}
