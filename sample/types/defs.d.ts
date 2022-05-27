declare global {
  const APP_ID: string;
  const SERVICES: ServiceMap;
}

declare module "dos-config" {
  export interface ServiceMap {
    auth: string;
    mural: string;
  }

  export interface ClientAppConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;

    scopes?: string[];
    authorizationUri?: string;
    accessTokenUri?: string;
    refreshTokenUri?: string;
  }

  interface EndpointConfig {
    host: string;
    secure: boolean;
  }

  interface ServerConfig {
    host: string;
    port: number;
    https?: {
      cert: string,
      key: string
    }
  }

  interface Config {
    appName: string;
    server: ServerConfig,
    client: ServerConfig,
    services: {
      auth: EndpointConfig;
      mural: EndpointConfig;
    };
    clientApp: ClientAppConfig;
  }

  const config: Config;
  export default config;
}
