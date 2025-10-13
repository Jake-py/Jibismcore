import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: { 'process.env': {} },
  esbuild: { legalComments: 'none' },
  build: { minify: true }
});
