import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
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
      plugins: [terser()],
    },
    plugins: [
      del({
        targets: ['dist/*'],
      }),
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
  },
];
