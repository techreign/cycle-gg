import type {
  GameEntry,
  EnrichedGame,
  PhaseStats,
  MppdResult,
  DayInsight,
  CyclePhase,
  PeriodEntry,
} from '../types'
import { getPhaseForDate, getCycleDayForDate } from './cycleEngine'

export function enrichGamesWithPhase(
  games: GameEntry[],
  periods: PeriodEntry[]
): EnrichedGame[] {
  return games.map(game => ({
    ...game,
    phase: getPhaseForDate(game.date, periods),
  }))
}

/**
 * Clamp a number between min and max (inclusive).
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Aggression score formula:
 * ((damage / avgDamage) * 5) + (deaths * 0.5), clamped 0–10
 * If avgDamage is 0, damage component is treated as 5 (neutral).
 */
export function computeAggressionScore(
  damage: number,
  deaths: number,
  avgDamage: number
): number {
  const damageComponent = avgDamage > 0 ? (damage / avgDamage) * 5 : 5
  const raw = damageComponent + deaths * 0.5
  return clamp(raw, 0, 10)
}

export function computePhaseStats(games: EnrichedGame[]): PhaseStats[] {
  const phases: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal', 'unknown']

  const avgDamage =
    games.length > 0
      ? games.reduce((sum, g) => sum + g.damageDealt, 0) / games.length
      : 0

  return phases.map(phase => {
    const subset = games.filter(g => g.phase === phase)
    const count = subset.length

    if (count === 0) {
      return {
        phase,
        games: 0,
        wins: 0,
        winRate: 0,
        avgKDA: 0,
        avgKills: 0,
        avgDeaths: 0,
        avgAssists: 0,
        avgDamage: 0,
        aggressionScore: 0,
      }
    }

    const wins = subset.filter(g => g.win).length
    const totalKills = subset.reduce((s, g) => s + g.kills, 0)
    const totalDeaths = subset.reduce((s, g) => s + g.deaths, 0)
    const totalAssists = subset.reduce((s, g) => s + g.assists, 0)
    const totalDamage = subset.reduce((s, g) => s + g.damageDealt, 0)

    const avgKills = totalKills / count
    const avgDeaths = totalDeaths / count
    const avgAssists = totalAssists / count
    const phaseAvgDamage = totalDamage / count

    // KDA: (kills + assists) / max(deaths, 1)
    const avgKDA = (avgKills + avgAssists) / Math.max(avgDeaths, 1)

    const aggressionScore = computeAggressionScore(phaseAvgDamage, avgDeaths, avgDamage)

    return {
      phase,
      games: count,
      wins,
      winRate: (wins / count) * 100,
      avgKDA,
      avgKills,
      avgDeaths,
      avgAssists,
      avgDamage: phaseAvgDamage,
      aggressionScore,
    }
  })
}

/**
 * Menstrual Phase Performance Differential (MPPD).
 * Compares win rate on period (menstrual phase) vs off period (all other phases).
 */
export function computeMppd(games: EnrichedGame[]): MppdResult {
  const onPeriod = games.filter(g => g.phase === 'menstrual')
  const offPeriod = games.filter(g => g.phase !== 'menstrual' && g.phase !== 'unknown')

  const onPeriodWinRate =
    onPeriod.length > 0
      ? (onPeriod.filter(g => g.win).length / onPeriod.length) * 100
      : 0

  const offPeriodWinRate =
    offPeriod.length > 0
      ? (offPeriod.filter(g => g.win).length / offPeriod.length) * 100
      : 0

  const score = onPeriodWinRate - offPeriodWinRate

  let direction: MppdResult['direction']
  if (Math.abs(score) < 5) {
    direction = 'neutral'
  } else if (score > 0) {
    direction = 'better'
  } else {
    direction = 'worse'
  }

  return {
    score,
    direction,
    onPeriodWinRate,
    offPeriodWinRate,
    gamesOnPeriod: onPeriod.length,
    gamesOffPeriod: offPeriod.length,
  }
}

/**
 * Aggregate win rates by cycle day and label the best and worst days.
 */
export function getBestWorstDays(
  games: EnrichedGame[],
  periods: PeriodEntry[]
): DayInsight[] {
  // Group games by cycle day
  const dayMap = new Map<number, { wins: number; total: number; phase: CyclePhase }>()

  for (const game of games) {
    const cycleDay = getCycleDayForDate(game.date, periods)
    if (cycleDay === null || cycleDay < 1 || cycleDay > 35) continue

    const existing = dayMap.get(cycleDay)
    if (existing) {
      existing.wins += game.win ? 1 : 0
      existing.total += 1
    } else {
      dayMap.set(cycleDay, {
        wins: game.win ? 1 : 0,
        total: 1,
        phase: game.phase,
      })
    }
  }

  if (dayMap.size === 0) return []

  const insights: DayInsight[] = Array.from(dayMap.entries()).map(([cycleDay, data]) => ({
    cycleDay,
    phase: data.phase,
    avgWinRate: (data.wins / data.total) * 100,
    sampleSize: data.total,
    label: 'normal' as const,
  }))

  // Label best and worst (only among days with at least 2 games)
  const qualified = insights.filter(d => d.sampleSize >= 2)
  if (qualified.length > 0) {
    const maxWinRate = Math.max(...qualified.map(d => d.avgWinRate))
    const minWinRate = Math.min(...qualified.map(d => d.avgWinRate))

    for (const insight of insights) {
      if (insight.sampleSize >= 2) {
        if (insight.avgWinRate === maxWinRate) insight.label = 'best'
        else if (insight.avgWinRate === minWinRate) insight.label = 'worst'
      }
    }
  }

  return insights.sort((a, b) => a.cycleDay - b.cycleDay)
}
