import { defineConfig } from 'vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import SvgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [vueJsx(), SvgLoader()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
