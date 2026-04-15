import { getBwipoAlert } from '../../utils/bwipo'

interface Props {
  aggressionScore: number
}

export function BwipoMeter({ aggressionScore }: Props) {
  const score = Math.min(10, Math.max(0, aggressionScore))
  const fillPercent = (score / 10) * 100
  const isPulsing = score > 7.5
  const isBwipoMode = score > 8.0
  const quote = getBwipoAlert(score)

  // Gradient stops: green at 0%, yellow at 50%, red at 100%
  const barColor =
    score <= 4
      ? `hsl(${120 - score * 20}, 80%, 55%)`
      : score <= 7
      ? `hsl(${40 - (score - 4) * 8}, 85%, 55%)`
      : '#f43f5e'

  return (
    <div className={`glass-card ${isPulsing ? 'bwipo-glow' : ''}`} style={{ padding: '20px 24px' }}>
      <h3
        style={{
          color: '#e2e8f0',
          fontWeight: 600,
          fontSize: 16,
          marginBottom: 16,
        }}
      >
        Aggression Meter
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>Low</span>
        <span
          style={{
            color: '#e2e8f0',
            fontWeight: 700,
            fontSize: 20,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {score.toFixed(1)}
          <span style={{ color: '#64748b', fontSize: 14, fontWeight: 400 }}> / 10</span>
        </span>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>High</span>
      </div>

      {/* Bar track */}
      <div
        style={{
          width: '100%',
          height: 12,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: `${fillPercent}%`,
            height: '100%',
            borderRadius: 6,
            background: `linear-gradient(90deg, #4ade80 0%, #facc15 50%, #f43f5e 100%)`,
            transition: 'width 0.4s ease',
            boxShadow: isPulsing ? `0 0 12px ${barColor}` : 'none',
          }}
        />
      </div>

      {isBwipoMode && (
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 8,
            padding: '12px 14px',
          }}
        >
          <p
            style={{
              color: '#f43f5e',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.05em',
              marginBottom: quote ? 6 : 0,
            }}
          >
            BWIPO MODE ACTIVATED
          </p>
          {quote && (
            <p style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', lineHeight: 1.5 }}>
              "{quote}"
            </p>
          )}
        </div>
      )}

      {!isBwipoMode && score > 5 && (
        <p style={{ color: '#fbbf24', fontSize: 13 }}>
          Elevated aggression — watch your decision-making.
        </p>
      )}

      {score <= 5 && (
        <p style={{ color: '#4ade80', fontSize: 13 }}>
          Playing it clean. Keep it up.
        </p>
      )}
    </div>
  )
}
