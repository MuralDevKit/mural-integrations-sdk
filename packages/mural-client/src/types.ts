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
  id: number;
  name: string;
  type: string;
  workspaceId: string;
};

export type Mural = {
  id: string;
  /** @deprecated
   * This field will require the new DR content API in the future
   */
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  };
  createdOn: number;
  favorite: boolean;
  title: string;
  thumbnailUrl: string;
  roomId: number;
  /** @deprecated
   * This field will require the new DR content API in the future
   */
  updatedBy: {
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  };
  updatedOn: number;
  visitorsSettings: {
    link: string;
    visitors: string;
    workspaceMembers: string;
  };
  workspaceId: string;

  _canvasLink: string;
};

export type MuralContentSession = {
  token: string;
  workspaceId: string;
  zone: {
    endpoints: {
      api: string;
      realtime: string;
    };
    id: string;
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

export type Asset = {
  name: string;
  url: string;
  headers: Record<string, string>;
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
  rotation: number;
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

export type Image = {
  aspectRatio?: number;
  border: boolean;
  caption: string;
  description: string;
  expiresInMinutes?: number;
  instruction?: string;
  mask?: {
    top: number;
    left: number;
    height: number;
    width: number;
  };
  naturalHeight: number;
  naturalWidth: number;
  showCaption: boolean;
  thumbnailUrl: string;
  url: string;
} & Widget;

interface BaseWidgetPayload {
  height?: number;
  hidden?: boolean;
  parentId?: string;
  presentationIndex?: number;
  rotation?: number;
  width?: number;
  x: number;
  y: number;
}

export type CreateImagePayload = {
  border?: boolean;
  caption?: string;
  description?: string;
  height: number;
  hyperlink?: string;
  instruction?: string;
  name: string;
  showCaption?: boolean;
  width: number;
} & BaseWidgetPayload;

export type CreateStickyNotePayload = {
  hyperlink?: string;
  hyperlinkTitle?: string;
  instruction?: string;
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
} & BaseWidgetPayload;

export interface UpdateStickyNotePayload
  extends Partial<CreateStickyNotePayload> {}
