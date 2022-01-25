import setupAuthenticatedFetch, {
  authorizeHandler,
  FetchError,
  refreshTokenHandler,
  requestTokenHandler,
  TokenHandlerConfig,
} from './fetch';
import { Mural, Room, Template, WorkSpace } from './types';

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
): ClientConfig {
  const fetchFn = setupAuthenticatedFetch({
    authorizeFn: authorizeHandler(tokenHandlerConfig),
    requestTokenFn: requestTokenHandler(tokenHandlerConfig),
    refreshTokenFn: refreshTokenHandler(tokenHandlerConfig),
  });

  return {
    webAppUrl,
    fetchFn,
  };
}

export interface ApiClient {
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
  searchWorkspaceRooms: (
    workspaceId: string | null,
    title: string,
  ) => Promise<Room[]>;
}

export default (config: ClientConfig): ApiClient => {
  const { fetchFn, webAppUrl } = config;
  const baseUri = `api/public/v1`;
  const searchUri = `api/public/v1/search`;

  return {
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
    searchWorkspaceRooms: async (
      workspaceId: string | null,
      title: string,
    ): Promise<Room[]> => {
      const response = await fetchFn(
        `${webAppUrl}/${searchUri}/${workspaceId}/rooms?title=${title}`,
        {
          method: 'GET',
        },
      );
      return (await response.json()).value;
    },
  };
};
