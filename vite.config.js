import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/portfolio/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});