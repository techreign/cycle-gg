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
        name: 'Cycle.gg — cycle × league',
        short_name: 'Cycle.gg',
        description: 'Correlate your cycle with your League of Legends performance.',
        theme_color: '#e11d48',
        background_color: '#110a0a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
