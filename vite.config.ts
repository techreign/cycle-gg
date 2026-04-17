import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Dev-server proxy injects the server-side Riot API key from .env so we
// mirror what the Vercel Edge Function does in production. The key never
// reaches the browser — it's added to the X-Riot-Token header inside
// the Node proxy layer.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const riotKey = env.RIOT_API_KEY

  const regions = ['americas', 'europe', 'asia', 'sea'] as const
  const proxy: Record<string, ProxyOptions> = Object.fromEntries(
    regions.map((r) => [
      `/api/riot/${r}`,
      {
        target: `https://${r}.api.riotgames.com`,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(new RegExp(`^/api/riot/${r}`), ''),
        configure: (proxyServer) => {
          proxyServer.on('proxyReq', (proxyReq) => {
            if (riotKey) proxyReq.setHeader('X-Riot-Token', riotKey)
          })
        },
      } satisfies ProxyOptions,
    ]),
  )

  return {
    server: { proxy },
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
  }
})
