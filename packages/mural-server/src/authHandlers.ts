import { unauthorized } from 'async-app';
import axios, { AxiosRequestConfig } from 'axios';
import { ClientAppConfig } from 'dos-config';
import express from 'express';
import qs from 'qs';

export type ClientAppContext = ClientAppConfig & {
    authorizationUri: string;
    accessTokenUri: string;
    refreshTokenUri: string;

    defaultScopes: readonly string[];
};

type OAuthReq = {
    body: {
        state?: string;
    };
} & express.Request;

export type ClientAppContextBuilder<
    Req extends express.Request = express.Request
    > = (req: Req) => ClientAppContext;

type AuthorizeParams = {
    scopes?: string[];
    redirectUri?: string;
    state?: string;
    utmParams?: Record<string, string>;
    reauthenticate?: string;
};

export function authorize(buildConfig: ClientAppContextBuilder) {
    return (req: express.Request, params: AuthorizeParams) => {
        const config = buildConfig(req);
        const scopes = new Set(params.scopes ?? config.defaultScopes);

        const query = qs.stringify({
            client_id: config.clientId,
            redirect_uri: params.redirectUri ?? config.redirectUri,
            response_type: 'code',
            state: params.state,
            reauthenticate: params.reauthenticate,
            // sorting the scopes will make the URL deterministic
            scope: Array.from(scopes).sort().join(' '),
            ...params.utmParams,
        });

        const url = new URL(config.authorizationUri);
        url.search = query;

        return url.href;
    };
}

export function accessToken(buildConfig: ClientAppContextBuilder<OAuthReq>) {
    return async (
        req: OAuthReq,
        params: { redirectUri?: string; code: string },
    ) => {
        const config = buildConfig(req);

        const payload: AxiosRequestConfig = {
            auth: {
                username: config.clientId,
                password: config.clientSecret,
            },
            data: {
                code: params.code,
                grant_type: 'authorization_code',
                redirect_uri: params.redirectUri ?? config.redirectUri,
            },
            method: 'POST',
            url: config.accessTokenUri,
        };

        const response = await axios.request(payload);
        if (response.status !== 200) {
            throw unauthorized('token request failed');
        }

        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
        };
    };
}

export function refreshToken(buildConfig: ClientAppContextBuilder) {
    return async (req: express.Request, params: { refreshToken: string }) => {
        const config = buildConfig(req);

        const payload: AxiosRequestConfig = {
            data: {
                client_id: config.clientId,
                client_secret: config.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: params.refreshToken,
            },
            method: 'POST',
            url: config.refreshTokenUri,
        };

        const response = await axios.request(payload);
        if (response.status !== 200) {
            throw unauthorized('refresh token request failed');
        }

        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
        };
    };
}
