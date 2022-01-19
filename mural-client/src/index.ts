import setupAuthenticatedFetch, {
  authenticated,
  authorizeHandler,
  refreshTokenHandler,
  requestTokenHandler,
  TokenHandlerConfig,
} from './fetch';
import { Mural, Room, WorkSpace, Template } from './types';

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
  webAppUrl: string;
  fetchFn: FetchFunction;
};

export function buildClientConfig(
  appId: string,
  webAppUrl: string,
  tokenHandlerConfig: TokenHandlerConfig,
): ClientConfig {
  const fetchFn = setupAuthenticatedFetch({
    authorizeFn: authorizeHandler(tokenHandlerConfig),
    requestTokenFn: requestTokenHandler(tokenHandlerConfig),
    refreshTokenFn: refreshTokenHandler(tokenHandlerConfig),
  });

  return {
    appId,
    webAppUrl,
    fetchFn,
  };
}

export interface ApiClient {
  authenticated: () => boolean;
  config: {
    appId: string;
    hostname: string;
  };
  fetch: FetchFunction;
  getMuralsByWorkspaceId: (workspaceId: string) => Promise<Mural[]>;
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
  getRoomsByWorkspace: (id: string) => Promise<Room[]>;
  getAllWorkSpaces: () => Promise<WorkSpace[]>;
  getWorkSpaceById: (id: string) => Promise<WorkSpace>;
  getTemplates: () => Promise<Template[]>;
}

export default (config: ClientConfig): ApiClient => {
  const { fetchFn, webAppUrl, appId } = config;
  const baseUri = `api/public/v1`;

  return {
    authenticated,
    fetch: fetchFn,
    config: {
      hostname: webAppUrl,
      appId,
    },
    getMuralsByWorkspaceId: async (workspaceId: string): Promise<Mural[]> => {
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/workspaces/${workspaceId}/murals`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
    getMuralsByRoom: async (roomId: string) => {
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/rooms/${roomId}/murals`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
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
    getRoomsByWorkspace: async (id: string): Promise<Room[]> => {
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/workspaces/${id}/rooms`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
    getAllWorkSpaces: async (): Promise<WorkSpace[]> => {
      const response = await fetchFn(`${webAppUrl}/${baseUri}/workspaces`, {
        method: 'GET',
      });
      return (await response.json()).value;
    },
    getWorkSpaceById: async (id: string): Promise<WorkSpace> => {
      const response = await fetchFn(
        `${webAppUrl}/${baseUri}/workspaces/${id}`,
        {
          method: 'GET',
        },
      );
      return response.json();
    },
    getTemplates: async (): Promise<Template[]> => {
      const response = await fetchFn(`${webAppUrl}/${baseUri}/templates`, {
        method: 'GET',
      });
      return (await response.json()).value;
    },
  };
};
