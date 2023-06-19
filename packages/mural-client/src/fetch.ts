import jwt from 'jsonwebtoken';
import { memoize } from 'lodash';
import * as qs from 'qs';
import {
  generateState,
  Session,
  setupSessionStore,
  storeState,
  validateState,
} from './session';

const MINIMUM_TIME_FOR_REQUEST = 5000; // In milliseconds

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

/**
 * This error is thrown whenever the ApiClient sent an authenticated request
 * to the Public API, and the response was 401 — UNAUTHORIZED
 *
 * This means the current session isn't valid and thus the ApiClient should
 * be re-authenticated with the Public API.
 */
export class InvalidSessionError extends Error {
  error: Error;

  constructor(error: Error, message?: string) {
    super(message);

    this.error = error;
    this.name = 'InvalidSessionError';
  }

  static fromError(error: Error) {
    return new InvalidSessionError(error, error.message);
  }
}

let fetchConfig: AuthenticatedFetchConfig;

export const authenticated = () => {
  const session = fetchConfig.sessionStore.get();
  return !!(session && !isTokenExpiredOrWillSoon(session.refreshToken));
};

const authenticatedFetch = async (
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> => {
  const session = await getSession();
  const initWithAuth = {
    ...init,
    headers: {
      ...init.headers,
      ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    },
  };

  try {
    const response = await fetch(input, initWithAuth);
    return await checkStatus(response);
  } catch (err: any) {
    const errorHandler = catchAuthenticationError();
    return errorHandler(err);
  }
};

const getSession = async (): Promise<Session | null> => {
  const session = fetchConfig.sessionStore.get();

  if (!session) return null;

  if (isTokenExpiredOrWillSoon(session.refreshToken)) {
    fetchConfig.sessionStore.delete();
    return null;
  }

  return handleTokenRefresh(session);
};

const refreshToken = memoize(
  (_session: Session) => {
    return fetchConfig.refreshTokenFn({ store: true });
  },
  (session: Session) => session.accessToken,
);

const handleTokenRefresh = (session: Session) => {
  if (isTokenExpiredOrWillSoon(session.accessToken)) {
    return refreshToken(session);
  }
  return Promise.resolve(session);
};
/* Decode the given token to look at expiration
 * - Check if the token is expired
 * - Make sure the token is valid long enough to issue a request */
const isTokenExpiredOrWillSoon = (token: string) => {
  const result = jwt.decode(token) as { [key: string]: any };
  if (!result || !result.exp) return false;

  const expiration = result.exp * 1000;
  const timeUntilExpiration = expiration - Date.now();
  return timeUntilExpiration < MINIMUM_TIME_FOR_REQUEST;
};

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

function catchAuthenticationError() {
  return async (error: FetchError | Error): Promise<Response> => {
    if (!(error instanceof FetchError)) {
      throw error;
    }

    // In the case that we sent a authenticated request to the back-end
    // and we receive 401, this means our current session is tainted
    // and invalid.
    if (error.response.status === 401) {
      fetchConfig.sessionStore.delete();
      throw InvalidSessionError.fromError(error);
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
  state?: string;
  storeState: boolean;
}

/**
 * Builds the MURAL OAuth authorisation URL via the configured Auth service.
 *
 * @param redirectUri If your application has multiple possible authentication
 * callbacks, you can specify it using this parameter.
 *
 * Defaults to the first configured `redirectUri` in the MURAL App configuration.
 *
 * @param opts.storeState If your application want to use the OAuth `state` parameter
 * this will automatically persist it in storage.
 *
 * @returns Authorization URL
 */
export const authorizeHandler = (config: TokenHandlerConfig) => async (
  redirectUri?: string,
  opts: AuthorizeHandlerOptions = { storeState: false },
): Promise<string> => {
  const stateToUse = opts.state || generateState();

  const params = qs.stringify(
    {
      auto: opts.authorizeParams?.auto
        ? encodeAutoParam(opts.authorizeParams.auto)
        : undefined,
      reauthenticate: opts.authorizeParams?.reauthenticate || undefined,
      redirectUri,
      signup: opts.authorizeParams?.signup || undefined,
      state: stateToUse,
      ...opts.authorizeParams?.forward,
    },
    { encode: true },
  );

  const url = `${config.authorizeUri}?${params}`;

  const authorizeUrl = await fetch(url, { method: 'GET' })
    .then(checkStatus)
    .then(res => res.text());

  if (opts.storeState) {
    storeState(stateToUse);
  }

  return authorizeUrl;
};

/**
 * Exchange the `authorization_code` via the configured Auth service.
 *
 * @param code This parameter should match the `code` query string parameter sent by
 * the MURAL OAuth service.
 *
 * @param state This parameter should match the `state` query string parameter sent by
 * the MURAL OAuth service (if applicable).
 *
 * @param opts.store Whether the tokens should automatically be persisted in the provided
 * storage. This is pretty handy unless you want to manage the tokens on your own.
 *
 * @returns The token pair issued from the MURAL OAuth service
 */
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

/**
 * Exchange the MURAL `refreshToken` via the configured Auth service.
 *
 * @param opts.store Whether the tokens should automatically be persisted in the provided
 * storage. This is pretty handy unless you want to manage the tokens on your own.
 *
 * @returns The token pair issued from the MURAL OAuth service
 */
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

  try {
    const freshSession: Session = await fetch(config.refreshTokenUri, options)
      .then(checkStatus)
      .then(res => res.json());

    if (opts.store) {
      fetchConfig.sessionStore.set(freshSession);
    }

    return freshSession;
  } catch (e) {
    if (
      e instanceof FetchError &&
      e.response.status >= 400 &&
      e.response.status < 500
    )
      throw InvalidSessionError.fromError(e);
    throw e;
  }
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

/**
 * Return the current `fetchConfig` used by the ApiClient
 */
export function getFetchConfig() {
  return fetchConfig;
}
