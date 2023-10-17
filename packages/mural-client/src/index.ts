import { authenticated, getFetchConfig, FetchError } from './fetch';
import {
  Mural,
  MuralContentSession,
  MuralSort,
  Room,
  StickyNote,
  Tag,
  Template,
  User,
  Workspace,
  UpdateStickyNotePayload,
  CreateStickyNotePayload,
  Asset,
  CreateImagePayload,
  Image,
  Widget,
  TemplateSummary,
} from './types';

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
  integrationsHost?: string;
  muralHost?: string;
  secure?: boolean;
};

export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export type ApiQueryFor<T extends keyof ApiClient> = ApiClient[T] extends (
  query: infer TQuery,
  ...args: any[]
) => any
  ? TQuery
  : never;

/**
 * Error thrown when a request is aborted after calling `ApiClient.abort()`.
 */
export class AbortError extends Error {
  constructor(message: string, public cause?: Error | undefined) {
    super(message);
    this.name = this.constructor.name;
  }
}

const DEFAULT_CONFIG = {
  muralHost: 'app.mural.co',
  integrationsHost: 'integrations.mural.co',
  secure: true,
};

export const getApiError = async (error: unknown): Promise<ApiError | null> => {
  if (!(error instanceof FetchError) || !error.json) return null;

  const errorPayload = error.json as { code: string; message: string };

  return {
    code: errorPayload.code,
    message: errorPayload.message || error.message,
    status: error.response.status,
  };
};

export type Envelope<TResource> = {
  value: TResource;
  next?: TResource extends any[] ? string : undefined;
};

type Sorted<TResource = null> = {
  sortBy: TResource extends Mural[] ? MuralSort : never;
};

type Paginated<_TResource = null> = {
  paginate: {
    limit?: number;
    next?: string;
  };
};

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
    (TOptions extends Integration ? Integration<TResource> : {})
>;

export type ResourceEndpoint<
  TResource,
  TParams = void,
  TOptions = null
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
  }

  if (isPaginated(options)) {
    if (options.paginate.limit) {
      params.set('limit', options.paginate.limit.toString());
    }

    if (options.paginate.next) {
      params.set('next', options.paginate.next);
    }
  }

  if (isIntegration(options)) {
    if (options.integration)
      params.set('integration', options.integration.toString());
  }

  // spread the rest as-is
  for (const [key, val] of Object.entries(options)) {
    if (key === 'sortBy' || key === 'paginate' || key === 'integration') {
      continue;
    }
    params.set(key, val.toString());
  }

  return params;
};

