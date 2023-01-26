import {
  ApiClient,
  Room,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import cloneDeep from 'lodash/cloneDeep';

type GetAllRoomsByWorkspace = (
  apiClient: ApiClient,
  ...params: Parameters<ApiClient['getRoomsByWorkspace']>
) => Promise<Room[]>;

type GetAllWorkspaces = (
  apiClient: ApiClient,
  ...params: Parameters<ApiClient['getWorkspaces']>
) => Promise<Workspace[]>;

export const getAllRoomsByWorkspace: GetAllRoomsByWorkspace = async (
  apiClient,
  query,
  options,
) => {
  const rooms: Room[] = [];
  let next: string | undefined;

  const queryOptions = options ? cloneDeep(options) : {};
  queryOptions.paginate = options?.paginate ?? {};

  do {
    // Get a page of rooms
    queryOptions.paginate.next = next;
    const result = await apiClient.getRoomsByWorkspace(query, queryOptions);
    rooms.push(...result.value);

    // Get the token to request the next page
    next = result.next;
  } while (next);

  return rooms;
};

export const getAllWorkspaces: GetAllWorkspaces = async (
  apiClient,
  options,
) => {
  const workspaces: Workspace[] = [];
  let next: string | undefined;

  const queryOptions = options ? cloneDeep(options) : {};
  queryOptions.paginate = options?.paginate ?? {};

  do {
    // Get a page of workspaces
    queryOptions.paginate.next = next;
    const result = await apiClient.getWorkspaces(queryOptions);
    workspaces.push(...result.value);

    // Get the token to request the next page
    next = result.next;
  } while (next);

  return workspaces;
};
