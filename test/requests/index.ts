import { getCtxItem, setCtxItem } from 'pickled-cucumber/context';
import { AxiosRequest, Method, MockRequest } from './common';
import defaultHandler from './default';

export const USER_NOTIFICATIONS = 'USER_NOTIFICATIONS';
export const MS_TEAMS_BOT_REQUEST = 'MS_TEAMS_BOT_REQUEST';

const requests: MockRequest[] = [
  {
    method: Method.GET,
    url: (url: string) =>
      /https:\/\/login\.microsoftonline\.com\/[0-9a-f\\-]*\/.well-known\/openid-configuration/.test(
        url,
      ),
    handler: () => {
      return {
        status: 200,
        data: {
          jwks_uri: 'https://login.microsoftonline.com/common/discovery/keys',
        },
      };
    },
  },
  {
    method: Method.GET,
    url: (url: string) =>
      url === 'https://login.microsoftonline.com/common/discovery/keys',
    handler: () => {
      const responseStr = getCtxItem<string>('AAD_JWKS_RESPONSE');
      if (responseStr) {
        return {
          status: 200,
          data: JSON.parse(responseStr),
        };
      }
      return { status: 404 };
    },
  },
  {
    method: Method.GET,
    url: (url: string) =>
      url === 'https://idbroker-b-us.webex.com/idb/oauth2/v2/keys/verification',
    handler: () => {
      const responseStr = getCtxItem<string>('WEBEX_JWK_RESPONSE');
      if (responseStr) {
        return {
          status: 200,
          data: JSON.parse(responseStr),
        };
      }
      return { status: 404 };
    },
  },
  {
    method: Method.GET,
    url: (url: string) =>
      /https:\/\/api.unsplash.com\/search\/photos\?.*/.test(url),
    handler: () => {
      return {
        status: 200,
        data: { results: [] },
      };
    },
  },
  {
    method: Method.GET,
    url: (url: string) =>
      /https:\/\/api.giphy.com\/v1\/.*\/search\?.*/.test(url),
    handler: () => {
      return {
        status: 200,
        data: { pagination: { total_count: 0 }, data: [] },
      };
    },
  },
  {
    method: Method.GET,
    url: (url: string) =>
      /http:\/\/.*\/v0\/notifications\/status\?id=.*/.test(url),
    handler: (request: AxiosRequest) => {
      const id = new URL(request.url).searchParams.get('id')!;
      const notifications =
        getCtxItem<Record<string, boolean>>(USER_NOTIFICATIONS) || {};

      return {
        status: 200,
        data: notifications[id]
          ? { enabled: true, username: 'dummy_username' }
          : { enabled: false },
      };
    },
  },
  {
    method: Method.DELETE,
    url: (url: string) =>
      /http:\/\/.*\/v0\/notifications\/force-disconnect\?id=.*/.test(url),
    handler: (request: AxiosRequest) => {
      const id = new URL(request.url).searchParams.get('id')!;
      const notifications =
        getCtxItem<Record<string, boolean>>(USER_NOTIFICATIONS) || {};

      return {
        status: 200,
        data: { result: notifications[id] ? 'SUCCESS' : 'NOT_CONNECTED' },
      };
    },
  },
  {
    method: Method.POST,
    url: (url: string) => /http:\/\/.*\/v0\/notifications\/connect/.test(url),
    handler: () => {
      return {
        status: 200,
        data: { url: '' },
      };
    },
  },
  {
    method: Method.POST,
    url: (url: string) => {
      const botServiceUrl = getCtxItem<string>('BOT_SERVICE_URL');
      return url.includes(botServiceUrl);
    },
    handler: (request: AxiosRequest) => {
      setCtxItem(MS_TEAMS_BOT_REQUEST, request);
      return {
        status: 200,
        data: '{}',
      };
    },
  },
  {
    method: Method.GET,
    url: (url: string) => /.*\/api\/v0\/templates\/globals/.test(url),
    handler: () => {
      return {
        status: 200,
        data: [],
      };
    },
  },
  {
    method: Method.POST,
    url: (url: string) => /.*functions\/getDeveloperAppByIds/.test(url),
    handler: () => {
      return {
        status: 200,
        data: {
          result: {
            apps: [
              {
                id: '1111',
                name: 'string',
                slug: 'string',
                url: 'string',
                developer: 'Oleksii',
                developerContent: 'any',
                developerData: {
                  dashboardSettings: {
                    name: 'string',
                    custom_entry_point: 'string',
                    SVG_Icon: {
                      file: {
                        url: 'string',
                      },
                    },
                    permissions: ['allow', 'delete'],
                    sandbox_permissions: ['sdas', 'test'],
                  },
                  facilitatorMode: true,
                  permissions: ['allow', 'delete'],
                  sandboxPermissions: ['allow', 'delete'],
                },
              },
              {
                id: '2222',
                name: 'string',
                slug: 'string',
                url: 'string',
                developer: 'Oleksii2',
                developerContent: 'any',
                developerData: {
                  dashboardSettings: {
                    name: 'string',
                    custom_entry_point: 'string2',
                    SVG_Icon: {
                      file: {
                        url: 'string',
                      },
                    },
                    permissions: ['allow', 'delete'],
                    sandbox_permissions: ['sdas', 'test'],
                  },
                  facilitatorMode: true,
                  permissions: ['allow', 'delete'],
                  sandboxPermissions: ['allow', 'delete'],
                },
              },
            ],
          },
        },
      };
    },
  },
  {
    method: Method.POST,
    url: (url: string) => /.*functions\/getDeveloperAppById/.test(url),
    handler: () => {
      return {
        status: 200,
        data: {
          result: {
            appDetail: {
              id: '1111',
              name: 'string',
              slug: 'string',
              url: 'string',
              developer: 'Oleksii',
              developerContent: 'any',
              developerData: {
                dashboardSettings: {
                  name: 'string',
                  custom_entry_point: 'string',
                  SVG_Icon: {
                    file: {
                      url: 'string',
                    },
                  },
                  permissions: ['allow', 'delete'],
                  sandbox_permissions: ['sdas', 'test'],
                },
                facilitatorMode: true,
                permissions: ['allow', 'delete'],
                sandboxPermissions: ['allow', 'delete'],
              },
            },
          },
        },
      };
    },
  },
];

export default (request: AxiosRequest) => {
  const mock = requests.find(
    r => r.method === request.method && r.url(request.url),
  );
  if (mock) return mock.handler(request);
  return defaultHandler(request);
};
