import type { PeriodEntry, PhaseStats } from '../../types'
import { PHASE_CONFIG } from '../../constants/phases'
import { getPhaseForecast } from '../../utils/insights'

interface Props {
  periods: PeriodEntry[]
  phaseStats: PhaseStats[]
}

export function PhaseForecast({ periods, phaseStats }: Props) {
  if (periods.length === 0) return null

  const forecast = getPhaseForecast(periods, 7)

  const phaseWR = new Map<string, { winRate: number; games: number }>()
  for (const s of phaseStats) {
    phaseWR.set(s.phase, { winRate: s.winRate, games: s.games })
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="section-heading mb-0">Next 7 Days</h3>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          phase forecast
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {forecast.map((day) => {
          const config =
            day.phase !== 'unknown'
              ? PHASE_CONFIG[day.phase as keyof typeof PHASE_CONFIG]
              : null
          const wr = phaseWR.get(day.phase)
          const color = config?.color ?? '#7a6169'
          const wrText = wr && wr.games >= 2 ? `${wr.winRate.toFixed(0)}%` : '—'

          return (
            <div
              key={day.date}
              className="rounded-xl p-2 text-center transition-transform hover:-translate-y-0.5"
              style={{
                background: day.isToday
                  ? `linear-gradient(180deg, ${color}22, ${color}08)`
                  : `${color}0d`,
                border: `1px solid ${color}${day.isToday ? '55' : '22'}`,
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                {day.isToday ? 'Today' : day.label}
              </p>
              <p className="text-base font-black mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                {day.dayNum}
              </p>
              <p className="text-[15px] mt-1 leading-none">{config?.emoji ?? '·'}</p>
              <p className="text-[10px] mt-1 font-bold" style={{ color, fontVariantNumeric: 'tabular-nums' }}>
                {wrText}
              </p>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] mt-3" style={{ color: 'var(--color-text-faint)' }}>
        Expected phase · your historical WR for that phase.
      </p>
    </div>
  )
}
