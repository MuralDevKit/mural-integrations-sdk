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

  interface HostConfig {
    host: string;
    secure: boolean;
  }

  interface EndpointConfig {
    host: string;
    port: number;
    https?: {
      cert: string,
      key: string
    }
  }

  interface Config {
    appName: string;
    server: EndpointConfig,
    client: EndpointConfig,
    services: {
      auth: HostConfig;
      mural: HostConfig;
    };
    clientApp: ClientAppConfig;
  }

  const config: Config;
  export default config;
}
