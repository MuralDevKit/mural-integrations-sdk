import { DEBUG, BUNDLE_STATS } from './module-config.mjs';
import muralCommon from '../packages/mural-common/build/rollup.config.mjs';
import muralClient from '../packages/mural-client/build/rollup.config.mjs';
import muralPicker from '../packages/mural-picker/build/rollup.config.mjs';
import muralCanvas from '../packages/mural-canvas/build/rollup.config.mjs';
import muralAccountChooser from '../packages/mural-account-chooser/build/rollup.config.mjs';

console.info('=== Build flags ===');
console.info('DEBUG:', DEBUG);
console.info('BUNDLE_STATS:', BUNDLE_STATS);

const registerModules = (...modules) => {
  const graph = [];
  for (const module of modules) {
    if (graph.find(m => m._name === module._name)) continue;

    graph.push(module);
  }

  return graph;
};

export default registerModules(
  ...muralCommon,
  ...muralClient,
  ...muralPicker,
  ...muralCanvas,
  ...muralAccountChooser,
);
