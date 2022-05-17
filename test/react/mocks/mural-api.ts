import fetchMock from 'fetch-mock';
import { getCtxItem } from 'pickled-cucumber/context';
import muralApiEntities from '../entities/mural-api';
import { FAKE_MURAL_HOST } from '../../utils';

export const ROUTES = {
  // Public API
  ME: `glob:*/api/public/v1/users/me`,
  MURAL: `glob:*/api/public/v1/murals/*`,
  MURALLY_OAUTH_SESSION: `glob:*/api/v0/authenticate/oauth2/session/*`,
  MURALS: `glob:*/api/public/v1/murals`,
  ROOMS_MURALS: `glob:*/api/public/v1/rooms/*/murals`,
  WORKSPACES: `glob:*/api/public/v1/workspaces`,
  WORKSPACES_MURALS: `glob:*/api/public/v1/workspaces/*/murals`,
  WORKSPACES_ROOMS: `glob:*/api/public/v1/workspaces/*/rooms`,
  WORKSPACES_TEMPLATES: `glob:*/api/public/v1/workspaces/*/templates`,
  TEMPLATES: 'glob:*/api/public/v1/templates',
  TEMPLATES_MURALS: 'glob:*/api/public/v1/templates/*/murals',
  SEARCH_ROOMS: `glob:*/api/public/v1/search/*/rooms*`,

  // Internal API
  REALM: `glob:*/api/v0/user/realm`,
  MURAL_INTERNAL: `glob:*/api/murals/*/*`,
  MURAL_VISITOR: 'glob:*/api/v0/visitor/*.*',
  GLOBAL_TEMPLATES: 'glob:*/api/v0/templates/globals*',
};

export const registerGlobalRoutes = () => {
  fetchMock.get(ROUTES.ME, async () => {
    return {
      value: {
        lastActiveWorkspace: getCtxItem<string>('LAST_ACTIVE_WORKSPACE'),
      },
    };
  });

  fetchMock.get(ROUTES.WORKSPACES_MURALS, async (url: string) => {
    const workspaceId = new URL(url).pathname.split('/')[5];
    const murals = await muralApiEntities.mural.findAllBy({ workspaceId });
    return { value: murals };
  });

  fetchMock.get(ROUTES.WORKSPACES_ROOMS, async (url: string) => {
    const workspaceId = new URL(url).pathname.split('/')[5];
    const rooms = await muralApiEntities.room.findAllBy({ workspaceId });
    return { value: rooms };
  });

  fetchMock.get(ROUTES.WORKSPACES_TEMPLATES, async (url: string) => {
    const workspaceId = new URL(url).pathname.split('/')[5];
    const rooms = await muralApiEntities.template.findAllBy({ workspaceId });
    return { value: rooms };
  });

  fetchMock.get(ROUTES.ROOMS_MURALS, async (url: string) => {
    const roomId = new URL(url).pathname.split('/')[5];
    const murals = await muralApiEntities.mural.findAllBy({ roomId });
    return { value: murals };
  });

  fetchMock.get(ROUTES.MURAL, async (url: string) => {
    const muralId = new URL(url).pathname.split('/')[5];
    const mural = await muralApiEntities.mural.findBy({ id: muralId });
    return { value: mural };
  });

  fetchMock.get(ROUTES.WORKSPACES, async () => {
    const workspaces = await muralApiEntities.workspace.findAll();
    return { value: workspaces };
  });

  fetchMock.get(ROUTES.TEMPLATES, async () => {
    const templates = await muralApiEntities.template.findAll();
    return { value: templates };
  });

  fetchMock.get(ROUTES.GLOBAL_TEMPLATES, () => {
    return muralApiEntities.template.findAll();
  });

  fetchMock.post(ROUTES.TEMPLATES_MURALS, async (_, opts) => {
    const payload = JSON.parse(opts?.body?.toString() || '{}');
    if (!payload.id) payload.id = 'wid.mid';
    const mural = await muralApiEntities.mural.create(payload);
    return { value: mural };
  });

  fetchMock.put(ROUTES.MURALLY_OAUTH_SESSION, (url: string) => {
    const params = new URLSearchParams(new URL(url).search);
    const redirectUrl = params.get('redirectUrl');

    return JSON.stringify(
      `https://${FAKE_MURAL_HOST}/claim_url?redirectUrl=${redirectUrl}`,
    );
  });

  fetchMock.get(ROUTES.SEARCH_ROOMS, async (url: string) => {
    const parsedUrl = new URL(url);
    const workspaceId = parsedUrl.pathname.split('/')[5];
    const rooms = await muralApiEntities.room.findAllBy({ workspaceId });
    const title = parsedUrl.searchParams.get('title');
    if (title) {
      return {
        value: rooms.filter((room: { name: string }) =>
          room.name.includes(title),
        ),
      };
    }
    return { value: rooms };
  });
};
