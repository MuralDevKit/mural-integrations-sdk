/**
 * Possible user facing errors for consistent use
 */
// eslint-disable-next-line no-shadow
export enum MURAL_PICKER_ERRORS {
  ERR_RETRIEVING_MURALS = 'Error retrieving murals.',
  ERR_RETRIEVING_WORKSPACES = 'Error retrieving workspaces.',
  ERR_RETRIEVING_ROOM_AND_MURALS = 'Error retrieving room and murals.',
  ERR_RETRIEVING_ROOM_MURALS = 'Error retrieving room murals.',
  ERR_SELECTING_MURAL = 'Error selecting mural.',
  ERR_SELECT_WORKSPACE = 'Please select a workspace.',
  ERR_SELECT_ROOM = 'Please select a room.',
  ERR_SELECT_MURAL = 'Please select a mural.',
  ERR_SEARCH_NO_MURALS_FOUND = 'No murals found.',
  ERR_SEARCH_MURALS = 'Error searching for murals.',
  ERR_CREATE_MURAL = 'Error creating a mural.',
  ERR_CREATE_MURAL_PERMISSION = `You don't have permission to create a mural in this room.`,
  ERR_SEARCH_TEMPLATES = 'Error searching for templates.',
  ERR_RETRIEVING_TEMPLATES = 'Error retrieving templates.',
  ERR_RETRIEVING_ROOMS = 'Error retrieving rooms.',
}
