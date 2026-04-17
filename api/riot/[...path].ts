/**
 * Vercel Edge Function — proxies Riot API requests from the browser.
 *
 * Path shape: /api/riot/{routing}/<riot-endpoint>
 *   routing ∈ {americas, europe, asia, sea}
 *
 * The client sends its own developer key via the `X-Riot-Token` header; we
 * just forward to the correct regional base URL and relay the response.
 * Add a fallback key by setting the RIOT_API_KEY env var on the Vercel
 * project (optional — the canonical model is BYO-key).
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

  // URL shape: /api/riot/<routing>/<...rest>
  const parts = url.pathname.replace(/^\/api\/riot\//, '').split('/').filter(Boolean)
  if (parts.length < 2) {
    return jsonError(400, 'Bad request: routing and endpoint required.', corsHeaders)
  }

  const routing = parts[0]
  if (!ALLOWED_ROUTINGS.has(routing)) {
    return jsonError(400, `Unknown routing "${routing}".`, corsHeaders)
  }

  const riotPath = parts.slice(1).join('/')
  const riotUrl = `${BASE_BY_ROUTING[routing]}/${riotPath}${url.search}`

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
  // Same-origin is the default in prod (Vercel serves both static + API
  // from the same domain). Allow localhost for dev convenience.
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
