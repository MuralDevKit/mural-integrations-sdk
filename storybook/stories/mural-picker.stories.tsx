import {
  ApiClient,
  Mural,
  Room,
  Workspace,
  User,
  ClientConfig,
} from '@muraldevkit/mural-integrations-mural-client';
import { MuralPicker } from '@muraldevkit/mural-integrations-mural-picker';
import React from 'react';

const generateMurals = (count: number, type: string): Mural[] => {
  const murals = [
    {
      _canvasLink: '',
      createdBy: {
        email: 'dummy@mural.co',
        firstName: 'Dimebag',
        id: 'u706bd7edc127b586b0410320',
        lastName: 'Darrel',
      },
      createdOn: 1663596120234,

      favorite: false,
      id: 'murally-org.1663596120234',
      roomId: 1624391458942,

      thumbnailUrl:
        'https://murally.blob.core.windows.net/thumbnails/murally-org%2Fmurals%2Fmurally-org.1659575140738-undefined-a439ef0d-4aed-41e4-8328-7ff5e466a8de.png?v=a33a421a-3492-4503-bc93-d8e6060b655b',
      title: 'My dummy mural',
      updatedBy: {
        email: 'phill@mural.co',
        firstName: 'Phill',
        id: 'u706bd7edc127b586b0410320',
        lastName: 'Anselmo',
      },
      updatedOn: 1675117648830,
      visitorsSettings: {
        link: '',
        visitors: 'none',
        workspaceMembers: 'read',
      },
      workspaceId: 'myWorkspaceId',
    },
  ];
  for (let i = 0; i < count; i++) {
    murals.push({
      ...murals[0],
      id: `murally-org.${i}`,
      title: `${type} - My dummy mural ${i}`,
    });
  }
  return murals;
};

const apiClient: ApiClient = {
  config: {
    appId: 'xxx',
    integrationsHost: 'https://integrations.mural.co',
    muralHost: undefined,
    secure: true,
  } as ClientConfig,
  abort: () => {},
  track: () => {},
  getCurrentUser: () =>
    Promise.resolve({ value: { email: '', id: 'xxx' } as User }),
  getWorkspaces: () =>
    Promise.resolve({
      value: [
        {
          id: 'myWorkspaceId',
          name: 'Workspace A',
        },
      ] as Workspace[],
    }),
  getRoomsByWorkspace: () =>
    Promise.resolve({
      value: [
        {
          id: 1439228318329,
          name: 'my room',
          type: 'private',
          workspaceId: 'myWorkspaceId',
        },
      ] as Room[],
    }),
  getMuralsByWorkspace(query, options) {
    return Promise.resolve({
      value: generateMurals(50, 'defauls'),
    });
  },
  getMuralsByRoom(query, options) {
    return Promise.resolve({
      value: generateMurals(20, 'room'),
    });
  },
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default { title: 'Mural Picker', component: MuralPicker };

const onSelect = (mural, room, workspace) => {
  alert({ mural, room, workspace });
};
const onError = () => {};

export const CreateDisabled = () => (
  <div
    style={{
      display: 'flex',
      minHeight: '600px',
    }}
  >
    <MuralPicker
      apiClient={apiClient}
      onSelect={onSelect}
      onError={onError}
      theme={{ cardSize: 'normal' }}
      disableCreate={true}
    />
  </div>
);

export const Normal = () => (
  <div
    style={{
      display: 'flex',
      minHeight: '600px',
    }}
  >
    <MuralPicker
      apiClient={apiClient}
      onSelect={onSelect}
      onError={onError}
      theme={{ cardSize: 'normal' }}
    />
  </div>
);

export const Small = () => (
  <div
    style={{
      display: 'flex',
      minHeight: '600px',
    }}
  >
    <MuralPicker
      apiClient={apiClient}
      onSelect={onSelect}
      onError={onError}
      theme={{ cardSize: 'small' }}
    />
  </div>
);

export const Tiny = () => (
  <div
    style={{
      display: 'flex',
      minHeight: '600px',
    }}
  >
    <MuralPicker
      apiClient={apiClient}
      onSelect={onSelect}
      onError={onError}
      theme={{ cardSize: 'tiny' }}
    />
  </div>
);

export const PPTMinWidth320PX = () => (
  <div
    style={{
      display: 'flex',
      minHeight: '600px',
      width: '320px',
    }}
  >
    <MuralPicker
      apiClient={apiClient}
      onSelect={onSelect}
      onError={onError}
      theme={{ cardSize: 'small' }}
    />
  </div>
);
