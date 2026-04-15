import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api/riot/americas': {
        target: 'https://americas.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/riot\/americas/, ''),
      },
      '/api/riot/europe': {
        target: 'https://europe.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/riot\/europe/, ''),
      },
      '/api/riot/asia': {
        target: 'https://asia.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/riot\/asia/, ''),
      },
      '/api/riot/sea': {
        target: 'https://sea.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/riot\/sea/, ''),
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Cycle.gg',
        short_name: 'Cycle.gg',
        description: 'Period cycle + gaming performance tracker',
        theme_color: '#ec4899',
        background_color: '#0d0a14',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
