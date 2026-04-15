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

  const accentColor = type === 'best' ? '#4ade80' : '#f87171'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: `${accentColor}22`,
            color: accentColor,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {insight.cycleDay}
        </span>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          {config ? `${config.emoji} ${config.label}` : 'Unknown'}
        </span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ color: accentColor, fontWeight: 600, fontSize: 14 }}>
          {insight.avgWinRate.toFixed(0)}% WR
        </span>
        <span style={{ color: '#475569', fontSize: 12, marginLeft: 6 }}>
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
    <div className="glass-card" style={{ padding: '20px 24px' }}>
      <h3
        style={{
          color: '#e2e8f0',
          fontWeight: 600,
          fontSize: 16,
          marginBottom: 20,
        }}
      >
        Best &amp; Worst Days to Queue
      </h3>

      {isEmpty ? (
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Not enough data yet. Log more games across your cycle.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <p
              style={{
                color: '#4ade80',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}
            >
              Best Days
            </p>
            {bestDays.length > 0 ? (
              bestDays.map(d => (
                <DayRow key={d.cycleDay} insight={d} type="best" />
              ))
            ) : (
              <p style={{ color: '#475569', fontSize: 13 }}>No standout days yet.</p>
            )}
          </div>

          <div>
            <p
              style={{
                color: '#f87171',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}
            >
              Worst Days
            </p>
            {worstDays.length > 0 ? (
              worstDays.map(d => (
                <DayRow key={d.cycleDay} insight={d} type="worst" />
              ))
            ) : (
              <p style={{ color: '#475569', fontSize: 13 }}>No bad days yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
