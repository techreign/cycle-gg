/**
 * Vercel Edge Function — proxies Riot API requests from the browser.
 *
 * The key is held server-side only (RIOT_API_KEY env var) and is never
 * exposed to the client. Visitors just hit /api/riot/{routing}/... and
 * we forward to the correct regional Riot endpoint.
 *
 * `vercel.json` rewrites /api/riot/{...}/ → /api/riot?path={...} so we
 * can use a single function with a multi-segment capture.
 */

export const config = { runtime: 'edge' }

const ALLOWED_ROUTINGS = new Set(['americas', 'europe', 'asia', 'sea'])

const BASE_BY_ROUTING: Record<string, string> = {
  americas: 'https://americas.api.riotgames.com',
  europe: 'https://europe.api.riotgames.com',
  asia: 'https://asia.api.riotgames.com',
  sea: 'https://sea.api.riotgames.com',
}

declare const process: { env: Record<string, string | undefined> }

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const corsHeaders = buildCorsHeaders(request)

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (request.method !== 'GET') {
    return jsonError(405, 'Only GET is supported.', corsHeaders)
  }

  const token = process.env.RIOT_API_KEY
  if (!token) {
    return jsonError(
      503,
      'Riot data is temporarily unavailable. The server key needs to be refreshed — hang tight.',
      corsHeaders,
    )
  }

  // The rewrite sends us the captured path as ?path=…, but also keep a
  // fallback that parses the URL directly for sanity.
  let rawPath = url.searchParams.get('path') ?? ''
  if (!rawPath) {
    rawPath = url.pathname.replace(/^\/api\/riot\/?/, '')
  }
  const parts = rawPath.split('/').filter(Boolean)
  if (parts.length < 2) {
    return jsonError(400, 'Bad request: routing and endpoint required.', corsHeaders)
  }

  const routing = parts[0]
  if (!ALLOWED_ROUTINGS.has(routing)) {
    return jsonError(400, `Unknown routing "${routing}".`, corsHeaders)
  }

  const riotPath = parts.slice(1).join('/')

  // Forward all original query params except our internal `path` marker.
  const forwardedParams = new URLSearchParams(url.searchParams)
  forwardedParams.delete('path')
  const search = forwardedParams.toString() ? `?${forwardedParams.toString()}` : ''

  const riotUrl = `${BASE_BY_ROUTING[routing]}/${riotPath}${search}`

  const riotResponse = await fetch(riotUrl, {
    headers: { 'X-Riot-Token': token },
  })

  // A 401/403 from Riot almost always means the server key rotated or
  // was revoked. Surface that as a clear signal to the client so they
  // can display a "come back soon" message rather than a scary error.
  if (riotResponse.status === 401 || riotResponse.status === 403) {
    return jsonError(
      503,
      'Riot data is temporarily unavailable — the server key expired. Come back shortly.',
      corsHeaders,
    )
  }

  const headers = new Headers()
  headers.set('Content-Type', riotResponse.headers.get('Content-Type') ?? 'application/json')
  const retryAfter = riotResponse.headers.get('Retry-After')
  if (retryAfter) headers.set('Retry-After', retryAfter)
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v)

  return new Response(riotResponse.body, {
    status: riotResponse.status,
    headers,
  })
}

function buildCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? ''
  const allowDevOrigin =
    origin === 'http://localhost:5173' || origin === 'http://localhost:5174'
      ? origin
      : ''

  return {
    'Access-Control-Allow-Origin': allowDevOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function jsonError(status: number, message: string, cors: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}
