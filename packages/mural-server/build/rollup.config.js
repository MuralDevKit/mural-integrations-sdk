import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";
import copy from 'rollup-plugin-copy'

export default [
  {
    input: 'src/server.ts',
    output: [
      {
        file: path.resolve('./dist/mural-server.bundle.js'),
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: path.resolve('./dist/mural-server.esm.js'),
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      json(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: path.resolve('./build/tsconfig.json'),
        useTsconfigDeclarationDir: true,
      }),
      peerDepsExternal(),
      copy({
        targets: [
          { src: 'src/public/authHandler.html', dest: 'dist/public' },
        ]
      })
    ],
  },
];
