import type { PeriodEntry } from '../types'
import type { CycleConfig } from './storage'

/**
 * Generate period entries going backwards from lastPeriodStart.
 * Creates ~8 cycles back (enough for 6+ months of historical data).
 */
export function generatePeriods(config: CycleConfig): PeriodEntry[] {
  const periods: PeriodEntry[] = []
  const { lastPeriodStart, cycleLength, periodDuration } = config

  // Parse the start date as UTC midnight to avoid timezone shifts
  const [year, month, day] = lastPeriodStart.split('-').map(Number)
  let currentStart = new Date(Date.UTC(year, month - 1, day))

  // Generate 8 cycles backwards (including the current one)
  for (let i = 0; i < 8; i++) {
    const startStr = formatDate(currentStart)
    const endDate = new Date(currentStart.getTime() + (periodDuration - 1) * 24 * 60 * 60 * 1000)
    const endStr = formatDate(endDate)

    periods.push({
      id: `generated_${i}`,
      startDate: startStr,
      endDate: endStr,
    })

    // Go back one full cycle
    currentStart = new Date(currentStart.getTime() - cycleLength * 24 * 60 * 60 * 1000)
  }

  return periods
}

function formatDate(d: Date): string {
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
