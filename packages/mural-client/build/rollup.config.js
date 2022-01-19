import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: path.resolve('./dist/mural-client.bundle.js'),
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: path.resolve('./dist/mural-client.esm.js'),
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
    ],
  },
];
