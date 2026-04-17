# Cycle.gg

> Does your period affect your LP?

A free, local-only web app that correlates your menstrual cycle with your
League of Legends performance. Log games + periods → get phase-aware
analytics (MPPD score, champion recommendations, best/worst days to queue,
shareable insight cards).

Live at **https://cycle.gg** (once deployed).

---

## Stack

- **Vite 8 + React 19 + TypeScript** — app shell.
- **Tailwind 4** — styling, warm rose/burgundy design system in `src/index.css`.
- **Recharts** — phase bar charts and KDA trend line.
- **LocalStorage** — all data lives in the user's browser. The app never
  sends a request to Cycle.gg's backend for personal data.
- **Vercel Edge Function** at `api/riot/[...path].ts` — thin proxy that
  forwards requests to the Riot API. It does **not** hold the user's
  key; the browser sends it in an `X-Riot-Token` header and the function
  just relays the request (plus CORS for local dev).

## Running locally

```bash
npm install
npm run dev
```

The Vite dev server at `http://localhost:5173` proxies `/api/riot/{routing}`
straight to Riot's regional endpoints (see `vite.config.ts`), mimicking what
the production Vercel Edge Function does.

## Riot API key (BYO)

Cycle.gg uses a **bring-your-own-key** model. Every user pastes their own
developer key in the in-app Settings page; it lives only in that user's
`localStorage` and is sent directly to the proxy via the `X-Riot-Token`
header. The server never stores or logs it.

Get a free 24-hour dev key at <https://developer.riotgames.com>.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In the Vercel dashboard, **Import Project** → pick the repo.
3. Build settings are pre-configured via `vercel.json`:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. The `api/` directory is automatically picked up by Vercel as serverless
   / edge functions — no extra config needed.
5. (Optional) If you want the deployment to fall back to your own key when
   a visitor hasn't supplied one, set it on the project:
   ```bash
   vercel env add RIOT_API_KEY production
   ```
   Otherwise the proxy returns `401 No Riot API key supplied`.

Or from the repo root:

```bash
vercel deploy --prod
```

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the Vite dev server + API proxy.        |
| `npm run build`   | Typecheck + production build to `dist/`.      |
| `npm run preview` | Serve the production build locally.           |
| `npm run lint`    | Run ESLint (should be 0 errors).              |

## Project layout

```
api/riot/[...path].ts            # Vercel Edge Function (CORS proxy)
public/                          # Static assets (favicon, OG image, sitemap)
src/
  components/
    charts/                      # Recharts wrappers
    dashboard/                   # Insight widgets (MPPD, recs, forecast, etc.)
    layout/                      # Sidebar + bottom nav shell
    ui/                          # Button, StatCard, ErrorBoundary, etc.
  constants/phases.ts            # Phase palette + labels
  context/AppContext.tsx         # Global derived state
  hooks/                         # useApp, useCycleData, useGameData, useRiotData
  pages/                         # Route components
  utils/
    analytics.ts                 # Phase stats, MPPD
    cycleEngine.ts               # Phase math (day → phase)
    cycleGenerator.ts            # Back/forward period generator
    insights.ts                  # Champ recs, streaks, heatmap, forecast
    riotApi.ts                   # Thin Riot client (uses BYO key)
    shareCard.ts                 # Canvas-rendered PNG share card
    storage.ts                   # localStorage wrappers
```

## Not affiliated with Riot Games

Cycle.gg isn't endorsed by Riot Games and doesn't reflect the views or
opinions of Riot Games or anyone officially involved in producing or
managing Riot Games properties. Riot Games, League of Legends, and all
associated properties are trademarks or registered trademarks of Riot
Games, Inc.
