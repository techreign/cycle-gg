import type { CyclePhase, EnrichedGame, PeriodEntry } from '../types'
import { getPhaseForDate } from './cycleEngine'

// ─── Champion recommendations ─────────────────────────────────────────────

export interface ChampionRec {
  champion: string
  games: number
  wins: number
  winRate: number
  phase: CyclePhase
  /** Confidence 0–1 based on sample size and signal strength. */
  confidence: number
}

export interface PhaseRecommendations {
  phase: CyclePhase
  play: ChampionRec[]   // top 3 champions for this phase (WR ≥ 55%, ≥2 games)
  avoid: ChampionRec[]  // bottom champions for this phase (WR ≤ 40%, ≥2 games)
  totalGamesInPhase: number
}

/**
 * Compute play/avoid champion recommendations for a given phase.
 * Requires a champion to have at least 2 games in the phase.
 */
export function getPhaseRecommendations(
  games: EnrichedGame[],
  phase: CyclePhase
): PhaseRecommendations {
  const phaseGames = games.filter(g => g.phase === phase)

  const championMap = new Map<string, { games: number; wins: number }>()
  for (const g of phaseGames) {
    const existing = championMap.get(g.champion) ?? { games: 0, wins: 0 }
    existing.games += 1
    existing.wins += g.win ? 1 : 0
    championMap.set(g.champion, existing)
  }

  const allRecs: ChampionRec[] = Array.from(championMap.entries())
    .filter(([, d]) => d.games >= 2)
    .map(([champion, d]) => {
      const winRate = (d.wins / d.games) * 100
      // Confidence grows with sample size, capped at 1 once we hit 6+ games.
      // Also factors in how far from 50%.
      const sampleFactor = Math.min(d.games / 6, 1)
      const signalFactor = Math.abs(winRate - 50) / 50
      const confidence = Math.min(sampleFactor * 0.7 + signalFactor * 0.3, 1)
      return {
        champion,
        games: d.games,
        wins: d.wins,
        winRate,
        phase,
        confidence,
      }
    })

  const play = allRecs
    .filter(r => r.winRate >= 55)
    .sort((a, b) => b.confidence - a.confidence || b.winRate - a.winRate)
    .slice(0, 3)

  const avoid = allRecs
    .filter(r => r.winRate <= 40)
    .sort((a, b) => b.confidence - a.confidence || a.winRate - b.winRate)
    .slice(0, 3)

  return {
    phase,
    play,
    avoid,
    totalGamesInPhase: phaseGames.length,
  }
}

// ─── Streaks ──────────────────────────────────────────────────────────────

export interface StreakInfo {
  /** Positive = win streak, negative = loss streak, 0 = no games. */
  length: number
  kind: 'win' | 'loss' | 'none'
  currentPhase: CyclePhase
  /** The most recent game's date. */
  since: string | null
}

/**
 * Compute the current win/loss streak from the most-recent game backwards.
 * Games are sorted by date descending; streak ends when the outcome flips.
 */
export function computeCurrentStreak(games: EnrichedGame[]): StreakInfo {
  if (games.length === 0) {
    return { length: 0, kind: 'none', currentPhase: 'unknown', since: null }
  }

  const sorted = [...games].sort((a, b) => b.date.localeCompare(a.date))
  const first = sorted[0]
  const kind: 'win' | 'loss' = first.win ? 'win' : 'loss'

  let length = 0
  for (const g of sorted) {
    if (g.win === first.win) length += 1
    else break
  }

  const oldestInStreak = sorted[length - 1] ?? first
  return {
    length,
    kind,
    currentPhase: first.phase,
    since: oldestInStreak.date,
  }
}

// ─── Day-of-week performance ──────────────────────────────────────────────

export interface DayOfWeekCell {
  dow: number          // 0 = Sunday ... 6 = Saturday
  label: string
  games: number
  wins: number
  winRate: number
  /** Derived display value: 0 when no games, otherwise winRate. */
  sampleSize: number
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Returns win rate per day of the week (Sun..Sat).
 */
export function computeDayOfWeekPerformance(games: EnrichedGame[]): DayOfWeekCell[] {
  const buckets: { games: number; wins: number }[] = Array.from({ length: 7 }, () => ({ games: 0, wins: 0 }))

  for (const g of games) {
    // Parse as local-date at noon to avoid TZ rollover
    const [y, m, d] = g.date.split('-').map(Number)
    const dow = new Date(y, m - 1, d, 12, 0, 0).getDay()
    buckets[dow].games += 1
    if (g.win) buckets[dow].wins += 1
  }

  return buckets.map((b, dow) => ({
    dow,
    label: DOW_LABELS[dow],
    games: b.games,
    wins: b.wins,
    winRate: b.games > 0 ? (b.wins / b.games) * 100 : 0,
    sampleSize: b.games,
  }))
}

// ─── 7-day forecast ───────────────────────────────────────────────────────

export interface ForecastDay {
  date: string           // YYYY-MM-DD
  label: string          // Mon / Tue
  dayNum: number         // day of month
  phase: CyclePhase
  cycleDay: number | null
  isToday: boolean
  /** Days until this date from today; 0 = today. */
  offset: number
}

function toYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Returns a 7-day forecast starting today, annotated with phase.
 */
export function getPhaseForecast(
  periods: PeriodEntry[],
  days: number = 7
): ForecastDay[] {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const todayStr = toYMD(today)
  const result: ForecastDay[] = []

  for (let i = 0; i < days; i++) {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
    const dateStr = toYMD(d)
    const phase = getPhaseForDate(dateStr, periods)

    // Derive cycle day by looking at most recent period start
    const sorted = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate))
    const recent = sorted.find(p => p.startDate <= dateStr)
    let cycleDay: number | null = null
    if (recent) {
      const [ry, rm, rd] = recent.startDate.split('-').map(Number)
      const start = new Date(ry, rm - 1, rd, 12, 0, 0)
      cycleDay = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    }

    result.push({
      date: dateStr,
      label: DOW_LABELS[d.getDay()],
      dayNum: d.getDate(),
      phase,
      cycleDay,
      isToday: dateStr === todayStr,
      offset: i,
    })
  }

  return result
}
