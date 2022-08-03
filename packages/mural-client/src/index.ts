import setupAuthenticatedFetch, {
  authenticated,
  authorizeHandler,
  FetchError,
  refreshTokenHandler,
  requestTokenHandler,
  TokenHandlerConfig,
} from './fetch';
import { setupSessionStore } from './session';
import { Mural, Room, Template, User, Workspace } from './types';

export * from './fetch';
export * from './session';
export * from './types';

export { default as setupAuthenticatedFetch } from './fetch';

export type FetchFunction = (
  input: RequestInfo,
  init?: RequestInit,
) => Promise<Response>;

export type ClientConfig = {
  appId: string;
  fetchFn: FetchFunction;
  muralHost: string;
  integrationsHost: string;
  secure: boolean;
};

export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export type PaginatedOptions = {
  limit: number;
  next: string;

  sortBy?: string;
};

const DEFAULT_CONFIG = {
  muralHost: 'app.mural.co',
  integrationsHost: 'integrations.mural.co',
  secure: true,
};

export type BuildClientArgs = {
  appId: string;
  muralHost?: string;
  integrationsHost?: string;
  secure?: boolean;
  storage?: Storage;
} & TokenHandlerConfig;

export const getApiError = async (error: Error): Promise<ApiError | null> => {
  if (!(error instanceof FetchError) || !error.json) return null;

  const errorPayload = error.json as { code: string; message: string };

  return {
    code: errorPayload.code,
    message: errorPayload.message || error.message,
    status: error.response.status,
  };
};

/**
 * Create an ApiClient instance from the provided configuration.
 *
 * @param args.appId MURAL App `client_id`
 * @param args.muralHost MURAL API service host (default: 'app.mural.co')
 * @param args.integrationsHost MURAL integrations API service host (default: 'integrations.mural.co')
 * @param args.secure Whether the client should use TLS (default: true)
 * @param args.storage 'Storage' compatible store for the session management.
 *
 * @returns ApiClient
 */
export function buildClientConfig(args: BuildClientArgs): ClientConfig {
  const fetchFn = setupAuthenticatedFetch({
    authorizeFn: authorizeHandler(args),
    requestTokenFn: requestTokenHandler(args),
    refreshTokenFn: refreshTokenHandler(args),
    sessionStore: setupSessionStore(args.storage || localStorage),
  });

  return {
    ...DEFAULT_CONFIG,
    ...args,
    fetchFn,
  };
}

export type Envelope<TResource> = {
  value: TResource;
  next?: TResource extends any[] ? string | null : undefined;
};

type Sorted<TResource = null> = {
  sortBy: keyof (TResource extends (infer TInner)[] ? TInner : TResource);
};

type Paginated<TResource = null> = {
  paginate: {
    limit: number;
    next?: string | null;
  };
} & Sorted<TResource>;

type Integration<_TResource = null> = { integration: boolean };

const isSorted = (
  options: Sorted | Paginated | Integration | Record<string, any>,
): options is Sorted => 'sortBy' in options;

const isPaginated = (
  options: Sorted | Paginated | Integration | Record<string, any>,
): options is Paginated => 'paginate' in options;

const isIntegration = (
  options: Sorted | Paginated | Integration | Record<string, any>,
): options is Integration => 'integration' in options;

type Primitive = number | string | boolean | bigint;

type TResolvedOptions<TResource, TOptions> = Partial<
  (TOptions extends Sorted ? Sorted<TResource> : {}) &
    (TOptions extends Paginated ? Paginated<TResource> : {}) &
    (TOptions extends Integration ? Integration<TResource> : {}) &
    TOptions
>;

export type ResourceEndpoint<
  TResource,
  TParams = void,
  TOptions = null,
> = TParams extends void
  ? (
      options?: TResolvedOptions<TResource, TOptions>,
    ) => Promise<Envelope<TResource>>
  : (
      query: TParams,
      options?: TResolvedOptions<TResource, TOptions>,
    ) => Promise<Envelope<TResource>>;

