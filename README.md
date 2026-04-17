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
- **Vercel Edge Function** at `api/riot.ts` — thin proxy that forwards
  requests to the Riot API. The server-held `RIOT_API_KEY` never reaches
  the browser; visitors just type their Riot ID and Cycle.gg fetches
  match history for them (op.gg-style).

## Running locally

```bash
npm install
npm run dev
```

The Vite dev server at `http://localhost:5173` proxies `/api/riot/{routing}`
straight to Riot's regional endpoints and injects `X-Riot-Token` from
`.env`'s `RIOT_API_KEY` — mirroring what the production Vercel Edge
Function does.

## Riot API key (server-side)

Cycle.gg holds a single Riot API key server-side and serves all visitors
from it. The key is **never** bundled into the browser; the client talks
only to our same-origin `/api/riot/*` proxy.

Get a key at <https://developer.riotgames.com>:

- **Development Key** — rotates every 24h. Fine for local testing.
- **Personal API Key** — permanent, ~48h approval. Apply at
  <https://developer.riotgames.com/app-type> → Personal. Required for a
  stable public deployment.

Local dev: drop the key into `.env` as `RIOT_API_KEY=...`, then
`npm run dev`.

Production (Vercel):
```bash
vercel env add RIOT_API_KEY production
# paste the key when prompted, redeploy
vercel deploy --prod
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. In the Vercel dashboard, **Import Project** → pick the repo.
3. Build settings are pre-configured via `vercel.json`:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. The `api/` directory is auto-detected by Vercel as serverless / edge
   functions. `vercel.json` wires the multi-segment rewrite:
   `/api/riot/{routing}/{...}` → `/api/riot?path={...}`.
5. Add your Riot key as a project env var:
   ```bash
   vercel env add RIOT_API_KEY production
   ```
   Without this set, the proxy returns 503 with a "temporarily
   unavailable" message.

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
api/riot.ts                      # Vercel Edge Function (CORS proxy)
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