const addCrossWorkspaceParams = (
  params: URLSearchParams,
  q: string,
  createdSince?: number,
  createdUntil?: number,
  createdFilterStrict?: boolean,
  updatedSince?: number,
  updatedUntil?: number,
  updatedFilterStrict?: boolean,
  createdBy?: string,
  members?: string,
) => {
  params.set('q', q);

  if (createdSince) {
    params.set('createdSince', createdSince.toString());
  }

  if (createdUntil) {
    params.set('createdUntil', createdUntil.toString());
  }

  if (createdFilterStrict) {
    params.set('createdFilterStrict', createdFilterStrict.toString());
  }

  if (updatedSince) {
    params.set('updatedSince', updatedSince.toString());
  }

  if (updatedUntil) {
    params.set('updatedUntil', updatedUntil.toString());
  }

  if (updatedFilterStrict) {
    params.set('updatedFilterStrict', updatedFilterStrict.toString());
  }

  if (createdBy) {
    params.set('createdBy', createdBy);
  }

  if (members) {
    params.set('members', members);
  }

  return params;
};

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

  /**
   * Abort in-flight requests. The request promises will reject with an
   * AbortError.
   *
   * To abort only a subset of requests, `.clone()` the client and call
   * `abort()` on the corresponding ApiClient instance.
   */
  abort: () => void;

  /**
   * Create a new instance of the client using the same configuration as the
   * original instance.
   *
   * @returns ApiClient
   */
  clone: () => ApiClient;
  track: (event: string, properties?: {}) => void;
  createAsset: ResourceEndpoint<
    Asset,
    {
      muralId: string;
      payload: {
        assetType?: string;
        fileExtension: string;
      };
    }
  >;
  createContentSession: ResourceEndpoint<
    MuralContentSession,
    {
      muralId: string;
    }
  >;
  createImage: ResourceEndpoint<
    Image,
    {
      muralId: string;
      payload: CreateImagePayload;
    }
  >;
  createMural: ResourceEndpoint<
    Mural,
    {
      title: string;
      workspaceId: string;
      roomId: number;
      folderId?: string;
      height?: number;
      width?: number;
      infinite?: boolean;
      visitorsSettings?: {
        expiresOn?: number;
      };
    }
  >;
  createMuralFromTemplate: ResourceEndpoint<
    Mural,
    {
      title: string;
      roomId: number;
      templateId: string;
    }
  >;
  createMuralTag: ResourceEndpoint<
    Tag,
    {
      muralId: string;
      payload: {
        text: string;
        backgroundColor?: string;
        borderColor?: string;
        color?: string;
      };
    }
  >;
  createStickyNote: ResourceEndpoint<
    StickyNote,
    {
      muralId: string;
      payload: CreateStickyNotePayload | CreateStickyNotePayload[];
    }
  >;
  updateStickyNote: ResourceEndpoint<
    StickyNote,
    {
      muralId: string;
      widgetId: string;
      payload: UpdateStickyNotePayload;
    }
  >;
  getCurrentUser: ResourceEndpoint<User>;
  getCrossWorkspaceRecentMurals: ResourceEndpoint<
    Mural[],
    void,
    Paginated & Sorted
  >;
  getCrossWorkspaceStarredMurals: ResourceEndpoint<
    Mural[],
    void,
    Paginated & Sorted
  >;
  getMural: ResourceEndpoint<Mural, { id: string }, Integration>;
  getMuralWidgets: ResourceEndpoint<
    Widget[],
    { muralId: string },
    Paginated & Sorted
  >;
  getMuralUsers: ResourceEndpoint<
    User[],
    { muralId: string },
    Paginated & Sorted
  >;
  getMuralsByRoom: ResourceEndpoint<
    Mural[],
    { roomId: number },
    Paginated & Sorted & Integration
  >;
  getMuralsByWorkspace: ResourceEndpoint<
    Mural[],
    { workspaceId: string },
    Paginated & Sorted & Integration
  >;
  getMuralTags: ResourceEndpoint<Tag[], { muralId: string }>;
  getDefaultTemplates: ResourceEndpoint<
    Template[],
    void,
    Paginated & { category: string[] }
  >;
  getRoom: ResourceEndpoint<Room, { id: number }>;
  getRoomsByWorkspace: ResourceEndpoint<
    Room[],
    { workspaceId: string },
    Paginated
  >;
  getWorkspace: ResourceEndpoint<Workspace, { id: string }>;
  getWorkspaces: ResourceEndpoint<Workspace[], void, Paginated>;
  getTemplatesByWorkspace: ResourceEndpoint<
    Template[],
    { workspaceId: string },
    Paginated & { category: string[]; withoutDefault: boolean }
  >;
  searchCrossWorkspaceTemplates: ResourceEndpoint<
    TemplateSummary[],
    { q: string },
    Paginated & Sorted
  >;
  searchCrossWorkspaceMurals: ResourceEndpoint<
    Mural[],
    {
      q: string;
      createdSince?: number;
      createdUntil?: number;
      createdFilterStrict?: boolean;
      updatedSince?: number;
      updatedUntil?: number;
      updatedFilterStrict?: boolean;
      createdBy?: string;
      members?: string;
    },
    Paginated & Sorted
  >;
  searchMuralsByWorkspace: ResourceEndpoint<
    Mural[],
    { workspaceId: string; title: string },
    Paginated & Integration
  >;
  searchRoomsByWorkspace: ResourceEndpoint<
    Room[],
    { workspaceId: string; title: string },
    Paginated
  >;

  /**
   * @deprecated Use `getCurrentUser` instead.
   */
  getLastActiveWorkspaceId: ResourceEndpoint<string | null>;
}

/**
 * Create an ApiClient instance from the provided configuration.
 *
 * @param fetchFn
 * Fetch-link function that will be used by the API Client. Typically, use `setupAuthenticatedFetch` to
 * use the standard MURAL API Client authentication aware fetch handler.
 * @param args
 * - appid: MURAL App `client_id`
 * - muralHost: MURAL API service host (default: 'app.mural.co')
 * - integrationsHost: MURAL integrations API service host (default: 'integrations.mural.co')
 * - secure: Whether the client should use TLS (default: true)
 * - storage: 'Storage' compatible store for the session management.
 *
 * @returns ApiClient
 */
