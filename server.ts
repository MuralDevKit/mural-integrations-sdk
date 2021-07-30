import config from 'dos-config';
import * as express from 'express';
import { Request, Response } from 'express';
import createApp from 'async-app';
import app from './lib/base-app';
import { authorize, accessToken, refreshToken } from './lib/oauth';

const configProvider = () => {
  const cfg = {
    authorizationUri: `${config.endpoints.webapp}/api/public/v1/authorization/oauth2/`,
    accessTokenUri: `${config.endpoints.webapp}/api/public/v1/authorization/oauth2/token`,
    refreshTokenUri: `${config.endpoints.webapp}/api/public/v1/authorization/oauth2/refresh`,
    ...config.clientApp,
  };

  return cfg;
};

const tokenResponse = <T>(x: T) => x;

const authorizeUrl = authorize(configProvider);
const accessTokenHandler = accessToken(configProvider);
const refreshTokenHandler = refreshToken(configProvider);

const auth = createApp();
auth.use(express.json())

auth.get(
  '/',
  // { redirectUri: 'string?', state: 'string?' },
  (req: Request, res: Response) => {
    const url = authorizeUrl(req, {
      redirectUri: req.query.redirectUri
        ? req.query.redirectUri.toString()
        : undefined,
      state: req.query.state ? req.query.state.toString() : undefined,
    });

    res.send(url)
  },
);

auth.get(
  '/token',
  async (
    req: Request<any, any, any, { redirectUri?: string; code: string }>,
    res: Response,
  ) => {
    console.log(req.query.code)
    
    const tokens = await accessTokenHandler(req, {
      redirectUri: req.query.redirectUri,
      code: req.query.code,
    });

    res.json(tokens);
  },
);

auth.post(
  '/refresh',
  //{ refreshToken: 'string' },
  async (req: Request<any, any, { refreshToken: string }>, res: Response) => {
    const tokens = await refreshTokenHandler(req, {
      refreshToken: req.body.refreshToken,
    });

    res.json(tokenResponse(tokens));
  },
);

app.get('/', (_, res) => res.send("Hello world!"))
app.use('/auth', auth);

app.listen(config.port, () => {
  console.log(`Example app listening at http://localhost:${config.port}`)
})
