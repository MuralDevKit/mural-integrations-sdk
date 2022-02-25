import { FetchFunction } from '../../mural-client';

const allMuralsData = require('./data/getAllMurals.json');
const allWorkspacesData = require('./data/getAllWorkspaces.json');
const allRoomsData = require('./data/getAllRooms.json');
const muralsByRoomData = require('./data/getMuralsByRoom.json');

/*
  This file mocks the exported functions in /src/mural-picker/src/api/index.ts for testing purposes.
*/

export async function getAllMurals(_fetchFn: FetchFunction) {
  return allMuralsData.value;
}

export async function getMuralsByRoom(
  _fetchFn: FetchFunction,
  workspaceId: string,
  roomId: string,
) {
  return muralsByRoomData[workspaceId][roomId].value;
}

export async function createMural(
  _fetchFn: FetchFunction,
  title: string,
  workspaceId: string,
  roomId: string,
) {
  const json = generateJsonData(title, workspaceId, roomId);
  allMuralsData.value.unshift(json);
  muralsByRoomData[workspaceId][roomId].value.unshift(json);
  return json;
}

export async function getRoomsByWorkspace(_fetchFn: FetchFunction, id: string) {
  return allRoomsData[id].value;
}

export async function getWorkspaces(_fetchFn: FetchFunction) {
  return allWorkspacesData.value;
}

export async function getWorkspace(_fetchFn: FetchFunction, id: string) {
  return allWorkspacesData.value.find((v: { id: string }) => {
    return v.id === id;
  });
}

function generateJsonData(title: string, workspaceId: string, roomId: string) {
  const currentEpochTime = Date.now();
  return {
    value: {
      createdBy: {
        email: 'ssong@mural.co',
        firstName: 'Stella',
        id: 'u57f657e756219cfe96ed9552',
        lastName: 'Song',
        type: 'member',
      },
      createdOn: currentEpochTime,
      embedLink: '',
      id: `${workspaceId}.${roomId}`,
      roomId,
      sharingSettings: {
        link: 'http://mural.co',
      },
      thumbnailUrl: 'https://app.mural.co/static/images/mural-thumb.svg',
      title,
      updatedBy: {
        email: 'ssong@mural.co',
        firstName: 'Stella',
        id: 'u57f657e756219cfe96ed9552',
        lastName: 'Song',
        type: 'member',
      },
      updatedOn: currentEpochTime,
      visitorSettings: {
        link: 'http://mural.co',
        visitors: 'read',
        workspaceMembers: 'write',
      },
      workspaceId,
    },
  };
}
