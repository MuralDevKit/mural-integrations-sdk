import * as jwt from 'jsonwebtoken';
import * as qs from 'qs';
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
  authorizeFn?: ReturnType<typeof authorizeHandler>;
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
    if (!(error instanceof FetchError)) {
      throw error;
    }

    const session = fetchConfig.sessionStore.get();

    if (
      error.response.status === 401 &&
      error.text === 'Need to Refresh' &&
      session &&
      session.refreshToken
    ) {
      await fetchConfig.refreshTokenFn({ store: true });
      // For api retry we should use the newly refreshed token and not the original one
      return authenticatedFetch(input, init);
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
export const authorizeHandler =
  (config: TokenHandlerConfig) =>
  async (
    redirectUri?: string,
    opts: AuthorizeHandlerOptions = { storeState: false },
  ): Promise<string> =>
    fetchAuthUrlHandler(config)({
      redirectUri,
      storeState: opts.storeState,
      ...opts.authorizeParams,
    });

export const fetchAuthUrlHandler =
  (config: TokenHandlerConfig) =>
  async (opts: {
    auto?: boolean | AutomaticOptions;
    forward?: { [key: string]: unknown };
    reauthenticate?: boolean;
    redirectUri?: string;
    signup?: boolean;
    state?: string;
    storeState?: boolean;
  }) => {
    const stateToUse = opts.state || generateState();

    const params = qs.stringify(
      {
        auto: opts.auto ? encodeAutoParam(opts.auto) : undefined,
        reauthenticate: opts.reauthenticate || undefined,
        redirectUri: opts.redirectUri,
        signup: opts.signup || undefined,
        state: stateToUse,
        ...opts.forward,
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
export const requestTokenHandler =
  (config: TokenHandlerConfig) =>
  async (
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
export const refreshTokenHandler =
  (config: TokenHandlerConfig) =>
  async (opts = { store: false }): Promise<Session> => {
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
