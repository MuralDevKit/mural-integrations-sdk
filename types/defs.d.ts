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

  interface Config {
    appName: string;
    serverPort: number;
    services: {
      auth: string;
      mural: string;
    };
    clientApp: ClientAppConfig;
  }

  const config: Config;
  export default config;
}
