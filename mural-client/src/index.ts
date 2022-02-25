import setupAuthenticatedFetch, {
  authorizeHandler,
  FetchError,
  refreshTokenHandler,
  requestTokenHandler,
  TokenHandlerConfig,
} from './fetch';
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
  webAppUrl: string;
  fetchFn: FetchFunction;
};

export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export const getApiError = async (error: Error): Promise<ApiError | null> => {
  if (!(error instanceof FetchError) || !error.response) return null;

  const { response } = error;
  const payload = await response.json();

  return {
    code: payload.code,
    message: payload.message || error.message,
    status: response.status,
  };
};

export function buildClientConfig(
  webAppUrl: string,
  tokenHandlerConfig: TokenHandlerConfig,
  storage: Storage,
): ClientConfig {
  const fetchFn = setupAuthenticatedFetch({
    authorizeFn: authorizeHandler(tokenHandlerConfig),
    requestTokenFn: requestTokenHandler(tokenHandlerConfig),
    refreshTokenFn: refreshTokenHandler(tokenHandlerConfig),
    storage,
  });

  return {
    webAppUrl,
    fetchFn,
  };
}

export interface ApiClient {
  getCurrentUser: () => Promise<User>;
  getMuralsByWorkspace: (workspaceId: string) => Promise<Mural[]>;
  getMuralsByRoom: (roomId: string) => Promise<Mural[]>;
  getMural: (
    muralId: string,
    options?: { integration: boolean },
  ) => Promise<Mural>;
  createMural: (
    title: string,
    workspaceId: string,
    roomId: string,
  ) => Promise<{ value: Mural }>;
  createMuralFromTemplate: (
    title: string,
    roomId: string,
    templateId: string,
  ) => Promise<{ value: Mural }>;
  getRoomsByWorkspace: (workspaceId: string) => Promise<Room[]>;
  getWorkspaces: () => Promise<Workspace[]>;
  getWorkspace: (workspaceId: string) => Promise<Workspace>;
  getDefaultTemplates: () => Promise<Template[]>;
  getTemplatesByWorkspace: (
    workspaceId: string,
    options?: { withoutDefault: boolean },
  ) => Promise<Template[]>;
  searchWorkspaceRooms: (
    workspaceId: string | null,
    title: string,
  ) => Promise<Room[]>;
  searchWorkspaceMurals: (
    workspaceId: string,
    title: string,
  ) => Promise<Mural[]>;
}

export default (config: ClientConfig): ApiClient => {
  const { fetchFn, webAppUrl } = config;
  const baseUri = `api/public/v1`;

  return {
    // https://developers.mural.co/public/reference/getcurrentmember
    getCurrentUser: async (): Promise<User> => {
      const response = await fetchFn(`${webAppUrl}/${baseUri}/users/me`, {
        method: 'GET',
      });
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getworkspacemurals
    getMuralsByWorkspace: async (workspaceId: string): Promise<Mural[]> => {
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/workspaces/${workspaceId}/murals`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getroommurals
    getMuralsByRoom: async (roomId: string) => {
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/rooms/${roomId}/murals`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getmuralbyid
    getMural: async (muralId: string, options?: { integration: boolean }) => {
      const params = new URLSearchParams();
      if (options?.integration)
        params.set('integration', options!.integration.toString());
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/murals/${muralId}?${params}`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/createmural
    createMural: async (title: string, workspaceId: string, roomId: string) => {
      const body = {
        title,
        workspaceId,
        roomId,
      };
      const response = await fetchFn(`${webAppUrl}/${baseUri}/murals`, {
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      return response.json();
    },
    // https://developers.mural.co/public/reference/createmuralfromtemplate
    createMuralFromTemplate: async (
      title: string,
      roomId: string,
      templateId: string,
    ) => {
      const body = {
        title,
        roomId,
      };
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/templates/${templateId}/murals`,
        {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        },
      );
      return response.json();
    },
    // https://developers.mural.co/public/reference/getworkspacerooms
    getRoomsByWorkspace: async (workspaceId: string): Promise<Room[]> => {
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/workspaces/${workspaceId}/rooms`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getworkspaces
    getWorkspaces: async (): Promise<Workspace[]> => {
      const response = await fetchFn(`${webAppUrl}/${baseUri}/workspaces`, {
        method: 'GET',
      });
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getworkspace
    getWorkspace: async (id: string): Promise<Workspace> => {
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/workspaces/${id}`,
        {
          method: 'GET',
        },
      );
      return response.json();
    },
    // https://developers.mural.co/public/reference/getglobaltemplates
    getDefaultTemplates: async (): Promise<Template[]> => {
      const response = await fetchFn(`${webAppUrl}/${baseUri}/templates`, {
        method: 'GET',
      });
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/gettemplatesbyworkspace
    getTemplatesByWorkspace: async (
      workspaceId: string,
      options?: { withoutDefault: boolean },
    ): Promise<Template[]> => {
      const params = new URLSearchParams();
      if (options)
        params.set('withoutDefault', options.withoutDefault.toString());
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/workspaces/${workspaceId}/templates`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/searchrooms
    searchWorkspaceRooms: async (
      workspaceId: string | null,
      title: string,
    ): Promise<Room[]> => {
      // tile must be at least 3 characters for a successful search
      if (title.length < 3) {
        throw new Error('title argument must be at least 3 characters.');
      }
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/search/${workspaceId}/rooms?title=${title}`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/searchmurals
    searchWorkspaceMurals: async (workspaceId: string, title: string) => {
      // title must be at least 3 characters for a successful search
      if (title.length < 3) {
        throw new Error('title argument must be at least 3 characters.');
      }
      const params = new URLSearchParams();
      // TODO: expand to support optional params: `limit` and `next`
      params.set('title', title);
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/search/${workspaceId}/murals?${params}`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
  };
};
