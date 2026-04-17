/**
 * Vercel Edge Function — proxies Riot API requests from the browser.
 *
 * Path shape: /api/riot/{routing}/<...riot-path>
 *   routing ∈ {americas, europe, asia, sea}
 *
 * The `vercel.json` rewrite strips the `/api/riot/` prefix and hands us
 * the remainder as a `path` query param. The client sends its own
 * developer key via the `X-Riot-Token` header; we forward to the
 * correct regional base URL and relay the response.
 *
 * Set `RIOT_API_KEY` as a Vercel environment variable to provide a
 * fallback key (optional — the canonical model is BYO-key).
 */

export const config = { runtime: 'edge' }

const ALLOWED_ROUTINGS = new Set(['americas', 'europe', 'asia', 'sea'])

const BASE_BY_ROUTING: Record<string, string> = {
  americas: 'https://americas.api.riotgames.com',
  europe: 'https://europe.api.riotgames.com',
  asia: 'https://asia.api.riotgames.com',
  sea: 'https://sea.api.riotgames.com',
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const corsHeaders = buildCorsHeaders(request)

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (request.method !== 'GET') {
    return jsonError(405, 'Only GET is supported.', corsHeaders)
  }

  // The rewrite sends us the captured path (everything after /api/riot/)
  // via the `path` query parameter. Fall back to parsing the URL path
  // directly so the function also works when hit without the rewrite.
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

  // Forward all original query params except `path` (our internal marker).
  const forwardedParams = new URLSearchParams(url.searchParams)
  forwardedParams.delete('path')
  const search = forwardedParams.toString() ? `?${forwardedParams.toString()}` : ''

  const riotUrl = `${BASE_BY_ROUTING[routing]}/${riotPath}${search}`

  const token =
    request.headers.get('X-Riot-Token') ??
    (globalThis as unknown as { process?: { env: Record<string, string | undefined> } }).process?.env?.RIOT_API_KEY
  if (!token) {
    return jsonError(
      401,
      'No Riot API key supplied. Add your developer key in Settings.',
      corsHeaders,
    )
  }

  const riotResponse = await fetch(riotUrl, {
    headers: { 'X-Riot-Token': token },
  })

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
    'Access-Control-Allow-Headers': 'X-Riot-Token, Content-Type',
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
