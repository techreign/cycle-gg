import { useMemo } from 'react'
import type { EnrichedGame, PhaseStats, MppdResult, DayInsight, CyclePhase } from '../types'
import { useCycleData } from './useCycleData'
import { useGameData } from './useGameData'
import {
  enrichGamesWithPhase,
  computePhaseStats,
  computeMppd,
  getBestWorstDays,
} from '../utils/analytics'
import { getPhaseForDate, getCycleDayForDate } from '../utils/cycleEngine'

export function useAnalytics(): {
  enrichedGames: EnrichedGame[]
  phaseStats: PhaseStats[]
  mppd: MppdResult
  bestWorstDays: DayInsight[]
  currentPhase: CyclePhase
  currentCycleDay: number | null
} {
  const { periods } = useCycleData()
  const { games } = useGameData()

  const today = new Date().toISOString().slice(0, 10)

  const enrichedGames = useMemo(
    () => enrichGamesWithPhase(games, periods),
    [games, periods]
  )

  const phaseStats = useMemo(
    () => computePhaseStats(enrichedGames),
    [enrichedGames]
  )

  const mppd = useMemo(
    () => computeMppd(enrichedGames),
    [enrichedGames]
  )

  const bestWorstDays = useMemo(
    () => getBestWorstDays(enrichedGames, periods),
    [enrichedGames, periods]
  )

  const currentPhase = useMemo(
    () => getPhaseForDate(today, periods),
    [today, periods]
  )

  const currentCycleDay = useMemo(
    () => getCycleDayForDate(today, periods),
    [today, periods]
  )

  return {
    enrichedGames,
    phaseStats,
    mppd,
    bestWorstDays,
    currentPhase,
    currentCycleDay,
  }
}
