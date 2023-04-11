import { v4 as uuid } from 'uuid';
import {
  Mural,
  Room,
  Template,
  Workspace,
} from '../../../packages/mural-client';
import generateMemoryEntity from './memory-entity';
import {
  MuralSchema,
  RoomSchema,
  TemplateSchema,
  WorkspaceSchema,
  validateTypeFactory,
} from './schema';

const generateUuid = () => uuid();
const generateTimestamp = () => Date.now();

// Generate room IDs as incremental integers
let lastRoomId = new Date().getTime();
const generateRoomId = () => lastRoomId++;

const validateMural = validateTypeFactory(MuralSchema);
const validateRoom = validateTypeFactory(RoomSchema);
const validateTemplate = validateTypeFactory(TemplateSchema);
const validateWorkspace = validateTypeFactory(WorkspaceSchema);

const workspace = generateMemoryEntity<Workspace, 'id'>(
  'id',
  generateUuid,
  {},
  validateWorkspace,
);

const room = generateMemoryEntity<Room, 'id'>(
  'id',
  generateRoomId,
  {
    type: 'private',
  },
  validateRoom,
);

const mural = generateMemoryEntity<Mural, 'id'>(
  'id',
  generateUuid,
  {
    thumbnailUrl: 'https://static.testing.rig/mural-thumbnail.png',
    createdBy: {
      firstName: 'Created',
      lastName: 'By',
      email: 'creator@example.com',
      id: generateUuid(),
    },
    createdOn: generateTimestamp(),
    favorite: false,
    updatedBy: {
      firstName: 'Updated',
      lastName: 'By',
      email: 'updater@example.com',
      id: generateUuid(),
    },
    updatedOn: generateTimestamp(),
    visitorsSettings: {
      link: '',
      visitors: 'none',
      workspaceMembers: 'none',
    },
    _canvasLink: '',
  },
  validateMural,
);

const template = generateMemoryEntity<Template, 'id'>(
  'id',
  generateUuid,
  {
    thumbUrl: 'https://static.testing.rig/template-thumbnail.png',
    createdBy: {
      firstName: 'Created',
      lastName: 'By',
    },
    updatedBy: {
      firstName: 'Updated',
      lastName: 'By',
    },
  },
  validateTemplate,
);

export default {
  workspace,
  room,
  mural,
  template,
};
