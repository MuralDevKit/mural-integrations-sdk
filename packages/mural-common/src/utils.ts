import defaultsDeep from 'lodash/defaultsDeep';
import cloneDeep from 'lodash/cloneDeep';
import { DeepPartial } from './types';

export function defaultBuilder<T>(defaults: T) {
  return (overrides?: DeepPartial<T>): T => {
    // Merge logic where D → Defaults, O → Override
    // 1. D & O ⇒ O
    // 2. D & !O => D
    // 3. !D & O ⇒ O
    //
    return defaultsDeep(cloneDeep(overrides), defaults);
  };
}
