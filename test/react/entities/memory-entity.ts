import { Entity, IdOrObject } from 'pickled-cucumber/entities/types';

export interface CustomEntity<T, Tid extends keyof T> extends Entity<T, Tid> {
  findAll: () => Promise<T[]>;
  findAllBy: (criteria: object) => Promise<T[]>;
}

// Customized version of https://github.com/muralco/pickled-cucumber/blob/master/src/entities/memory.ts
const generate = <T, Tid extends keyof T>(
  idField: Tid,
  newId: () => T[Tid],
  defaults?: {},
): CustomEntity<T, Tid> => {
  const entities: T[] = [];

  const isObj = (v: IdOrObject<T, Tid>): v is T => v && idField in v;
  type Entries = [keyof T, T[keyof T]][];

  const entityMethods: CustomEntity<T, Tid> = {
    create: async record => {
      const e = { [idField]: newId(), ...defaults, ...(record as T) };
      entities.push(e);
      return e;
    },
    delete: async id => {
      const entity = await entityMethods.findById(id);
      if (!entity) return;
      entities.splice(entities.findIndex(e => e === entity, 1));
    },
    findAll: async () => {
      return entities;
    },
    findAllBy: async (criteria: object) => {
      const entries = Object.entries(criteria) as Entries;
      return entities.filter(
        e =>
          entries.every(pair => e[pair[0]] === pair[1]) ||
          (idField in criteria && e[idField] === (criteria as any)[idField]),
      );
    },
    findBy: async (criteria: object) => {
      const entries = Object.entries(criteria) as Entries;
      return entities.find(
        e =>
          entries.every(pair => e[pair[0]] === pair[1]) ||
          (idField in criteria && e[idField] === (criteria as any)[idField]),
      );
    },
    findById: async record => {
      const id = isObj(record) ? record[idField] : record;
      return entityMethods.findBy({ [idField]: id });
    },
    update: async (record, update) => {
      const entity = await entityMethods.findById(record);
      return Object.assign(entity, update);
    },
  };

  return entityMethods;
};

export default generate;
