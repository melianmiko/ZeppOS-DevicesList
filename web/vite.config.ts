import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    fs: {
      // zepp_devices.json lives in the repository root and is imported at build time.
      allow: [repositoryRoot],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          mantine: ['@mantine/core', '@mantine/hooks'],
          i18n: [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
          ],
        },
      },
    },
  },
});
