import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        display: 'standalone',
        theme_color: '#ffffff', // Using standard white, will be overridden by media query if needed
        background_color: '#ffffff',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        // viewport-fit=cover is handled in the meta tag in Index.html, but display: standalone is here.
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      input: 'Index.html'
    }
  }
});
