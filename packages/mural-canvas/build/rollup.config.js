import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import typescript from 'rollup-plugin-typescript2';
import styles from 'rollup-plugin-styles';
import commonjs from '@rollup/plugin-commonjs';

const truthy = value => {
  ['t', 'true', '1', 'on', 'yes', 'y'].includes(value.toString().toLowerCase());
};

const DEBUG = truthy(process.env.DEBUG || false);

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: path.resolve('./dist/mural-canvas.bundle.js'),
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: path.resolve('./dist/mural-canvas.esm.js'),
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        sourceMap: DEBUG,
        inlineSources: DEBUG,
        tsconfig: path.resolve('./build/tsconfig.json'),
        useTsconfigDeclarationDir: true,
      }),
      peerDepsExternal(),
      styles(),
      image(),
    ],
  },
];
