import { moduleConfig } from '../../../build/module-config.mjs';
import copy from 'rollup-plugin-copy';

const config = moduleConfig({
  name: 'mural-common',
});

const copyPlugin = copy({
  targets: [
    { src: 'src/assets/**/*', dest: 'dist/assets' },
    { src: 'src/fonts/**/*', dest: 'dist/fonts' },
    { src: 'src/styles/**/*', dest: 'dist/styles' },
  ],
});

config.plugins.push(copyPlugin);

export default [config];
