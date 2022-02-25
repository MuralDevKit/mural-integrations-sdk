/* eslint-disable no-console */
import {
  ApiClient,
  Mural,
  Workspace,
  Room,
} from 'mural-integrations-mural-client';

import * as React from 'react';
import MuralPicker, {
  PropTypes as MuralPickerPropTypes,
} from '../src/components/mural-picker';

const blackHole: any = new Proxy(
  {
    [Symbol.toPrimitive]: () => '∞',
    toString: () => '∞',
  },
  {
    get: () => {
      return blackHole;
    },
    apply: () => {
      return blackHole;
    },
  },
);

const ctx: Record<string, number> = {
  mural: 1,
  workspace: 1,
  room: 1,
};

type Builder<T extends {}> = (attrs?: Partial<T>) => T;

const mural: Builder<Mural> = attrs => ({
  id: attrs?.id || `mid-${ctx.mural++}`,
  favorite: true,
  workspaceId: `wid-${ctx.workspace}`,
  roomId: `rid-${ctx.room}`,
  visitorsSettings: {
    link: 'nowhere',
    visitors: 'yes',
    workspaceMembers: 'yes',
  },
  title: 'My mural',
  updatedOn: Date.now(),
  thumbnailUrl: 'https://mural.co/',
  ...attrs,
});

const room: Builder<Room> = attrs => ({
  id: attrs?.id || `rid-${ctx.room++}`,
  workspaceId: `wid-${ctx.workspace}`,
  type: 'room',
  name: 'room 1',
  ...attrs,
});

const workspace: Builder<Workspace> = attrs => ({
  id: attrs?.id || `wid-${ctx.workspace++}`,
  name: 'workspace 1',
  ...attrs,
});

interface StoryDef<Props> {
  component: any;
  title: string;
  args: Props;
}

const apiStub: Partial<ApiClient> = {
  getWorkspaces: async (): Promise<Workspace[]> => [workspace()],
  getWorkspace: async (id): Promise<Workspace> => workspace({ id }),
  getRoomsByWorkspace: async (workspaceId): Promise<Room[]> => [
    room({ workspaceId }),
  ],
  getMuralsByWorkspace: async (workspaceId): Promise<Mural[]> => [
    mural({ workspaceId }),
  ],
  getMuralsByRoom: async (roomId): Promise<Mural[]> => [
    mural({ roomId }),
    mural({ roomId }),
  ],
};

const noop = () => null;

const defaults: StoryDef<MuralPickerPropTypes> = {
  component: MuralPicker,
  title: 'Mural Picker/Murals',
  args: {
    apiClient: apiStub as any,
    handleError: noop,
    onCreateMural: noop,
    onMuralSelect: noop,
  },
};

export default defaults;

const Template = (args: MuralPickerPropTypes) => {
  debugger;
  return <MuralPicker {...args} />;
};

// TODO: will need to adjust props to reflect this
export const WithWorkspaces = Template;
export const WithRooms = Template.bind({});
export const WithMurals = Template.bind({});
export const WithMural = Template.bind({});

export const Error = Template.bind({});

// TODO: which of the following is necessary?
export const Loading = Template.bind({});
export const NoIssues = Template.bind({});
export const Submitting = Template.bind({});
