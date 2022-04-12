import config from "dos-config";
import * as express from "express";
import { Request, Response } from "express";
import createApp from "async-app";
import app from "./lib/base-app";
import { authorize, accessToken, refreshToken } from "./lib/oauth";

console.debug("==== ENV ====\n", process.env);

const configProvider = () => {
  const cfg = {
    authorizationUri: `https://${config.services.mural}/api/public/v1/authorization/oauth2/`,
    accessTokenUri: `https://${config.services.mural}/api/public/v1/authorization/oauth2/token`,
    refreshTokenUri: `https://${config.services.mural}/api/public/v1/authorization/oauth2/refresh`,
    ...config.clientApp
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
  "/",
  // { redirectUri: 'string?', state: 'string?' },
  (req: Request, res: Response) => {
    const url = authorizeUrl(req, {
      redirectUri: req.query.redirectUri
        ? req.query.redirectUri.toString()
        : undefined,
      state: req.query.state ? req.query.state.toString() : undefined
    });

    res.send(url);
  }
);

auth.get(
  "/token",
  async (
    req: Request<any, any, any, { redirectUri?: string; code: string }>,
    res: Response
  ) => {
    const tokens = await accessTokenHandler(req, {
      redirectUri: req.query.redirectUri,
      code: req.query.code
    });

    res.json(tokens);
  }
);

auth.post(
  "/refresh",
  //{ refreshToken: 'string' },
  async (req: Request<any, any, { refreshToken: string }>, res: Response) => {
    const tokens = await refreshTokenHandler(req, {
      refreshToken: req.body.refreshToken
    });

    res.json(tokenResponse(tokens));
  }
);

app.get("/", (_, res) => res.send("Hello world!"));
app.use("/auth", auth);

app.listen(config.serverPort, () => {
  console.log(`Example app listening at http://localhost:${config.serverPort}`);
  console.log(`Targeting app: ${config.services.mural}`);

  console.debug("==== CONFIG ====\n", config);
});
