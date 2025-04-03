# Mural Integration SDK sample

This project hosts a variety of samples for the `mural-integrations-sdk` component library.

## Samples

In order to select the sample you want to run, edit the `src/index.tsx` and change the
`app` import at the top of the file.

  - `src/app-basic.tsx` — Basic simple of the mural-picker, mural-canvas component
  - `src/app-automation.tsx` — (Experimental) Advanced example of the mural-canvas RPCClient

## Configuration it

First you will need to configure the sample to run on your application

1. Copy the `config/defaults.json` to `config/app.json`
2. Edit `config/app.json` and set the following values accordingly:

 - `clientApp.clientId`
 - `clientApp.clientSecret`

## Running it

> Note: you can have as many configuration as you require, just make sure
> to set `NODE_ENV` to the proper configuration name.

`NODE_ENV=app npm run start`

## How to create app in mural.co and run it with sample


First of all, you need to install [ngrok](https://ngrok.com/download) and run it on the port that is used by the server so we can provide a redirect URL with HTTPS.
To start ngrok run command (in this case port will be 2022 by default):
```
ngrok http 2022
```
The second step is to create an app in Mural
   1. Go to mural dashboard
   2. Down in the left corner click user options
   3. Choose My apps
   4. Click the button New app.
   5. In modal window need to insert name of app and redirect url from ngrok adding to the end `/auth/callback` so it will looks like `https://9d60d5e97ed2.eu.ngrok.io/auth/callback`

After creating app add `clientId` and `clientSecret` to config file in `/sample/config/defaults.json` and change  redirect url to same that provided in app config.

Next step is to choose needed scopes in app config in Mural and make sure that they are the same in `default.json` file.

In app config in section access add ngrok domain in allow list domains `*.ngrok.com`
The last step is to run commands:
```
cd sample
yarn install
yarn start
```
## Canvas authentication flow guide

To have the possibility to use the Canvas component need to authenticate the user. To do it create 3 endpoints:
/<integrationName>/auth - to get authenticate URL
 /<integrationName>/auth/token - to exchange code for access and refresh tokens
/<integrationName>/auth/refresh - to refresh tokens using refresh token

First of all, we need to add to config/defaults.json a new property for our new integration:
```
...
  "<integrationName>": {
    "enabled": true,
    "clientId": "<clientId>",
    "clientSecret": "<clientSecret>",
    "redirectUri": "<redirectUri>"
  },
...
```
Before implementing endpoints let's do useful imports

```
import config from 'dos-config';
import {
  accessToken,
  authorize,
  buildDefaultAuthUrl,
  ClientAppContextBuilder,
  refreshToken,
} from '../../lib/oauth';
```

define all needed scopes
```
const SCOPES = [
  'identity:read',
  'murals:read',
  'workspaces:read',
  'users:read',
] as const;
```
 create config
```
const apiUrl = new URL(config.endpoints.api);
const configProvider: ClientAppContextBuilder = () => {
  return {
    defaultScopes: SCOPES,
    muralHost: apiUrl.host,
    secure: apiUrl.protocol.includes('https'),
    ...config.asana,
  };
};
```
and handlers that will be used.
```
const authorizeUrl = authorize(configProvider);
const accessTokenHandler = accessToken(configProvider);
const refreshTokenHandler = refreshToken(configProvider);
```


For the first endpoint /<integrationName>/auth we need to generate auth URL using `authorizeUrl` function request object, redirectURL and scopes.
```
app.get('/', (req: Request, res: Response) => {
 const { redirectUri } = config.<integrationName>;

  const url = authorizeUrl(req, {
    redirectUri,
    scopes: [...SCOPES],
    state: req.query.state ? req.query.state.toString() : undefined,
    forward: {
      ...omit(req.query, ['redirectUri', 'scopes', 'state']),
    },
  });

  res.send(url);
});
```

/auth/token endpoint returns access and refresh tokens by receiving code

```
app.get(
  '/token',
  { code: 'string' },
  async (
    req: Request<any, any, any, { redirectUri: string; code: string }>,
    res: Response,
  ) => {
    const { redirectUri } = config.<integrationName>;

    const code = req.query.code.toString();
    const tokensResponse = await accessTokenHandler(req, {
      code,
      redirectUri,
    });

    return res.json(tokensResponse);
  },
);
```
The last one is /auth/refresh
```
app.post(
  '/refresh',
  { refreshToken: 'string' },
  async (req: Request<any, any, { refreshToken: string }>, res: Response) => {
    const tokens = await refreshTokenHandler(req, {
      refreshToken: req.body.refreshToken,
    });

    res.json(tokens);
  },
);
```

We had fished with server side now let's jump to the client side.
In this case, we will have three pages.
auth page that will be opene first when we connect our integration app to Mural
auth/callback user will taken after login into Mural to this page with code and state that will be exchanged for tokens
canvas page where are actual Canavas component is rendered after user complit auth flow

Auth page load config than if config loaded creates authorize function
```
    const link = new URL(config.endpoints.integrations);
      const tokenHandlerConfig = {
        authorizeUri: new URL('asana/auth', `${link.origin}`).href,
        requestTokenUri: new URL('asana/auth/token', `${link.origin}`).href,
        refreshTokenUri: new URL('asana/auth/refresh', `${link.origin}`).href,
      };
      const authorize = authorizeHandler(tokenHandlerConfig);
```
The call of authorize should return auth URL that should be opened in the browser.
All code of the auth page will look like this:
```
export const Auth = () => {
  const [config, setConfig] = useState<null | WebConfig>(null);

  useEffect(() => {
    const fetchData = async () => {
      const localConfig = await appConfig.fetch();
      setConfig(localConfig);
    };

    fetchData();

    if (config) {
      const params = new URLSearchParams(window.location.search);
      const domainId = params.get('domainId');
      localStorage.setItem('domainId', domainId || '');

      const link = new URL(config.endpoints.integrations);
      const tokenHandlerConfig = {
        authorizeUri: new URL('<integrationName>/auth', `${link.origin}`).href,
        requestTokenUri: new URL('<integrationName>/auth/token', `${link.origin}`).href,
        refreshTokenUri: new URL('<integrationName>/auth/refresh', `${link.origin}`).href,
      };

      const authorize = authorizeHandler(tokenHandlerConfig);
      authorize().then(res => {
        window.location.replace(res);
      });
    }
  }, [config]);

  return <div />;
};
```

After the user logged in page /auth/callback should be opened also link to this page should be provided in config/default.json as redirectUrl for our integration.

When the page is open it will contain code and state in URL that should be used to exchange for access and refresh tokens
```
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (newApiClient && config) {
        const link = new URL(config.endpoints.integrations);
        const tokenHandlerConfig = {
          authorizeUri: new URL('asana/auth', `${link.origin}`).href,
          requestTokenUri: new URL('asana/auth/token', `${link.origin}`).href,
          refreshTokenUri: new URL('asana/auth/refresh', `${link.origin}`).href,
        };

        const requestToken = requestTokenHandler(tokenHandlerConfig);

        requestToken(code, state, { store: true });
      }
```
To automatically store tokens in local storage set property store: true
tokens will be stored with key 'mural.oauth.session' other components like Canvas or MuralPicker will handle authentication under the hood using tokes from local storage.

Now we can use MuralPicker to choose a mural that we want to render on canvas, to do so we need to load the config
```
  useEffect(() => {
    const fetchData = async () => {
      const thisIsConfigButICantUseBlockVariables = await appConfig.fetch();
      setConfig(thisIsConfigButICantUseBlockVariables);
    };

    fetchData();
  }, []);
```

create apiClient that should be passed to MuralPicker component
```
  const link = new URL(config.endpoints.webapp);
  const clientConfig = buildClientConfig({
    muralHost: link.host,
    appId: config.mondayCom.clientId,
    storage: localStorage,
    authorizeUri: `/mondaycom/auth`,
    requestTokenUri: `/mondaycom/auth/token`,
    refreshTokenUri: `/mondaycom/auth/refresh`,
  });
  const newApiClient: ApiClient = apiClient(clientConfig);
```
Alos need some handlers like onMuralSelect for the picker to handle selection of mural. In the select handler we should save somehow mural data for example in the state then redirect the user to the canvas page
```
  const onMuralSelect = mural => {
     setMural(mural);
    redirectToCanvas(mural, redirectTo);
  };
```

Now we can easily use our picker
```
<MuralPicker
        apiClient={newApiClient}
        onMuralSelect={onMuralSelect}
        handleError={handleError}
 />
```

After user select we can open Canvas compontent in new page

```
<Canvas
    muralId={id}
    authUrl={authUrl.href}
    apiClient={apiClient}
    state={getVisitorState()}
    onMemberAccessDenied={handleCanvasError}
    onGuestAccessDenied={handleCanvasError}
    onVisitorAccessDenied={handleCanvasError}
    muralUrl={canvasLink}
  />
```
