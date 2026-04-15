import type { CyclePhase, PeriodEntry } from '../types'

/**
 * Parse a YYYY-MM-DD string to a UTC midnight Date to avoid timezone shifts.
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * Difference in whole days between two dates (b - a).
 */
function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Map a 1-based cycle day to a phase.
 * menstrual: 1–5, follicular: 6–13, ovulation: 14–16, luteal: 17–28+
 */
function cycleDayToPhase(cycleDay: number): CyclePhase {
  if (cycleDay >= 1 && cycleDay <= 5) return 'menstrual'
  if (cycleDay >= 6 && cycleDay <= 13) return 'follicular'
  if (cycleDay >= 14 && cycleDay <= 16) return 'ovulation'
  if (cycleDay >= 17) return 'luteal'
  return 'unknown'
}

/**
 * Find the most recent period that started on or before the given date,
 * then compute the cycle day (1-indexed) and return the phase.
 */
export function getPhaseForDate(date: string, periods: PeriodEntry[]): CyclePhase {
  if (periods.length === 0) return 'unknown'

  const target = parseDate(date)

  // Sort periods descending by startDate
  const sorted = [...periods].sort(
    (a, b) => parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime()
  )

  const mostRecent = sorted.find(p => parseDate(p.startDate) <= target)
  if (!mostRecent) return 'unknown'

  const cycleDay = daysBetween(parseDate(mostRecent.startDate), target) + 1
  return cycleDayToPhase(cycleDay)
}

/**
 * Returns the 1-indexed cycle day for the given date, or null if no period
 * is found on or before the date.
 */
export function getCycleDayForDate(date: string, periods: PeriodEntry[]): number | null {
  if (periods.length === 0) return null

  const target = parseDate(date)

  const sorted = [...periods].sort(
    (a, b) => parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime()
  )

  const mostRecent = sorted.find(p => parseDate(p.startDate) <= target)
  if (!mostRecent) return null

  return daysBetween(parseDate(mostRecent.startDate), target) + 1
}

/**
 * Compute average cycle length from consecutive period start dates.
 * Falls back to 28 if fewer than 2 periods exist.
 */
export function getAverageCycleLength(periods: PeriodEntry[]): number {
  if (periods.length < 2) return 28

  const sorted = [...periods].sort(
    (a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime()
  )

  let totalDays = 0
  let count = 0
  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(parseDate(sorted[i - 1].startDate), parseDate(sorted[i].startDate))
    if (diff > 0) {
      totalDays += diff
      count++
    }
  }

  return count > 0 ? Math.round(totalDays / count) : 28
}

/**
 * Predict the next period start date based on the most recent period and
 * average cycle length. Returns YYYY-MM-DD or null if no periods logged.
 */
export function predictNextPeriod(periods: PeriodEntry[]): string | null {
  if (periods.length === 0) return null

  const sorted = [...periods].sort(
    (a, b) => parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime()
  )

  const lastStart = parseDate(sorted[0].startDate)
  const cycleLength = getAverageCycleLength(periods)

  const nextDate = new Date(lastStart.getTime() + cycleLength * 24 * 60 * 60 * 1000)
  const yyyy = nextDate.getUTCFullYear()
  const mm = String(nextDate.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(nextDate.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
