import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'JanSahay AI',
        short_name: 'JanSahay',
        description: 'Find Government Schemes in Your Language — AI-Powered, Free, Multilingual',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Check Eligibility',
            short_name: 'Eligibility',
            description: 'Find schemes you qualify for',
            url: '/eligibility',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Ask AI',
            short_name: 'Chat',
            description: 'Chat with JanSahay AI',
            url: '/chat',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        // Cache strategy for API responses (network-first, fall back to cache)
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/schemes$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-schemes-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/stats$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-stats-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 6 // 6 hours
              }
            }
          }
        ]
      }
    })
  ],
})
