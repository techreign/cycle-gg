# Cycle.gg — ACTIVE

**Last updated:** 2026-04-17

## Goal

Ship cycle.gg to production as a free, local-only cycle × League of Legends
analytics app. Deployment target: Vercel.

## Current status

Production-ready v1.0. All critical issues from the pre-ship audit are
resolved:

- ✅ **Visual unification** — warm rose/burgundy palette applied across
  every page, tokens live in `src/index.css`.
- ✅ **Dashboard depth** — champion recommendations, win-streak card,
  7-day phase forecast, day-of-week heatmap all wired up.
- ✅ **Predicted cycle overlay** — next 3 cycles rendered on the Log Period
  calendar with dashed rose outlines.
- ✅ **Shareable insight card** — canvas-rendered 1080×1080 PNG with
  MPPD, phase bars, best phase, top champion. Download + clipboard copy.
- ✅ **Security fix** — Riot API key held server-side only (Vercel env
  var `RIOT_API_KEY`), proxied through the Edge Function at
  `api/riot.ts`. Visitors just type their Riot ID — op.gg-style — no
  client-side key UI.
- ✅ **Lint** clean, **typecheck** clean, **build** clean.
- ✅ **SEO/PWA** — OG + Twitter meta, warm theme color, rose favicon,
  sitemap, robots.txt, `_redirects` for SPA.
- ✅ **Error boundary** — wraps the whole app with a friendly recovery UI.

## Deploy steps

1. Commit all changes (repo is clean as of 2026-04-17).
2. Push to GitHub (`techreign/cycle-gg`) via the existing gh CLI.
3. `vercel deploy --prod` — reads `vercel.json`, publishes to
   `cycle-gg-<hash>.vercel.app`.
4. In the Vercel dashboard, add the `cycle.gg` custom domain and point
   DNS at Vercel (A record 76.76.21.21 or CNAME to cname.vercel-dns.com).
5. Test: visit `/settings`, paste a Riot dev key, go to `/setup` and
   connect an account — match history should come through the Edge
   Function.

## Known limitations

- Recharts pulls the JS bundle to ~700 kB; lazy-loading chart components
  is filed as task #8 but was skipped for v1.
- Day-of-week heatmap only uses date, not hour (Riot's `gameCreation` is
  available but we ingest only the date — easy follow-up).
- Phase colors are encoded as a single CSS-friendly palette, no
  light-mode fallback; the app ships dark-only by design.

## Next steps (not blocking)

- Lazy-load chart components (task #8) to slim the initial bundle.
- Expand the BestWorstDays component to include phase-aware confidence
  intervals instead of raw WR.
- Optional queue-time heatmap using `gameCreation` timestamps if the
  user has Riot data.
