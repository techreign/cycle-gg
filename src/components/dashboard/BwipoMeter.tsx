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

  return (
    <div className={`glass-card p-5 ${isPulsing ? 'bwipo-glow' : ''}`}>
      <h3 className="section-heading">Aggression Meter</h3>

      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>Low</span>
        <span
          className="text-xl font-black"
          style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
        >
          {score.toFixed(1)}
          <span className="text-sm font-normal ml-0.5" style={{ color: 'var(--color-text-faint)' }}> / 10</span>
        </span>
        <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>High</span>
      </div>

      <div
        className="w-full rounded-full overflow-hidden mb-4"
        style={{ height: 12, background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          style={{
            width: `${fillPercent}%`,
            height: '100%',
            borderRadius: 6,
            background: 'linear-gradient(90deg, #34d399 0%, #f59e0b 50%, #e11d48 100%)',
            transition: 'width 0.4s ease',
            boxShadow: isPulsing ? '0 0 14px rgba(225,29,72,0.6)' : 'none',
          }}
        />
      </div>

      {isBwipoMode && (
        <div
          className="rounded-lg px-3.5 py-3"
          style={{ background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.3)' }}
        >
          <p
            className="text-sm font-black tracking-wider"
            style={{ color: '#fb7185', marginBottom: quote ? 6 : 0 }}
          >
            ⚠ BWIPO MODE ACTIVATED
          </p>
          {quote && (
            <p className="text-[13px] italic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              "{quote}"
            </p>
          )}
        </div>
      )}

      {!isBwipoMode && score > 5 && (
        <p className="text-[13px]" style={{ color: '#f59e0b' }}>
          Elevated aggression — watch your decision-making.
        </p>
      )}

      {score <= 5 && (
        <p className="text-[13px]" style={{ color: '#34d399' }}>
          Playing it clean. Keep it up.
        </p>
      )}
    </div>
  )
}
