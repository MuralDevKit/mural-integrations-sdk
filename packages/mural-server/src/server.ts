import express, {Request, Response, NextFunction} from 'express';
import { URLSearchParams, URL } from "url"
import dotenv from 'dotenv';
dotenv.config()
import cookieParser from 'cookie-parser'
import axios from 'axios';
import * as path from "path";
import bodyParser from "body-parser";
const app = express();
app.use(cookieParser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const API_BASE = process.env.API_BASE || "https://app.mural.co";

const config = {
    clientId: process.env.MURAL_CLIENT_ID || '',
    clientSecret: process.env.MURAL_CLIENT_SECRET || '',
    scopes: [] as string[],
    serverPort: normalizePort(process.env.SERVER_PORT || '8301'),
    authorizationUri: `${API_BASE}/api/public/v1/authorization/oauth2/`,
    accessTokenUri: `${API_BASE}/api/public/v1/authorization/oauth2/token/`,
    refreshTokenUri: `${API_BASE}/api/public/v1/authorization/oauth2/refresh/`,
    redirectUri: process.env.REDIRECT_URI || `https://dev.com/auth/token/`,
    authHandlerHtml: path.join(__dirname, './public','/authHandler.html')
};

/**
 * Return final HTML when token provided.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.query.accessToken) {
        res.sendFile(config.authHandlerHtml);
        return
    }
    next()
})
app.use(express.static('public'))

/**
 * initial route to initiate oAuth flow
 */
app.get(
    "/auth",
    (req, res) => {
        // decide where we are redirecting after being authenticated.
        const redirectUri = req.query.redirectUri
            ? req.query.redirectUri.toString()
            : undefined;
        // is there any state that needs to be passed through the auth process
        const state = req.query.state ? req.query.state.toString() : undefined;
        console.log('redirectUri', redirectUri);
        const query = new URLSearchParams();
        query.set("client_id", config.clientId);
        query.set("redirect_uri", config.redirectUri);
        query.set("response_type", "code");

        if (state) {
            query.set("state", state);
        }

        if (config.scopes && config.scopes.length) {
            query.set("scope", config.scopes.join(" "));
        }
        // This will return a url string that will allow you to authenticate your app
        // and it can also redirect back to your client application
        res.cookie("redirectUri", redirectUri);
        res.redirect(302, `${config.authorizationUri}?${query}`);
    }
);

/**
 * Get access and refresh tokens
 */
app.get(
    "/auth/token",
    async (req, res) => {
        if (req.query.error) {
            res.json(req.query.error);
            return;
        }

        const redirectUrl = new URL(
            req.cookies?.redirectUri || req.protocol + "://" + req.hostname + "/"
        );
        const payload = {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code: req.query.code,
            grant_type: "authorization_code",
            redirect_uri: req.query.redirectUri || config.redirectUri,
        };

        const response = await axios.post(config.accessTokenUri, payload);
        if (response.status !== 200) {
            throw "token request failed";
        }

        redirectUrl.searchParams.set("accessToken", response.data.access_token);
        redirectUrl.searchParams.set("refreshToken", response.data.refresh_token);
        res.clearCookie("redirectURI");
        res.redirect(302, redirectUrl.href);
    }
);

/**
 * refresh token endpoint
 */
app.post(
    "/auth/refresh",
    async (req, res) => {
        let response;
        try {
            const conf = {
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${config.clientId}:${config.clientSecret}`
                    ).toString("base64")}`,
                }
            }
            const payload = {
                grant_type: "refresh_token",
                refresh_token: req.body.refreshToken,
                scope: config.scopes,
            };
            response = await axios.post(config.refreshTokenUri, payload, conf);
        } catch (err) {
            res.status(err.response.status);
            res.json({ error: err.toJSON(), data: err.response.data });
            return;
        }

        res.json({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
        });
    }
);

/**
 * Full proxy support for Mural public v1 routes
 */
app.use('/api/public/v1/**',async (req:Request, res:Response) => {
    const method = req.method
    const path = `https://app.mural.co${req.baseUrl}`;
    try {
        const headers = {
            Authorization: ''
        };
        if(req.headers.authorization) {
            headers.Authorization = req.headers.authorization
        }
        // @ts-ignore
        const response = await axios[method.toLowerCase()](path, {
            headers: headers
        })
        res.status(response.status)
        res.send(response.data)
    } catch (err) {
        res.status(err.response.status);
        res.json({ error: err.toJSON(), data: err.response.data });
    }
})

/**
 * Start of the server
 * @param listenCallback - optional. Callback function when server is listening.
 */
function listen(listenCallback?: () => void):void {
    if(!config.scopes.length) {
        console.warn('No scope provided')
    }
    if(!config.clientId) {
        throw new Error('Client Id is not provided')
    }
    if(!config.clientSecret) {
        throw new Error('Client secret is not provided')
    }
    if(!config.redirectUri) {
        throw new Error('redirectUri is not provided')
    }
    const _listenCallback = listenCallback || function () {}
    app.listen(config.serverPort, _listenCallback)
}

/**
 * @param scopes - array of scopes
 */
function setScopes (scopes:string[]):void {
    config.scopes = scopes;
}

/**
 * setCustomAuthHandlerHtml
 * @param htmlPath - full path for custom HTML file (path.join(__dirname, '/folder1','/anyCustomHtml.html'))
 */
function setCustomAuthHandlerHtml (htmlPath: string):void {
    config.authHandlerHtml = htmlPath;
}

function normalizePort(val:string) {
    const port = parseInt(val, 10);

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

export default app;
export {listen, setScopes, setCustomAuthHandlerHtml}