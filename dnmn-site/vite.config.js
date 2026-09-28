import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project sites are served from /<repo-name>/, not /.
// Set VITE_BASE to that when building for Pages, e.g. in your workflow:
//   run: npm run build
//   env: { VITE_BASE: '/${{ github.event.repository.name }}/' }
// Locally / on Vercel / Netlify / a custom domain, leave it unset (defaults to '/').
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
});
