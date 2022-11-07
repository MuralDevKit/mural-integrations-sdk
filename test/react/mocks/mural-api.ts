import fetchMock from 'fetch-mock';
import { getCtxItem } from 'pickled-cucumber/context';
import muralApiEntities from '../entities/mural-api';

import { FAKE_MURAL_HOST } from '../../utils';

export const ROUTES = {
  // Public API
  ME: 'express:/api/public/v1/users/me',
  MURAL: 'express:/api/public/v1/murals',
  MURALS: 'express:/api/public/v1/murals',
  ROOMS_MURALS: 'express:/api/public/v1/rooms/:roomId/murals',
  WORKSPACES: 'express:/api/public/v1/workspaces',
  WORKSPACES_MURALS: 'express:/api/public/v1/workspaces/:workspaceId/murals',
  WORKSPACES_ROOMS: 'express:/api/public/v1/workspaces/:workspaceId/rooms',
  WORKSPACES_TEMPLATES:
    'express:/api/public/v1/workspaces/:workspaceId/templates',
  TEMPLATES: 'experss:/api/public/v1/templates',
  TEMPLATES_MURALS: 'express:/api/public/v1/templates/:templateId/murals',
  SEARCH_ROOMS: 'express:/api/public/v1/search/:workspaceId/rooms',

  // Internal API
  REALM: `glob:*/api/v0/user/realm`,
  MURAL_INTERNAL: `glob:*/api/murals/*/*`,
  MURAL_VISITOR: 'glob:*/api/v0/visitor/*.*',
  MURALLY_OAUTH_SESSION: `glob:*/api/v0/authenticate/oauth2/session/*`,
  GLOBAL_TEMPLATES: 'glob:*/api/v0/templates/globals*',
};

export const MURAL_API_GET_ROOMS_BY_WORKSPACE_DEFAULT_LIMIT_KEY =
  '$mural-api-get-rooms-by-workspace-default-limit';

const DEFAULT_LIMIT = 100;

const INVALID_LIMIT_RESPONSE = {
  body: {
    code: 'LIMIT_INVALID',
    message: 'The limit is invalid.',
  },
  status: 400,
};

const INVALID_PAGINATION_RESPONSE = {
  body: {
    code: 'PAGINATION_INVALID',
    message: 'The pagination is invalid.',
  },
  status: 400,
};

/**
 * Parse 'limit' query parameter.
 * Return default limit when the parameter is not provided or is 0.
 */
const parseLimitParam = (limitParam: string | null) => {
  if (limitParam === null) {
    return DEFAULT_LIMIT;
  }

  const limit = parseInt(limitParam, 10);
  if (!Number.isInteger(limit)) {
    throw new Error('Invalid limit parameter');
  }

  return limit > 0 ? limit : DEFAULT_LIMIT;
};

/**
 * Parse 'next' query parameter.
 * Return 0 when the parameter is not provided.
 */
const parseNextParam = (nextParam: string | null) => {
  if (nextParam === null) {
    return 0;
  }

  const next = parseInt(nextParam, 10);
  if (!Number.isInteger(next)) {
    throw new Error('Invalid next parameter');
  }

  return next;
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
    const parsedUrl = new URL(url);
    const workspaceId = parsedUrl.pathname.split('/')[5];

    let limit;
    try {
      limit = parseLimitParam(parsedUrl.searchParams.get('limit'));
    } catch (err) {
      return INVALID_LIMIT_RESPONSE;
    }

    // Allow overriding the specified limit from context
    const defaultLimit = getCtxItem<number>(
      MURAL_API_GET_ROOMS_BY_WORKSPACE_DEFAULT_LIMIT_KEY,
    );
    limit = defaultLimit ?? limit;

    let next;
    try {
      next = parseNextParam(parsedUrl.searchParams.get('next'));
    } catch (err) {
      return INVALID_PAGINATION_RESPONSE;
    }

    let rooms = await muralApiEntities.room.findAllBy({ workspaceId });
    const numRooms = rooms.length;

    // Create a page of rooms according to the pagination parameters
    rooms = rooms.slice(next, next + limit);

    // Create the token to request the next page
    next += limit;
    if (next >= numRooms) {
      next = undefined;
    }

    return {
      value: rooms,
      next: next ? next.toString() : undefined,
    };
  });

  fetchMock.get(ROUTES.WORKSPACES_TEMPLATES, async (url: string) => {
    const workspaceId = new URL(url).pathname.split('/')[5];
    const templates = await muralApiEntities.template.findAllBy({
      workspaceId,
    });

    return { value: templates };
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
