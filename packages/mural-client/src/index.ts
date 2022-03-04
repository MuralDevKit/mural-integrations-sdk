import setupAuthenticatedFetch, {
  authenticated,
  authorizeHandler,
  FetchError,
  refreshTokenHandler,
  requestTokenHandler,
  TokenHandlerConfig,
} from "./fetch";
import { Mural, Room, Template, User, Workspace } from "./types";
import { setupSessionStore } from "./session";

export * from "./fetch";
export * from "./session";
export * from "./types";

export { default as setupAuthenticatedFetch } from "./fetch";

export type FetchFunction = (
  input: RequestInfo,
  init?: RequestInit,
) => Promise<Response>;

export type ClientConfig = {
  appId: string;
  fetchFn: FetchFunction;
  host: string;
};

export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export type BuildClientArgs = {
  appId: string;
  muralHost?: string;
  storage?: Storage;
} & TokenHandlerConfig;

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

export function buildClientConfig(args: BuildClientArgs): ClientConfig {
  const fetchFn = setupAuthenticatedFetch({
    authorizeFn: authorizeHandler(args),
    requestTokenFn: requestTokenHandler(args),
    refreshTokenFn: refreshTokenHandler(args),
    sessionStore: setupSessionStore(args.storage || localStorage),
  });

  return {
    appId: args.appId,
    host: args.muralHost || "app.mural.co",
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
  createMural: (
    title: string,
    workspaceId: string,
    roomId: string
  ) => Promise<{ value: Mural }>;
  createMuralFromTemplate: (
    title: string,
    roomId: string,
    templateId: string
  ) => Promise<{ value: Mural }>;
  getCurrentUser: () => Promise<User>;
  getMural: (
    muralId: string,
    options?: { integration: boolean }
  ) => Promise<Mural>;
  getMuralsByRoom: (roomId: string) => Promise<Mural[]>;
  getMuralsByWorkspace: (workspaceId: string) => Promise<Mural[]>;
  getDefaultTemplates: () => Promise<Template[]>;
  getRoomsByWorkspace: (workspaceId: string) => Promise<Room[]>;
  getWorkspace: (id: string) => Promise<Workspace>;
  getWorkspaces: () => Promise<Workspace[]>;
  getTemplatesByWorkspace: (
    workspaceId: string,
    options?: { withoutDefault: boolean }
  ) => Promise<Template[]>;
  searchMuralsByWorkspace: (
    workspaceId: string,
    title: string
  ) => Promise<Mural[]>;
  searchRoomsByWorkspace: (
    workspaceId: string | null,
    title: string
  ) => Promise<Room[]>;
}

export default (config: ClientConfig): ApiClient => {
  const { fetchFn } = config;

  const baseUrl = new URL('/api/public/v1/', `https://${config.host}`);
  const api = (path: string) => new URL(path, baseUrl).href;

  return {
    authenticated,
    config,
    fetch: fetchFn,
    // https://developers.mural.co/public/reference/createmural
    createMural: async (title: string, workspaceId: string, roomId: string) => {
      const body = {
        title,
        workspaceId,
        roomId,
      };
      const response = await fetchFn(api("murals"), {
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      return response.json();
    },
    // https://developers.mural.co/public/reference/createmuralfromtemplate
    createMuralFromTemplate: async (
      title: string,
      roomId: string,
      templateId: string
    ) => {
      const body = {
        title,
        roomId,
      };
      const response = await fetchFn(api(`templates/${templateId}/murals`), {
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      return response.json();
    },
    // https://developers.mural.co/public/reference/getcurrentmember
    getCurrentUser: async (): Promise<User> => {
      const response = await fetchFn(api("users/me"), {
        method: "GET",
      });
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getglobaltemplates
    getDefaultTemplates: async (): Promise<Template[]> => {
      const response = await fetchFn(api("templates"), {
        method: "GET",
      });
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getmuralbyid
    getMural: async (muralId: string, options?: { integration: boolean }) => {
      const params = new URLSearchParams();
      if (options?.integration)
        params.set("integration", options!.integration.toString());
      const response = await fetchFn(api(`murals/${muralId}?${params}`), {
        method: "GET",
      });
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getroommurals
    getMuralsByRoom: async (roomId: string) => {
      const response = await fetchFn(api(`rooms/${roomId}/murals`), {
        method: "GET",
      });
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getworkspacemurals
    getMuralsByWorkspace: async (workspaceId: string): Promise<Mural[]> => {
      const response = await fetchFn(api(`workspaces/${workspaceId}/murals`), {
        method: "GET",
      });
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getworkspacerooms
    getRoomsByWorkspace: async (workspaceId: string): Promise<Room[]> => {
      const response = await fetchFn(api(`workspaces/${workspaceId}/rooms`), {
        method: "GET",
      });
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/getworkspace
    getWorkspace: async (id: string): Promise<Workspace> => {
      const response = await fetchFn(api(`workspaces/${id}`), {
        method: "GET",
      });
      return response.json();
    },
    // https://developers.mural.co/public/reference/getworkspaces
    getWorkspaces: async (): Promise<Workspace[]> => {
      const response = await fetchFn(api(`workspaces`), {
        method: "GET",
      });
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/gettemplatesbyworkspace
    getTemplatesByWorkspace: async (
      workspaceId: string,
      options?: { withoutDefault: boolean }
    ): Promise<Template[]> => {
      const params = new URLSearchParams();
      if (options)
        params.set("withoutDefault", options.withoutDefault.toString());
      const response = await fetchFn(
        api(`workspaces/${workspaceId}/templates`),
        {
          method: "GET",
        }
      );
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/searchmurals
    searchMuralsByWorkspace: async (workspaceId: string, title: string) => {
      // title must be at least 3 characters for a successful search
      if (title.length < 3) {
        throw new Error("title argument must be at least 3 characters.");
      }
      const params = new URLSearchParams();
      // TODO: expand to support optional params: `limit` and `next`
      params.set("title", title);
      const response = await fetchFn(
        api(`search/${workspaceId}/murals?${params}`),
        {
          method: "GET",
        }
      );
      return (await response.json()).value;
    },
    // https://developers.mural.co/public/reference/searchrooms
    searchRoomsByWorkspace: async (
      workspaceId: string | null,
      title: string
    ): Promise<Room[]> => {
      // tile must be at least 3 characters for a successful search
      if (title.length < 3) {
        throw new Error("title argument must be at least 3 characters.");
      }
      const response = await fetchFn(
        api(`search/${workspaceId}/rooms?title=${title}`),
        {
          method: "GET",
        }
      );
      return (await response.json()).value;
    },
  };
};