const buildApiClient = (
  aFetchFn: FetchFunction,
  config: ClientConfig,
): ApiClient => {
  const clientConfig = { ...DEFAULT_CONFIG, ...config };

  const urlBuilderFor = (host: string) => (path: string): URL => {
    const protocol = clientConfig.secure ? 'https' : 'http';
    return new URL(path, `${protocol}://${host}`);
  };

  const muralUrl = urlBuilderFor(clientConfig.muralHost);
  const integrationsUrl = urlBuilderFor(clientConfig.integrationsHost);

  const api = (path: string) => new URL(path, muralUrl('/api/public/v1/')).href;

  // Controller to enable aborting requests
  let controller = new AbortController();

  // Wrapped fetch function that:
  // - Attaches the AbortController's signal to the request's signal
  // - Intercepts errors from aborted requests and throws our AbortError
  const fetchFn: FetchFunction = async (input, init) => {
    try {
      return await aFetchFn(input, {
        ...init,
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // In-flight requests were aborted
        throw new AbortError(err.message, err);
      }

      throw err;
    }
  };

  const client: ApiClient = {
    authenticated,
    config: clientConfig,
    fetch: fetchFn,
    url: muralUrl,
    abort: () => {
      controller.abort();
      controller = new AbortController();
    },
    clone: () => buildApiClient(aFetchFn, config),
    track: (event: string, properties?: {}) => {
      const body = {
        event,
        properties,
      };

      const session = getFetchConfig()?.sessionStore.get();
      const headers = [['content-type', 'application/json']];

      if (session) {
        headers.push(['authorization', `Bearer ${session.accessToken}`]);
      }

      // Optimistically send the tracking information,
      // errors for this process should not be treated as critical
      fetch(integrationsUrl('/integrations/api/v0/track').href, {
        body: JSON.stringify(body),
        credentials: 'include',
        headers,
        mode: 'cors',
        method: 'POST',
      }).catch(_err => {});
    },
    // https://developers.mural.co/public/reference/createasset
    createAsset: async ({ muralId, payload }) => {
      const response = await fetchFn(api(`murals/${muralId}/assets`), {
        body: JSON.stringify(payload),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });

      return response.json();
    },
    // Documented internally
    createContentSession: async ({ muralId }) => {
      const response = await fetchFn(api(`murals/${muralId}/content-session`), {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });

      return response.json();
    },
    // https://developers.mural.co/public/reference/createimage
    createImage: async ({ muralId, payload }) => {
      const response = await fetchFn(api(`murals/${muralId}/widgets/image`), {
        body: JSON.stringify(payload),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });

      return response.json();
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
    // https://developers.mural.co/public/reference/createmuraltag
    createMuralTag: async ({ muralId, payload }) => {
      const response = await fetchFn(api(`murals/${muralId}/tags`), {
        body: JSON.stringify(payload),
        headers: {
          Accept: 'vnd.mural.preview',
          'content-type': 'application/json',
        },
        method: 'POST',
      });
      return response.json();
    },
    // https://developers.mural.co/public/reference/createstickynote
    createStickyNote: async ({ muralId, payload }) => {
      const response = await fetchFn(
        api(`murals/${muralId}/widgets/sticky-note`),
        {
          body: JSON.stringify(payload),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        },
      );
      return response.json();
    },
    // https://developers.mural.co/public/reference/updatestickynote
    updateStickyNote: async ({ muralId, widgetId, payload }) => {
      const response = await fetchFn(
        api(`murals/${muralId}/widgets/sticky-note/${widgetId}`),
        {
          body: JSON.stringify(payload),
          headers: { 'content-type': 'application/json' },
          method: 'PATCH',
        },
      );
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
    getDefaultTemplates: async options => {
      const params = optionsParams(options);
      const response = await fetchFn(api(`templates?${params}`), {
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
    // https://developers.mural.co/public/reference/getmuralwidgets
    getMuralWidgets: async ({ muralId }, options) => {
      const params = optionsParams(options);

      const response = await fetchFn(
        api(`murals/${muralId}/widgets?${params}`),
        {
          method: 'GET',
        },
      );

      return await response.json();
    },
    // https://developers.mural.co/public/reference/getmuralusers
    getMuralUsers: async ({ muralId }, options) => {
      const params = optionsParams(options);

      const response = await fetchFn(api(`murals/${muralId}/users?${params}`), {
        method: 'GET',
      });

      return await response.json();
    },
    getCrossWorkspaceStarredMurals: async options => {
      const params = optionsParams(options);

      const response = await fetchFn(
        api(`murals/starred-across-workspaces?${params}`),
        {
          method: 'GET',
        },
      );

      return await response.json();
    },
    getCrossWorkspaceRecentMurals: async options => {
      const params = optionsParams(options);

      const response = await fetchFn(
        api(`murals/recently-opened-across-workspaces?${params}`),
        {
          method: 'GET',
        },
      );

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
    // https://developers.mural.co/public/reference/getmuraltags
    getMuralTags: async ({ muralId }) => {
      const response = await fetchFn(api(`murals/${muralId}/tags`), {
        method: 'GET',
        headers: { Accept: 'vnd.mural.preview' },
      });
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
    getWorkspaces: async options => {
      const params = optionsParams(options);
      const response = await fetchFn(api(`workspaces?${params}`), {
        method: 'GET',
      });
      return await response.json();
    },
    searchCrossWorkspaceTemplates: async ({ q }, options) => {
      const params = optionsParams(options);
      const response = await fetchFn(api(`search/template?q=${q}${params}`), {
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
    searchCrossWorkspaceMurals: async (
      {
        q,
        createdSince,
        createdUntil,
        createdFilterStrict,
        updatedSince,
        updatedUntil,
        updatedFilterStrict,
        createdBy,
        members,
      },
      options,
    ) => {
      const params = optionsParams(options);
      const crossWorkspaceParams = addCrossWorkspaceParams(
        params,
        q,
        createdSince,
        createdUntil,
        createdFilterStrict,
        updatedSince,
        updatedUntil,
        updatedFilterStrict,
        createdBy,
        members,
      );
      const response = await fetchFn(
        api(`search/mural?${crossWorkspaceParams}`),
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
    // https://developers.mural.co/public/reference/getroominfobyid
    getRoom: async ({ id }, options) => {
      const params = optionsParams(options);
      const response = await fetchFn(api(`rooms/${id}?${params}`), {
        method: 'GET',
      });

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

export default buildApiClient;
