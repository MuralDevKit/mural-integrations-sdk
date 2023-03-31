import { v4 as uuid } from 'uuid';
import {
  Mural,
  Room,
  Template,
  Workspace,
} from '../../../packages/mural-client';
import generateMemoryEntity from './memory-entity';

const generateUuid = () => uuid();

// Generate room IDs as incremental integers
let lastRoomId = new Date().getTime();
const generateRoomId = () => lastRoomId++;

const workspace = generateMemoryEntity<Workspace, 'id'>('id', generateUuid);

const room = generateMemoryEntity<Room, 'id'>('id', generateRoomId, {
  type: 'private',
});

const mural = generateMemoryEntity<Mural, 'id'>('id', generateUuid, {
  thumbnailUrl: 'https://static.testing.rig/mural-thumbnail.png',
  createdBy: {
    firstName: 'Created',
    lastName: 'By',
  },
  updatedBy: {
    firstName: 'Updated',
    lastName: 'By',
  },
});

const template = generateMemoryEntity<Template, 'id'>('id', generateUuid, {
  thumbUrl: 'https://static.testing.rig/template-thumbnail.png',
  createdBy: {
    firstName: 'Created',
    lastName: 'By',
  },
  updatedBy: {
    firstName: 'Updated',
    lastName: 'By',
  },
});

export default {
  workspace,
  room,
  mural,
  template,
};
