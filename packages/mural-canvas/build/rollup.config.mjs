import path from 'path';
import { moduleConfig } from '../../../build/rollup.config.mjs';

export default [
  moduleConfig({
    packageDir: path.resolve(),
    name: 'mural-canvas',
  }),
];
