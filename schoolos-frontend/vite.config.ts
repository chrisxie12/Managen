/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from "@sentry/vite-plugin"
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/*.svg'],
    manifest: {
      name: 'Managen',
      short_name: 'Managen',
      description: 'School management platform for Ghanaian schools',
      start_url: '/dashboard',
      display: 'standalone',
      background_color: '#F8F9FA',
      theme_color: '#0A2472',
      orientation: 'portrait-primary',
      icons: [
        { src: '/icons/icon-192.svg', sizes: 'any', type: 'image/svg+xml' },
        { src: '/icons/icon-512.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable any' }
      ],
      categories: ['education', 'business'],
      lang: 'en-GH',
      scope: '/',
    },
    workbox: {
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^\/api\/school\/(students|attendance|fees|dashboard|finance|terms)/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            networkTimeoutSeconds: 5,
          },
        },
        {
          urlPattern: /^\/api\/school\/(search|storage|upload)/i,
          handler: 'NetworkOnly',
          options: { cacheName: 'api-mutation' },
        },
      ],
    },
  }),
  process?.env?.VITE_SENTRY_DSN ? sentryVitePlugin({
    org: process?.env?.SENTRY_ORG || 'schoolos',
    project: process?.env?.SENTRY_PROJECT || 'frontend',
    authToken: process?.env?.SENTRY_AUTH_TOKEN,
    telemetry: false,
  }) : null,].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process?.env?.VITE_SENTRY_DSN ? 'hidden' : false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts'
  }
})
