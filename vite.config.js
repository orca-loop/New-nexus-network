import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/New-nexus-network/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
});
