import { ApiClient, Room } from '@muraldevkit/mural-integrations-mural-client';
import cloneDeep from 'lodash/cloneDeep';

type GetAllRoomsByWorkspace = (
  apiClient: ApiClient,
  ...params: Parameters<ApiClient['getRoomsByWorkspace']>
) => Promise<Room[]>;

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