const optionsParams = (
  options:
    | Partial<Sorted<any> | Paginated<any> | Integration<any>>
    | { [key: string]: Primitive }
    | undefined,
) => {
  const params = new URLSearchParams();
  if (!options) return params;

  if (isSorted(options)) {
    // @ts-ignore
    params.set('sortBy', options.sortBy.toString());

    // @ts-ignore
    delete options.sortBy;
  }

  if (isPaginated(options)) {
    params.set('limit', options.paginate.limit.toString());
    if (options.paginate.next) params.set('next', options.paginate.next);

    // @ts-ignore
    delete options.paginate;
  }

  if (isIntegration(options)) {
    if (options.integration)
      params.set('integration', options.integration.toString());

    // @ts-ignore
    delete options.integration;
  }

  // spread the rest as-is
  for (const [key, val] of Object.entries(options)) {
    params.set(key, val.toString());
  }

  return params;
};

// ====

export interface ApiClient {
  authenticated: () => boolean;
  config: {
    appId: string;
    muralHost: string;
    integrationsHost: string;
    secure: boolean;
  };
  fetch: FetchFunction;
  url: (path: string) => URL;
  track: (event: string, properties?: {}) => void;
  createMural: ResourceEndpoint<
    Mural,
    {
      title: string;
      workspaceId: string;
      roomId: string;
    }
  >;
  createMuralFromTemplate: ResourceEndpoint<
    Mural,
    {
      title: string;
      roomId: string;
      templateId: string;
    }
  >;
  getCurrentUser: ResourceEndpoint<User>;
  getMural: ResourceEndpoint<Mural, { id: string }, Integration>;
  getMuralsByRoom: ResourceEndpoint<
    Mural[],
    { roomId: string },
    Paginated & Sorted & Integration
  >;
  getMuralsByWorkspace: ResourceEndpoint<
    Mural[],
    { workspaceId: string },
    Paginated & Sorted & Integration
  >;
  getDefaultTemplates: ResourceEndpoint<Template[], void, Paginated & Sorted>;
  getRoomsByWorkspace: ResourceEndpoint<
    Room[],
    { workspaceId: string },
    Paginated & Sorted
  >;
  getWorkspace: ResourceEndpoint<Workspace, { id: string }>;
  getWorkspaces: ResourceEndpoint<Workspace[], void, Paginated & Sorted>;
  getTemplatesByWorkspace: ResourceEndpoint<
    Template[],
    { workspaceId: string },
    Paginated & Sorted & { withoutDefault: boolean }
  >;
  searchMuralsByWorkspace: ResourceEndpoint<
    Mural[],
    { workspaceId: string; title: string },
    Paginated & Sorted & Integration
  >;
  searchRoomsByWorkspace: ResourceEndpoint<
    Room[],
    { workspaceId: string; title: string },
    Paginated & Sorted
  >;

  /**
   * @deprecated Use `getCurrentUser` instead.
   */
  getLastActiveWorkspaceId: ResourceEndpoint<string | null>;
}

