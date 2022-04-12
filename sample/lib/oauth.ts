import axios, { AxiosRequestConfig } from 'axios';
import { unauthorized } from 'async-app';
import { ClientAppConfig } from 'dos-config';
import * as express from 'express';

export type Session = {
  accessToken: string;
  refreshToken: string;
}

type OAuthReq = {
  body: {
    state?: string;
  };
} & express.Request;

export type ClientAppConfigBuilder<
  Req extends express.Request = express.Request
> = (req: Req) => ClientAppConfig;

type AuthorizeParams = {
  redirectUri?: string;
  state?: string;
};

export function authorize(buildConfig: ClientAppConfigBuilder) {
  return (req: express.Request, params: AuthorizeParams) => {
    const config = buildConfig(req);

    const query = new URLSearchParams();
    query.set('client_id', config.clientId);
    query.set('redirect_uri', params.redirectUri || config.redirectUri);
    query.set('response_type', 'code');

    if (params.state) {
      query.set('state', params.state);
    }

    if (config.scopes && config.scopes.length) {
      query.set('scope', config.scopes.join(' '));
    }

    return `${config.authorizationUri}?${query}`;
  };
}

export function accessToken(buildConfig: ClientAppConfigBuilder<OAuthReq>) {
  return async (
    req: OAuthReq,
    params: { redirectUri?: string; code: string },
  ) => {
    const config = buildConfig(req);

    const payload: AxiosRequestConfig = {
      data: {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: params.code,
        grant_type: 'authorization_code',
        redirect_uri: params.redirectUri || config.redirectUri,
      },
      method: 'POST',
      url: config.accessTokenUri
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

export function refreshToken(buildConfig: ClientAppConfigBuilder) {
  return async (req: express.Request, params: { refreshToken: string }) => {
    const config = buildConfig(req);

    const payload: AxiosRequestConfig = {
      data: {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: params.refreshToken,
        scope: config.scopes,
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

