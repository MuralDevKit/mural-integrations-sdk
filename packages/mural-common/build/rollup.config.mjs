import path from 'path';
import { moduleConfig } from '../../../build/rollup.config.mjs';

export default [
  moduleConfig({
    entrypoint: 'src/index.ts',
    packageDir: path.resolve(),
    name: 'mural-common',
  }),
];
