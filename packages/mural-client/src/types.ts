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

export type Tag = {
  id: string;
  text: string;
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
};

export type WidgetMember = {
  firstName: string;
  lastName: string;
  type: string;
};

export type Widget = {
  contentEditedBy?: WidgetMember;
  contentEditedOn?: number;
  createdBy: WidgetMember;
  createdOn: number;
  height: number;
  hidden: boolean;
  hideEditor: false;
  hideOwner: false;
  id: string;
  locked: boolean;
  lockedByFacilitator: boolean;
  parentId?: string;
  presentationIndex?: number;
  type: string;
  updatedBy?: WidgetMember;
  updatedOn?: number;
  width: number;
  x: number;
  y: number;
};

export type StickyNote = {
  hyperlink?: string;
  hyperlinkTitle?: string;
  minLines?: number;
  shape: 'circle' | 'rectangle';
  tags?: string[];
  text?: string;
  title?: string;
} & Widget;

export interface CreateStickyNotePayload {
  height?: number;
  hyperlink?: string;
  hyperlinkTitle?: string;
  instruction?: string;
  parentId?: string;
  presentationIndex?: 1;
  rotation?: number;
  shape: 'circle' | 'rectangle';
  style?: {
    backgroundColor?: string;
    bold?: boolean;
    border?: boolean;
    font?: string;
    fontSize?: number;
    italic?: boolean;
    strike?: boolean;
    textAlign?: string;
    underline?: boolean;
  };
  tags?: string[];
  text?: string;
  title?: string;
  width?: number;
  x: number;
  y: number;
}
