import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import ts from '@rollup/plugin-typescript';

// https://rollupjs.org/guide/en/#configuration-files
/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: './src/fabric/index.ts',
    output: {
      dir: './dist',
      format: 'es',
      preserveModules: true,
      entryFileNames: '[name].js',
      sourcemap: true,
      plugins: [terser()],
    },
    plugins: [
      ts({
        noForceEmit: true,
        tsconfig: './tsconfig.json',
        exclude: ['dist', '**/**.spec.ts', '**/**.test.ts'],
      }),
      babel({
        extensions: ['.ts', '.js'],
        babelHelpers: 'bundled',
      }),
    ],
    external: ['fabric'],
  },
];