export default (config: ClientConfig): ApiClient => {
  const { fetchFn } = config;

  function url(path: string): URL {
    return new URL(
      path,
      `http${config.secure ? 's' : ''}://${config.muralHost}`,
    );
  }

  function integrationsUrl(path: string): URL {
    return new URL(
      path,
      `http${config.secure ? 's' : ''}://${config.integrationsHost}`,
    );
  }

  const baseUrl = url('/api/public/v1/');
  const api = (path: string) => new URL(path, baseUrl).href;
  const trackingUrl = integrationsUrl('/integrations/api/v0/track').href;

  const client: ApiClient = {
    authenticated,
    config,
    fetch: fetchFn,
    url,
    track: async (event: string, properties?: {}) => {
      try {
        const body = {
          event,
          properties,
        };
        fetchFn(trackingUrl, {
          body: JSON.stringify(body),
          credentials: 'include',
          mode: 'cors',
          headers: {
            'content-type': 'application/json',
          },
          method: 'POST',
        });
      } catch (err) {
        // suppress any error in tracking
      }
    },
    // https://developers.mural.co/public/reference/createmural
    createMural: async body => {
      const response = await fetchFn(api('murals'), {
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });

      return response.json();
    },
    // https://developers.mural.co/public/reference/createmuralfromtemplate
    createMuralFromTemplate: async ({ title, roomId, templateId }) => {
      const response = await fetchFn(api(`templates/${templateId}/murals`), {
        body: JSON.stringify({ title, roomId }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });

      return response.json();
    },
    // https://developers.mural.co/public/reference/getcurrentmember
    getCurrentUser: async () => {
      const response = await fetchFn(api('users/me'), {
        method: 'GET',
      });

      return await response.json();
    },
    // https://developers.mural.co/public/reference/getglobaltemplates
    getDefaultTemplates: async () => {
      const response = await fetchFn(api('templates'), {
        method: 'GET',
      });

      return await response.json();
    },
    // https://developers.mural.co/public/reference/getmuralbyid
    getMural: async ({ id }, options) => {
      const params = optionsParams(options);

      const response = await fetchFn(api(`murals/${id}?${params}`), {
        method: 'GET',
      });

      return await response.json();
    },
    // https://developers.mural.co/public/reference/getroommurals
    getMuralsByRoom: async ({ roomId }, options) => {
      const params = optionsParams(options as any);
      const response = await fetchFn(api(`rooms/${roomId}/murals?${params}`), {
        method: 'GET',
      });
      return await response.json();
    },
    // https://developers.mural.co/public/reference/getworkspacemurals
    getMuralsByWorkspace: async ({ workspaceId }, options) => {
      const params = optionsParams(options);
      const response = await fetchFn(
        api(`workspaces/${workspaceId}/murals?${params}`),
        {
          method: 'GET',
        },
      );

      return await response.json();
    },
    // https://developers.mural.co/public/reference/getworkspacerooms
    getRoomsByWorkspace: async ({ workspaceId }, options) => {
      const params = optionsParams(options);
      const response = await fetchFn(
        api(`workspaces/${workspaceId}/rooms?${params}`),
        {
          method: 'GET',
        },
      );

      return await response.json();
    },
    // https://developers.mural.co/public/reference/getworkspace
    getWorkspace: async ({ id }) => {
      const response = await fetchFn(api(`workspaces/${id}`), {
        method: 'GET',
      });
      return response.json();
    },
    // https://developers.mural.co/public/reference/getworkspaces
    getWorkspaces: async () => {
      const response = await fetchFn(api(`workspaces`), {
        method: 'GET',
      });
      return await response.json();
    },
    // https://developers.mural.co/public/reference/gettemplatesbyworkspace
    getTemplatesByWorkspace: async ({ workspaceId }, options) => {
      const params = optionsParams(options);
      const response = await fetchFn(
        api(`workspaces/${workspaceId}/templates?${params}`),
        {
          method: 'GET',
        },
      );

      return await response.json();
    },
    // https://developers.mural.co/public/reference/searchmurals
    searchMuralsByWorkspace: async ({ workspaceId, title }, options) => {
      const params = optionsParams(options);

      // title must be at least 3 characters for a successful search
      if (title.length < 3) {
        throw new Error('title argument must be at least 3 characters.');
      }

      params.set('title', title);

      const response = await fetchFn(
        api(`search/${workspaceId}/murals?${params}`),
        {
          method: 'GET',
        },
      );

      return await response.json();
    },
    // https://developers.mural.co/public/reference/searchrooms
    searchRoomsByWorkspace: async ({ workspaceId, title }, options) => {
      const params = optionsParams(options);

      // tile must be at least 3 characters for a successful search
      if (title.length < 3) {
        throw new Error('title argument must be at least 3 characters.');
      }

      params.set('title', title);

      const response = await fetchFn(
        api(`search/${workspaceId}/rooms?${params}`),
        {
          method: 'GET',
        },
      );

      return await response.json();
    },
    /**
     * @deprecated
     * We should keep the client interface closely bound to the
     * public API definition.
     *
     * This function will probably be removed in the future
     */
    getLastActiveWorkspaceId: async () => {
      const response = await fetchFn(api(`users/me`), {
        method: 'GET',
      });

      const user: Envelope<User> = await response.json();

      return { value: user?.value?.lastActiveWorkspace || null };
    },
  };

  return client;
};
