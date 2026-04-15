import type { PeriodEntry, GameEntry } from '../types'

const PERIODS_KEY = 'cycle_gg_periods'
const GAMES_KEY = 'cycle_gg_games'

// --- Periods ---

export function getPeriods(): PeriodEntry[] {
  try {
    const raw = localStorage.getItem(PERIODS_KEY)
    return raw ? (JSON.parse(raw) as PeriodEntry[]) : []
  } catch {
    return []
  }
}

export function setPeriods(periods: PeriodEntry[]): void {
  localStorage.setItem(PERIODS_KEY, JSON.stringify(periods))
}

export function addPeriod(entry: Omit<PeriodEntry, 'id'>): PeriodEntry {
  const newEntry: PeriodEntry = { ...entry, id: crypto.randomUUID() }
  const periods = getPeriods()
  setPeriods([...periods, newEntry])
  return newEntry
}

export function removePeriod(id: string): void {
  const periods = getPeriods().filter(p => p.id !== id)
  setPeriods(periods)
}

export function updatePeriod(id: string, updates: Partial<Omit<PeriodEntry, 'id'>>): void {
  const periods = getPeriods().map(p =>
    p.id === id ? { ...p, ...updates } : p
  )
  setPeriods(periods)
}

// --- Games ---

export function getGames(): GameEntry[] {
  try {
    const raw = localStorage.getItem(GAMES_KEY)
    return raw ? (JSON.parse(raw) as GameEntry[]) : []
  } catch {
    return []
  }
}

export function setGames(games: GameEntry[]): void {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games))
}

export function addGame(entry: Omit<GameEntry, 'id'>): GameEntry {
  const newEntry: GameEntry = { ...entry, id: crypto.randomUUID() }
  const games = getGames()
  setGames([...games, newEntry])
  return newEntry
}

export function removeGame(id: string): void {
  const games = getGames().filter(g => g.id !== id)
  setGames(games)
}
