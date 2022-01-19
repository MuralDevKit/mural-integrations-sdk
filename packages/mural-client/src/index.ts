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
  muralHost: string;
  fetchFn: FetchFunction;
};

export type BuildClientArgs = {
  appId: string;
  muralHost?: string;
} & TokenHandlerConfig;

export function buildClientConfig(args: BuildClientArgs): ClientConfig {
  const fetchFn = setupAuthenticatedFetch({
    authorizeFn: authorizeHandler(args),
    requestTokenFn: requestTokenHandler(args),
    refreshTokenFn: refreshTokenHandler(args),
  });

  return {
    appId: args.appId,
    muralHost: args.muralHost || 'app.mural.co',
    fetchFn,
  };
}

export interface ApiClient {
  authenticated: () => boolean;
  config: {
    appId: string;
    host: string;
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
  const { fetchFn, muralHost, appId } = config;
  const apiUrl = new URL('/api/public/v1', `https://${muralHost}`);

  return {
    authenticated,
    fetch: fetchFn,
    config: {
      host: apiUrl.host,
      appId,
    },
    getMuralsByWorkspaceId: async (workspaceId: string): Promise<Mural[]> => {
      const response = await fetchFn(
        `${apiUrl}/workspaces/${workspaceId}/murals`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
    getMuralsByRoom: async (roomId: string) => {
      const response = await fetchFn(`${apiUrl}/rooms/${roomId}/murals`, {
        method: 'GET',
      });
      return (await response.json()).value;
    },
    getMural: async (muralId: string, options?: { integration: boolean }) => {
      const params = new URLSearchParams();
      if (options?.integration)
        params.set('integration', options!.integration.toString());
      const response = await fetchFn(`${apiUrl}/murals/${muralId}?${params}`, {
        method: 'GET',
      });
      return (await response.json()).value;
    },
    createMural: async (title: string, workspaceId: string, roomId: string) => {
      const body = {
        title,
        workspaceId,
        roomId,
      };
      const response = await fetchFn(`${apiUrl}/murals`, {
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
        `${apiUrl}/templates/${templateId}/murals`,
        {
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        },
      );
      return response.json();
    },
    getRoomsByWorkspace: async (id: string): Promise<Room[]> => {
      const response = await fetchFn(`${apiUrl}/workspaces/${id}/rooms`, {
        method: 'GET',
      });
      return (await response.json()).value;
    },
    getAllWorkSpaces: async (): Promise<WorkSpace[]> => {
      const response = await fetchFn(`${apiUrl}/workspaces`, {
        method: 'GET',
      });
      return (await response.json()).value;
    },
    getWorkSpaceById: async (id: string): Promise<WorkSpace> => {
      const response = await fetchFn(`${apiUrl}/workspaces/${id}`, {
        method: 'GET',
      });
      return response.json();
    },
    getTemplates: async (): Promise<Template[]> => {
      const response = await fetchFn(`${apiUrl}/templates`, {
        method: 'GET',
      });
      return (await response.json()).value;
    },
  };
};
