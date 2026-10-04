import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // readable, stable class names (identical in the client and SSR builds)
      generateScopedName: 'wu-[local]-[hash:base64:5]',
    },
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
});
