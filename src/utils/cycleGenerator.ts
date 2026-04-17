import type { PeriodEntry } from '../types'
import type { CycleConfig } from './storage'

/**
 * Generate period entries going 8 cycles back and 3 cycles forward from
 * lastPeriodStart, so past analytics and future predictions both work.
 * Forward-generated periods are marked with a `predicted` prefix in the id.
 */
export function generatePeriods(config: CycleConfig): PeriodEntry[] {
  const periods: PeriodEntry[] = []
  const { lastPeriodStart, cycleLength, periodDuration } = config

  const [year, month, day] = lastPeriodStart.split('-').map(Number)
  const anchor = new Date(Date.UTC(year, month - 1, day))

  const dayMs = 24 * 60 * 60 * 1000

  // Backwards (8 cycles including current)
  for (let i = 0; i < 8; i++) {
    const start = new Date(anchor.getTime() - i * cycleLength * dayMs)
    const end = new Date(start.getTime() + (periodDuration - 1) * dayMs)
    periods.push({
      id: `generated_back_${i}`,
      startDate: formatDate(start),
      endDate: formatDate(end),
    })
  }

  // Forwards (3 predicted cycles)
  for (let i = 1; i <= 3; i++) {
    const start = new Date(anchor.getTime() + i * cycleLength * dayMs)
    const end = new Date(start.getTime() + (periodDuration - 1) * dayMs)
    periods.push({
      id: `predicted_${i}`,
      startDate: formatDate(start),
      endDate: formatDate(end),
    })
  }

  return periods
}

export function isPredictedPeriod(period: PeriodEntry): boolean {
  return period.id.startsWith('predicted_')
}

function formatDate(d: Date): string {
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
