import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';

/**
 * https://rollupjs.org/guide/en/#configuration-files
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: 'index.ts',
    output: {
      dir: 'dist',
      format: 'es',
      preserveModules: true,
      entryFileNames: '[name].js',
      sourcemap: true,
      // plugins: [terser()],
    },
    plugins: [
      del({
        targets: ['dist/*'],
      }),

      // resolve and build `@erase2d/core`
      nodeResolve(),

      ts({
        noForceEmit: true,
        tsconfig: 'tsconfig.json',
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
