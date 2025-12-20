import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import ui from '@nuxt/ui/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    ui(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Plemiona Bot Notifier',
        short_name: 'BotNotifier',
        description: 'Powiadomienia o stanie bota do gry Plemiona',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'firebase-messaging-sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vue core i router
          if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) {
            return 'vue-vendor'
          }
          // Vue Router
          if (id.includes('node_modules/vue-router')) {
            return 'vue-router'
          }
          // Nuxt UI - duża biblioteka komponentów
          if (id.includes('node_modules/@nuxt/ui')) {
            return 'nuxt-ui'
          }
          // Clerk (autentykacja)
          if (id.includes('node_modules/@clerk')) {
            return 'clerk'
          }
          // Firebase
          if (id.includes('node_modules/firebase')) {
            return 'firebase'
          }
          // Pinia (state management)
          if (id.includes('node_modules/pinia')) {
            return 'pinia'
          }
          // Tailwind CSS
          if (id.includes('node_modules/tailwindcss') || id.includes('node_modules/@tailwindcss')) {
            return 'tailwind'
          }
          // Pozostałe node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    // Zwiększ limit ostrzeżenia dla bardzo dużych bibliotek
    chunkSizeWarningLimit: 600
  },
})
