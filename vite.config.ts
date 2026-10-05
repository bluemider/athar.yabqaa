// Ensure global.__dirname injected by loaders does not break ESM plugins like vite-plugin-pwa
if (typeof (globalThis as any).__dirname !== 'undefined' && (globalThis as any).__dirname === '.') {
  delete (globalThis as any).__dirname;
}
if (typeof (global as any).__dirname !== 'undefined' && (global as any).__dirname === '.') {
  delete (global as any).__dirname;
}

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon-32x32.png',
          'favicon-16x16.png',
          'apple-touch-icon.png',
          'app-icon.png',
        ],
        manifest: {
          id: '/',
          name: 'سيرة وأثر الشيخ د. كاظم ياسين الحريب',
          short_name: 'الشيخ كاظم',
          description: 'المنصة الرسمية للسيرة والتوثيق والأرشيف الرقمي لسماحة الشيخ الدكتور كاظم ياسين الحريب',
          theme_color: '#0F382C',
          background_color: '#0F382C',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
