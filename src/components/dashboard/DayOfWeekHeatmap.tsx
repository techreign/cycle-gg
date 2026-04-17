import type { EnrichedGame } from '../../types'
import { computeDayOfWeekPerformance } from '../../utils/insights'

interface Props {
  enrichedGames: EnrichedGame[]
}

function winRateColor(wr: number, hasData: boolean): string {
  if (!hasData) return 'rgba(255,255,255,0.04)'
  if (wr >= 65) return '#34d39988'
  if (wr >= 55) return '#34d39955'
  if (wr >= 45) return '#f59e0b55'
  if (wr >= 35) return '#fb718555'
  return '#fb718588'
}

export function DayOfWeekHeatmap({ enrichedGames }: Props) {
  const buckets = computeDayOfWeekPerformance(enrichedGames)
  const totalGames = buckets.reduce((s, b) => s + b.games, 0)

  if (totalGames === 0) return null

  const bestDow = buckets.filter(b => b.games >= 2).sort((a, b) => b.winRate - a.winRate)[0]
  const worstDow = buckets.filter(b => b.games >= 2).sort((a, b) => a.winRate - b.winRate)[0]

  return (
    <div className="glass-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="section-heading mb-0">Day-of-Week Win Rate</h3>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {totalGames} games
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {buckets.map(b => (
          <div
            key={b.dow}
            className="rounded-lg p-2 text-center flex flex-col justify-center"
            style={{
              background: winRateColor(b.winRate, b.games > 0),
              minHeight: 72,
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              {b.label}
            </p>
            <p className="text-lg font-black mt-1" style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {b.games > 0 ? `${b.winRate.toFixed(0)}%` : '—'}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {b.games > 0 ? `${b.games}g` : 'no data'}
            </p>
          </div>
        ))}
      </div>

      {bestDow && worstDow && bestDow.dow !== worstDow.dow && (
        <div className="flex gap-4 mt-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#34d399' }}>Best</span>
            <span className="ml-1.5 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {bestDow.label} · {bestDow.winRate.toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#fb7185' }}>Worst</span>
            <span className="ml-1.5 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {worstDow.label} · {worstDow.winRate.toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
