import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

/**
 * https://vite.dev/config/
 * @type {import('vite').UserConfig}
 *  */
export default defineConfig({
  plugins: [react()],

  base: '/erase2d',

  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(
      process.env.npm_package_version
    ),
  },
});
