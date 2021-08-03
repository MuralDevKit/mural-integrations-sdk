declare module 'dos-config' {
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
    endpoints: {
      webapp: string;
    },
    clientApp: ClientAppConfig;
  }

  const config: Config;
  export default config;
}
