export type WorkSpace = {
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
  };
};

export type Template = {
  id: string;
  description: string;
  title: string;
  publicHash: string;
  thumbUrl: string;
};
