import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';
import path from 'path';
import { imagetools } from 'rollup-plugin-imagetools';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import styles from 'rollup-plugin-styles';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: path.resolve('./dist/mural-account-chooser.bundle.js'),
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: path.resolve('./dist/mural-account-chooser.esm.js'),
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: path.resolve('./build/tsconfig.json'),
        useTsconfigDeclarationDir: true,
      }),
      peerDepsExternal(),
      styles(),
      image(),
      imagetools(),
    ],
  },
];
