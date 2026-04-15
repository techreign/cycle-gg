export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown'

export interface PeriodEntry {
  id: string
  startDate: string   // YYYY-MM-DD
  endDate: string | null
}

export interface GameEntry {
  id: string
  date: string        // YYYY-MM-DD
  win: boolean
  kills: number
  deaths: number
  assists: number
  champion: string
  role: string
  damageDealt: number
  notes?: string
}

export interface EnrichedGame extends GameEntry {
  phase: CyclePhase
}

export interface PhaseStats {
  phase: CyclePhase
  games: number
  wins: number
  winRate: number       // 0-100
  avgKDA: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  avgDamage: number
  aggressionScore: number  // 0-10
}

export interface MppdResult {
  score: number
  direction: 'better' | 'worse' | 'neutral'
  onPeriodWinRate: number
  offPeriodWinRate: number
  gamesOnPeriod: number
  gamesOffPeriod: number
}

export interface DayInsight {
  cycleDay: number
  phase: CyclePhase
  avgWinRate: number
  sampleSize: number
  label: 'best' | 'worst' | 'normal'
}
