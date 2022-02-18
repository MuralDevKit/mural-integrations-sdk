declare module 'dos-config' {
  export interface RateLimiterConfig {
    interval: string;
    max: number;
  }

  export interface ClientAppConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;

    authorizationUri?: string;
    accessTokenUri?: string;
    refreshTokenUri?: string;
  }

  interface Config {
    adobe: {
      clientId: string;
      clientSecret: string;
      enabled: boolean;
      pageSize: number;
      redirectUri: string;
    } & ClientAppConfig;
    trustedJWT: {
      publicKeyExpiration: string;
      validator: {
        aadV1: {
          aud: string; // Correspond to the 'Application ID URI' of our 'App registration' in Azure
        };
        aadV2: {
          aud: string; // Correspond to the 'Application ID' of our 'App registration' in Azure
        };
        webex: {
          aud: string;
        };
      };
    };
    giphy: {
      enabled: boolean;
      accessKey: string;
      pageSize: number;
    };
    appName: string;
    cookies: {
      rateLimitName: string;
      secret: string;
    };
    cors: {
      allowed: string[];
    };
    datadog: {
      enabled: boolean;
      env: string;
      hostname: string;
      sampleRate: number;
      flushInterval: number;
    };
    endpoints: {
      api: string;
      integrations: string;
      notifier: string;
      webapp: string;
    };
    env: string;
    segment: {
      enabled: false;
      apiKey: string;
    };
    integrations: {
      token: string;
    };
    preSharedKey: {
      integrations: string;
      notifier: string;
    };
    jira: {
      clientIdentity: string;
      enabled: boolean;
    };
    jwt: {
      secret: string;
    };
    mongo: {
      url: string;
    };
    muralAuth: {
      clientId: string;
      clientSecret: string;
      callback: string;
    };
    murallyRequest: {
      timeout: number;
    };
    port: number;
    proxy: {
      url: string;
    };
    ratelimiter: {
      default: RateLimiterConfig;
      [service: string]: RateLimiterConfig;
    };
    redis: {
      cache: {
        cluster: boolean;
        db: number;
        host: string;
        key: string;
        ports: number[];
      };
    };
    rollbar: {
      accessToken: { backEnd: string; frontEnd: string };
      env: string;
      exitOnUncaughtException: boolean;
      handleUncaughtExceptions: boolean;
    };
    segmentAnalytics: {
      mural: string;
    };
    slack: {
      mural: {
        appId?: string;
        bot: {
          signingSecret: string;
          clientSecret: string;
          clientId: string;
          token: string;
        };
      };
    };
    sqreen: {
      token: string;
    };
    webex: {
      enabled: boolean;
    } & ClientAppConfig;
    unsplash: {
      apiUrl: string;
      accessKey: string;
      enabled: boolean;
      pageSize: number;
    };
    zoom: {
      enabled: boolean;
      callbackUrl: string;
      collabModeLandingUrl: string;
      host: string;
      oauthStateSecret: string;
      webhookSecret: string;
    } & ClientAppConfig;
    msTeams: {
      enabled: boolean;
      accessTokenUri: string;
      refreshTokenUri: string;
      authorizationUri: string;
      manifest: {
        appId: string;
        personalTabEntityId: string;
      };
      bot: {
        id: string;
        password: string;
      };
    } & ClientAppConfig;
  }

  const config: Config;
  export default config;
}

