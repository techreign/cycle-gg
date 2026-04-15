import { useState, useCallback, useEffect } from 'react'
import type { GameEntry } from '../types'
import { getGames, setGames } from '../utils/storage'
import {
  getAccount,
  getMatchIds,
  getMatchDetail,
  matchToGameEntry,
  type Region,
} from '../utils/riotApi'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RiotConfig {
  gameName: string
  tagLine: string
  region: Region
  puuid: string
}

export interface UseRiotDataReturn {
  riotConfig: RiotConfig | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  progress: { current: number; total: number } | null
  connectAccount: (gameName: string, tagLine: string, region: Region) => Promise<void>
  disconnectAccount: () => void
  fetchMatches: (count?: number) => Promise<GameEntry[]>
  lastFetchTime: number | null
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RIOT_CONFIG_KEY = 'cycle_gg_riot_account'
const LAST_FETCH_KEY = 'cycle_gg_riot_last_fetch'

/** Delay between individual match-detail requests (ms). */
const FETCH_DELAY_MS = 100

/** After this many requests, pause to stay under the 100-req/2-min dev limit. */
const BATCH_SIZE = 20

/** Pause duration between batches (ms). */
const BATCH_PAUSE_MS = 2000

// ---------------------------------------------------------------------------
// Helper: sleep
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRiotData(): UseRiotDataReturn {
  const [riotConfig, setRiotConfig] = useState<RiotConfig | null>(() => {
    try {
      const raw = localStorage.getItem(RIOT_CONFIG_KEY)
      return raw ? (JSON.parse(raw) as RiotConfig) : null
    } catch {
      return null
    }
  })

  const [lastFetchTime, setLastFetchTime] = useState<number | null>(() => {
    const raw = localStorage.getItem(LAST_FETCH_KEY)
    return raw ? Number(raw) : null
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)

  // Persist riotConfig whenever it changes
  useEffect(() => {
    if (riotConfig) {
      localStorage.setItem(RIOT_CONFIG_KEY, JSON.stringify(riotConfig))
    }
  }, [riotConfig])

  // ---------------------------------------------------------------------------
  // fetchMatches
  // ---------------------------------------------------------------------------

  const fetchMatches = useCallback(
    async (count = 100): Promise<GameEntry[]> => {
      if (!riotConfig) throw new Error('No Riot account connected.')

      setIsLoading(true)
      setError(null)
      setProgress(null)

      try {
        // Build optional startTime from the last fetch so we only pull new games
        const startTime = lastFetchTime ? Math.floor(lastFetchTime / 1000) : undefined

        const matchIds = await getMatchIds(riotConfig.puuid, riotConfig.region, count, startTime)

        if (matchIds.length === 0) {
          setProgress({ current: 0, total: 0 })
          return []
        }

        setProgress({ current: 0, total: matchIds.length })

        // Load existing games so we can deduplicate
        const existingGames = getGames()
        const existingIds = new Set(existingGames.map((g) => g.id))

        const newEntries: GameEntry[] = []

        for (let i = 0; i < matchIds.length; i++) {
          const matchId = matchIds[i]

          // Skip matches we already have stored
          if (existingIds.has(matchId)) {
            setProgress({ current: i + 1, total: matchIds.length })
            continue
          }

          // Pause between batches to respect rate limits
          if (i > 0 && i % BATCH_SIZE === 0) {
            await sleep(BATCH_PAUSE_MS)
          } else if (i > 0) {
            await sleep(FETCH_DELAY_MS)
          }

          const match = await getMatchDetail(matchId, riotConfig.region)
          const entry = matchToGameEntry(match, riotConfig.puuid)

          if (entry) {
            newEntries.push(entry)
          }

          setProgress({ current: i + 1, total: matchIds.length })
        }

        // Merge new entries with existing, sort descending by date
        const merged = [...existingGames, ...newEntries].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        setGames(merged)

        // Record fetch timestamp
        const now = Date.now()
        localStorage.setItem(LAST_FETCH_KEY, String(now))
        setLastFetchTime(now)

        return newEntries
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error fetching matches.'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [riotConfig, lastFetchTime],
  )

  // ---------------------------------------------------------------------------
  // connectAccount
  // ---------------------------------------------------------------------------

  const connectAccount = useCallback(
    async (gameName: string, tagLine: string, region: Region): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        const account = await getAccount(gameName, tagLine, region)

        const config: RiotConfig = {
          gameName: account.gameName,
          tagLine: account.tagLine,
          region,
          puuid: account.puuid,
        }

        setRiotConfig(config)
        localStorage.setItem(RIOT_CONFIG_KEY, JSON.stringify(config))

        // Eagerly fetch recent matches after connecting. We set loading back to
        // true inside fetchMatches, so we need to let state flush first — the
        // function reads riotConfig from closure so pass config directly via a
        // one-off inline call that mirrors the logic to avoid stale closure.
        const startTime = undefined // first fetch: get all available
        const matchIds = await getMatchIds(config.puuid, config.region, 100, startTime)

        setProgress({ current: 0, total: matchIds.length })

        const existingGames = getGames()
        const existingIds = new Set(existingGames.map((g) => g.id))
        const newEntries: GameEntry[] = []

        for (let i = 0; i < matchIds.length; i++) {
          const matchId = matchIds[i]

          if (existingIds.has(matchId)) {
            setProgress({ current: i + 1, total: matchIds.length })
            continue
          }

          if (i > 0 && i % BATCH_SIZE === 0) {
            await sleep(BATCH_PAUSE_MS)
          } else if (i > 0) {
            await sleep(FETCH_DELAY_MS)
          }

          const match = await getMatchDetail(matchId, config.region)
          const entry = matchToGameEntry(match, config.puuid)
          if (entry) newEntries.push(entry)

          setProgress({ current: i + 1, total: matchIds.length })
        }

        const merged = [...existingGames, ...newEntries].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        setGames(merged)

        const now = Date.now()
        localStorage.setItem(LAST_FETCH_KEY, String(now))
        setLastFetchTime(now)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error connecting account.'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
        setProgress(null)
      }
    },
    [],
  )

  // ---------------------------------------------------------------------------
  // disconnectAccount
  // ---------------------------------------------------------------------------

  const disconnectAccount = useCallback((): void => {
    localStorage.removeItem(RIOT_CONFIG_KEY)
    localStorage.removeItem(LAST_FETCH_KEY)
    setRiotConfig(null)
    setLastFetchTime(null)
    setError(null)
    setProgress(null)
  }, [])

  return {
    riotConfig,
    isConnected: riotConfig !== null,
    isLoading,
    error,
    progress,
    connectAccount,
    disconnectAccount,
    fetchMatches,
    lastFetchTime,
  }
}
