import { createContext, useMemo, type ReactNode } from 'react'
import type {
  PeriodEntry,
  GameEntry,
  EnrichedGame,
  PhaseStats,
  MppdResult,
  DayInsight,
  CyclePhase,
} from '../types'
import type { CycleConfig } from '../utils/storage'
import { useCycleData } from '../hooks/useCycleData'
import { useGameData } from '../hooks/useGameData'
import {
  enrichGamesWithPhase,
  computePhaseStats,
  computeMppd,
  getBestWorstDays,
} from '../utils/analytics'
import { getPhaseForDate, getCycleDayForDate } from '../utils/cycleEngine'

export interface AppContextValue {
  // Cycle data
  periods: PeriodEntry[]
  averageCycleLength: number

  // Cycle config
  cycleConfig: CycleConfig | null
  updateCycleConfig: (config: CycleConfig) => void
  clearCycleConfig: () => void

  // Game data
  games: GameEntry[]
  addGame: (entry: Omit<GameEntry, 'id'>) => GameEntry
  removeGame: (id: string) => void
  setGames: (games: GameEntry[]) => void

  // Analytics (derived)
  enrichedGames: EnrichedGame[]
  phaseStats: PhaseStats[]
  mppd: MppdResult
  bestWorstDays: DayInsight[]
  currentPhase: CyclePhase
  currentCycleDay: number | null
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const cycleData = useCycleData()
  const gameData = useGameData()

  const today = new Date().toISOString().slice(0, 10)

  const enrichedGames = useMemo(
    () => enrichGamesWithPhase(gameData.games, cycleData.periods),
    [gameData.games, cycleData.periods]
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
    () => getBestWorstDays(enrichedGames, cycleData.periods),
    [enrichedGames, cycleData.periods]
  )

  const currentPhase = useMemo(
    () => getPhaseForDate(today, cycleData.periods),
    [today, cycleData.periods]
  )

  const currentCycleDay = useMemo(
    () => getCycleDayForDate(today, cycleData.periods),
    [today, cycleData.periods]
  )

  const value: AppContextValue = {
    periods: cycleData.periods,
    averageCycleLength: cycleData.averageCycleLength,

    cycleConfig: cycleData.config,
    updateCycleConfig: cycleData.updateCycleConfig,
    clearCycleConfig: cycleData.clearConfig,

    games: gameData.games,
    addGame: gameData.addGame,
    removeGame: gameData.removeGame,
    setGames: gameData.setAllGames,

    enrichedGames,
    phaseStats,
    mppd,
    bestWorstDays,
    currentPhase,
    currentCycleDay,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
