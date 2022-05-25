import { v4 as uuid } from 'uuid';
import {
  Mural,
  Room,
  Template,
  Workspace,
} from '../../../packages/mural-client';
import generateMemoryEntity from './memory-entity';

interface BaseEntity {
  id: string;
}

const generateUuid = <T extends BaseEntity>() => {
  return uuid() as T['id'];
};

const generate = <T extends BaseEntity>(defaults?: {}) =>
  generateMemoryEntity<T, keyof T>('id', generateUuid, defaults);

const workspace = generate<Workspace>();
const room = generate<Room>({ type: 'private' });
const mural = generate<Mural>();
const template = generate<Template>();

export default {
  workspace,
  room,
  mural,
  template,
};