// declare namespace Express {
//   export interface Request {
//     user?: import('./types/user').User;
//     context?: any;
//   }
//   interface Application {}
// }
//
// declare module 'atlassian-connect-express' {
//   export interface ClientInfo {
//     /* Key identifier of the addon, e.g. mural-for-jira */
//     key: string;
//     /* Client key that identifies an installation */
//     clientKey: string;
//     /* OAuth Client ID */
//     oauthClientId: string;
//     /* Public key sent by Atlassian */
//     publicKey: string;
//     /* Shared secret for enconding jwt for requests */
//     sharedSecret: string;
//     /* Server version sent by Atlassian */
//     serverVersion: string;
//     /* Plugin version sent by Atlassian */
//     pluginsVersion: string;
//     /* Base URL of the add-on */
//     baseUrl: string;
//     /* Product type 'jira' | 'confluence' */
//     productType: string;
//     /* Description of the app, shown in app descriptor */
//     description: string;
//     /* Event type for addon tracking events, e.g. 'installed', 'uninstalled' */
//     eventType: string;
//   }
//
//   export interface AtlassianConnect {
//     config: {
//       port: () => number;
//     };
//     key: string;
//     middleware: () => any;
//     register: (value: boolean) => void;
//     authenticate: (value: boolean) => any;
//     httpClient: (
//       reqOrOpts:
//         | { clientKey: string; userAccountId?: string }
//         | Express.Request,
//     ) => any;
//     loadClientInfo: (clientKey: string) => Promise<ClientInfo>;
//     on: (eventName: string, func: (...args: any[]) => {}) => any;
//   }
//
//   interface AtlassianConnectExpressOptions {
//     config: import('./lib/jira/addon-config').AddonConfig;
//   }
//   const ace: (
//     obj: Express.Application,
//     opts: AtlassianConnectExpressOptions,
//   ) => AtlassianConnect;
//
//   export default ace;
// }
//
// declare module 'rollbar' {
//   class Rollbar {
//     constructor(options?: Rollbar.Configuration);
//     public init(options: Rollbar.Configuration): Rollbar;
//
//     public global(options: Rollbar.Configuration): Rollbar;
//     public configure(options: Rollbar.Configuration): Rollbar;
//     public lastError(): Rollbar.MaybeError;
//
//     static log(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     static debug(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     static info(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     static warn(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     static warning(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     static error(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     static critical(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//
//     public log(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     public debug(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     public info(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     public warn(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     public warning(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     public error(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//     public critical(...args: Rollbar.LogArgument[]): Rollbar.LogResult;
//
//     public captureEvent(
//       metadata: object,
//       level: Rollbar.Level,
//     ): Rollbar.TelemetryEvent;
//
//     public lambdaHandler(handler: Rollbar.LambdaHandler): Rollbar.LambdaHandler;
//     public errorHandler(): Rollbar.ExpressErrorHandler;
//   }
//
//   namespace Rollbar {
//     export type MaybeError = Error | undefined | null;
//     export type Callback = (err: MaybeError, response: object) => void;
//     export type LambdaHandler = (
//       event: object,
//       context: object,
//       callback: Callback,
//     ) => void;
//     export interface ExpressNextFunction {
//       (err?: any): void;
//     }
//     export type ExpressErrorHandler = (
//       err: any,
//       request: any,
//       response: any,
//       next: ExpressNextFunction,
//     ) => any;
//
//     export type Level = 'debug' | 'info' | 'warning' | 'error' | 'critical';
//     export interface Configuration {
//       accessToken?: string;
//       version?: string;
//       environment?: string;
//       scrubFields?: string[];
//       logLevel?: Level;
//       reportLevel?: Level;
//       uncaughtErrorLevel?: Level;
//       endpoint?: string;
//       verbose?: boolean;
//       enabled?: boolean;
//       captureUncaught?: boolean;
//       captureUnhandledRejections?: boolean;
//       payload?: object;
//       maxItems?: number;
//       itemsPerMinute?: number;
//       ignoredMessages?: string[];
//       hostWhiteList?: string[];
//       hostBlackList?: string[];
//     }
//
//     export type LogArgument = string | Error | object | Callback | Date | any[];
//     export interface LogResult {
//       uuid: string;
//     }
//     export interface TelemetryEvent {
//       level: Level;
//       type: string;
//       // eslint-disable-next-line camelcase
//       timestamp_ms: number;
//       body: object;
//       source: string;
//       uuid?: string;
//     }
//   }
//
//   const rollbar: Rollbar;
//   export = rollbar;
// }
//
// declare module 'supertest' {
//   const fn: (app: any) => any;
//   export default fn;
// }
//
// declare module '@segment/analytics.js-core/build/analytics' {
//   export default class {
//     use(...args: any[]): void;
//     initialize(...args: any[]): void;
//     track(...args: any[]): void;
//     identify(...args: any[]): void;
//   }
// }
