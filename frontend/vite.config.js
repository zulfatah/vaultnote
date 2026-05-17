import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'VaultNote',
        short_name: 'VaultNote',
        description: 'Secure encrypted text vault',
        theme_color: '#0a0a0a',
        background_color: '#f5f0e8',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/favicon.svg', sizes: '64x64', type: 'image/svg+xml' }]
      }
    })
  ],
  server: {
    port: 3000
  }
});
