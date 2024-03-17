import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import ts from '@rollup/plugin-typescript';
import path from 'node:path';
import del from 'rollup-plugin-delete';

const fabric = path.join('./packages', 'fabric');

/**
 * https://rollupjs.org/guide/en/#configuration-files
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: path.join(fabric, 'index.ts'),
    output: {
      dir: path.join(fabric, 'dist'),
      format: 'es',
      preserveModules: true,
      entryFileNames: '[name].js',
      sourcemap: true,
      plugins: [terser()],
    },
    plugins: [
      del({
        targets: [path.join(fabric, 'dist/*')],
      }),
      ts({
        noForceEmit: true,
        tsconfig: path.join(fabric, 'tsconfig.json'),
        exclude: ['**/dist', '**/**.spec.ts', '**/**.test.ts'],
      }),
      babel({
        extensions: ['.ts', '.js'],
        babelHelpers: 'bundled',
        presets: [['@babel/env'], ['@babel/typescript']],
      }),
    ],
    external: ['fabric'],
  },
];
