import type { GameEntry } from '../types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

export interface RiotMatchParticipant {
  puuid: string
  championName: string
  kills: number
  deaths: number
  assists: number
  totalDamageDealtToChampions: number
  win: boolean
  teamPosition: string
}

export interface RiotMatch {
  metadata: { matchId: string }
  info: {
    gameCreation: number
    gameDuration: number
    queueId: number
    participants: RiotMatchParticipant[]
  }
}

// ---------------------------------------------------------------------------
// Region routing
// ---------------------------------------------------------------------------

export const REGIONS = {
  'NA': 'americas',
  'BR': 'americas',
  'LAN': 'americas',
  'LAS': 'americas',
  'OCE': 'sea',
  'PH': 'sea',
  'SG': 'sea',
  'TH': 'sea',
  'TW': 'sea',
  'VN': 'sea',
  'JP': 'asia',
  'KR': 'asia',
  'EUW': 'europe',
  'EUNE': 'europe',
  'TR': 'europe',
  'RU': 'europe',
  'ME': 'europe',
} as const

export type Region = keyof typeof REGIONS
export type RoutingRegion = (typeof REGIONS)[Region]

// ---------------------------------------------------------------------------
// Internal fetch helpers
// ---------------------------------------------------------------------------

function getApiKey(): string {
  const key = import.meta.env.VITE_RIOT_API_KEY
  if (!key) throw new Error('VITE_RIOT_API_KEY not set in .env')
  return key
}

async function riotFetch(url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': getApiKey() },
  })
  if (!res.ok) {
    if (res.status === 429) throw new Error('Rate limited. Please wait a moment and try again.')
    if (res.status === 403) throw new Error('Invalid API key. Check your Riot API key in settings.')
    if (res.status === 404) throw new Error('Account not found. Check your Riot ID and region.')
    throw new Error(`Riot API error: ${res.status}`)
  }
  return res
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/** Look up a Riot account by game name + tag line. */
export async function getAccount(
  gameName: string,
  tagLine: string,
  region: Region,
): Promise<RiotAccount> {
  const routing = REGIONS[region]
  const res = await riotFetch(
    `/api/riot/${routing}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
  )
  return res.json() as Promise<RiotAccount>
}

/** Get match IDs for a given PUUID.  Returns up to `count` (max 100) IDs. */
export async function getMatchIds(
  puuid: string,
  region: Region,
  count = 100,
  startTime?: number,
): Promise<string[]> {
  const routing = REGIONS[region]
  const params = new URLSearchParams({ start: '0', count: String(count) })
  if (startTime !== undefined) params.set('startTime', String(startTime))
  const res = await riotFetch(
    `/api/riot/${routing}/lol/match/v5/matches/by-puuid/${puuid}/ids?${params.toString()}`,
  )
  return res.json() as Promise<string[]>
}

/** Fetch the full detail for a single match. */
export async function getMatchDetail(matchId: string, region: Region): Promise<RiotMatch> {
  const routing = REGIONS[region]
  const res = await riotFetch(`/api/riot/${routing}/lol/match/v5/matches/${matchId}`)
  return res.json() as Promise<RiotMatch>
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

function normalizeRole(teamPosition: string): string {
  const map: Record<string, string> = {
    TOP: 'Top',
    JUNGLE: 'Jungle',
    MIDDLE: 'Mid',
    BOTTOM: 'ADC',
    UTILITY: 'Support',
  }
  return map[teamPosition] ?? teamPosition
}

/**
 * Convert a Riot match response to our internal `GameEntry` format.
 * Returns `null` if the given PUUID did not participate in the match.
 */
export function matchToGameEntry(match: RiotMatch, puuid: string): GameEntry | null {
  const participant = match.info.participants.find((p) => p.puuid === puuid)
  if (!participant) return null

  const dateStr = new Date(match.info.gameCreation).toISOString().slice(0, 10)

  return {
    id: match.metadata.matchId,
    date: dateStr,
    win: participant.win,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    champion: participant.championName,
    role: normalizeRole(participant.teamPosition),
    damageDealt: participant.totalDamageDealtToChampions,
  }
}
