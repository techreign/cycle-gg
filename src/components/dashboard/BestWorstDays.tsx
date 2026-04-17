import type { DayInsight } from '../../types'
import { PHASE_CONFIG } from '../../constants/phases'

interface Props {
  bestWorstDays: DayInsight[]
}

function DayRow({
  insight,
  type,
}: {
  insight: DayInsight
  type: 'best' | 'worst'
}) {
  const config =
    insight.phase !== 'unknown'
      ? PHASE_CONFIG[insight.phase as keyof typeof PHASE_CONFIG]
      : null

  const accentColor = type === 'best' ? '#34d399' : '#fb7185'

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-b-0">
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center justify-center rounded-full text-[13px] font-black"
          style={{
            width: 32, height: 32,
            background: accentColor + '22',
            color: accentColor,
          }}
        >
          {insight.cycleDay}
        </span>
        <span className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
          {config ? `${config.emoji} ${config.label}` : 'Unknown'}
        </span>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold" style={{ color: accentColor, fontVariantNumeric: 'tabular-nums' }}>
          {insight.avgWinRate.toFixed(0)}% WR
        </span>
        <span className="text-xs ml-1.5" style={{ color: 'var(--color-text-faint)' }}>
          ({insight.sampleSize}g)
        </span>
      </div>
    </div>
  )
}

export function BestWorstDays({ bestWorstDays }: Props) {
  const bestDays = bestWorstDays
    .filter(d => d.label === 'best' || d.avgWinRate >= 60)
    .sort((a, b) => b.avgWinRate - a.avgWinRate)
    .slice(0, 3)

  const worstDays = bestWorstDays
    .filter(d => d.label === 'worst' || d.avgWinRate <= 40)
    .sort((a, b) => a.avgWinRate - b.avgWinRate)
    .slice(0, 3)

  const isEmpty = bestWorstDays.length === 0

  return (
    <div className="glass-card p-5">
      <h3 className="section-heading">Best &amp; Worst Days to Queue</h3>

      {isEmpty ? (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Not enough data yet. Log more games across your cycle.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: '#34d399' }}>
              ↑ Best Days
            </p>
            {bestDays.length > 0 ? (
              bestDays.map(d => <DayRow key={d.cycleDay} insight={d} type="best" />)
            ) : (
              <p className="text-[13px]" style={{ color: 'var(--color-text-faint)' }}>No standout days yet.</p>
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: '#fb7185' }}>
              ↓ Worst Days
            </p>
            {worstDays.length > 0 ? (
              worstDays.map(d => <DayRow key={d.cycleDay} insight={d} type="worst" />)
            ) : (
              <p className="text-[13px]" style={{ color: 'var(--color-text-faint)' }}>No bad days yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
