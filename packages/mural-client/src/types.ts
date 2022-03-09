export type User = {
  avatar: string;
  createdOn: number;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  type: string;
  lastActiveWorkspace: string;
};

export type Workspace = {
  id: string;
  name: string;
};

export type Room = {
  id: string;
  name: string;
  type: string;
  workspaceId: string;
};

export type Mural = {
  id: string;
  title: string;
  favorite: boolean;
  thumbnailUrl: string;
  updatedOn: number;
  workspaceId: string;
  roomId: string;
  visitorsSettings: {
    link: string;
    visitors: string;
    workspaceMembers: string;
  };
};

export type Template = {
  description: string;
  id: string;
  name: string;
  publicHash: string;
  thumbUrl: string;
  type: 'default' | 'custom';
  updatedOn: number;
  workspaceId: string;
  viewLink: string;
};
