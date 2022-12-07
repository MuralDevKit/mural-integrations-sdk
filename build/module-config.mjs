import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import { imagetools } from 'rollup-plugin-imagetools';
import typescript from 'rollup-plugin-typescript2';
import styles from 'rollup-plugin-styles';
import commonjs from '@rollup/plugin-commonjs';
import { visualizer } from 'rollup-plugin-visualizer';
import svgr from '@svgr/rollup';

const truthy = value => {
  return ['t', 'true', '1', 'on', 'yes', 'y'].includes(
    value.toString().toLowerCase(),
  );
};

export const DEBUG = truthy(process.env.DEBUG || false);
export const BUNDLE_STATS = truthy(process.env.BUNDLE_STATS || false);

const __dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * @param descriptor {
 *   name: string;
 *   overrides: {};
 * }
 */
export const moduleConfig = descriptor => {
  const bundleName = {
    commonjs: `${descriptor.name}.bundle.js`,
    esm: `${descriptor.name}.esm.js`,
  };

  const entrypoint = descriptor.entrypoint || 'src/index.ts';
  const packageDir =
    descriptor.packageDir ||
    path.resolve(__dirname, '../packages', descriptor.name);

  const plugins = [
    peerDepsExternal({
      packageJsonPath: path.resolve(packageDir, 'package.json'),
    }),
    resolve(),
    commonjs(),
    typescript({
      sourceMap: DEBUG,
      inlineSources: DEBUG,
      tsconfig: path.resolve(packageDir, 'build/tsconfig.json'),
      useTsconfigDeclarationDir: true,
    }),
    styles(),
    svgr({ exportType: 'named' }),
    image({ include: ['*.png', '*.jpg'] }),
    imagetools(),
  ];

  if (BUNDLE_STATS) {
    plugins.push(
      visualizer({
        filename: path.resolve(packageDir, 'dist', 'stats.html'),
      }),
    );
  }

  return {
    /** Used to de-dupplicate the module from the graph */
    _name: descriptor.name,
    input: path.resolve(packageDir, entrypoint),
    output: [
      {
        file: path.resolve(packageDir, 'dist', bundleName.commonjs),
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: path.resolve(packageDir, 'dist', bundleName.esm),
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins,
  };
};
