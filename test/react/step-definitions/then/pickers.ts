import capitalize from 'lodash/capitalize';
import { SetupFnArgs } from 'pickled-cucumber/types';

export default function registerThen({ Then, compare, getCtx }: SetupFnArgs) {
  // USAGE:
  //
  // Then the last selected room is ${R}
  // Then the last selected workspace is ${W}
  Then(
    'the last selected (room|workspace) {op}',
    (entityName, op, payload) => {
      const key = `$lastSelected${capitalize(entityName)}`;
      const entity = getCtx(key);
      compare(op, entity, payload);
    },
    {
      inline: true,
    },
  );
}
