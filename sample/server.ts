import config from 'dos-config';
import * as express from 'express';
import { Request, Response } from 'express';
import createApp from 'async-app';
import app from './lib/base-app';
import { authorize, accessToken, refreshToken } from './lib/oauth';
import * as https from 'https';
import * as fs from 'fs';

console.debug('==== ENV ====\n', process.env);

const protocol = config.services.mural.secure ? 'https' : 'http';
const configProvider = () => {
  const cfg = {
    authorizationUri: `${protocol}://${config.services.mural.host}/api/public/v1/authorization/oauth2/`,
    accessTokenUri: `${protocol}://${config.services.mural.host}/api/public/v1/authorization/oauth2/token`,
    refreshTokenUri: `${protocol}://${config.services.mural.host}/api/public/v1/authorization/oauth2/refresh`,
    ...config.clientApp,
  };

  return cfg;
};

const tokenResponse = <T>(x: T) => x;

const authorizeUrl = authorize(configProvider);
const accessTokenHandler = accessToken(configProvider);
const refreshTokenHandler = refreshToken(configProvider);

const auth = createApp();
auth.use(express.json());

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

    res.send(url);
  },
);

auth.get(
  '/token',
  async (
    req: Request<any, any, any, { redirectUri?: string; code: string }>,
    res: Response,
  ) => {
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

app.get('/', (_, res) => res.send('Mural Integrations SDK - Sample App'));
app.use('/auth', auth);

function printUsage() {
  console.log(
    `Example app listening at ${config.server.https ? 'https' : 'http'}://${
      config.server.host
    }:${config.server.port}`,
  );
  console.log(`Targeting app: ${config.services.mural.host}`);

  console.debug('==== CONFIG ====\n', config);
}

if (config.server.https) {
  const options = {
    key: fs.readFileSync(__dirname + '/' + config.server.https.key),
    cert: fs.readFileSync(__dirname + '/' + config.server.https.cert),
  };
  var server = https.createServer(options, app);
  server.listen(config.server.port, () => printUsage());
} else {
  app.listen(config.server.port, () => printUsage());
}
