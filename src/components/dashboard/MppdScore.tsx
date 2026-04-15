import type { MppdResult } from '../../types'

interface Props {
  mppd: MppdResult | null
}

function getScoreColor(direction: MppdResult['direction']): string {
  if (direction === 'better') return '#4ade80'
  if (direction === 'worse') return '#f87171'
  return '#94a3b8'
}

function getScorePrefix(score: number): string {
  if (score > 0) return '+'
  if (score < 0) return ''
  return ''
}

const hasInsufficientData = (mppd: MppdResult | null): boolean => {
  if (!mppd) return true
  return mppd.gamesOnPeriod < 3 || mppd.gamesOffPeriod < 3
}

export function MppdScore({ mppd }: Props) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
        borderRadius: '1.125rem',
        padding: '2px',
      }}
    >
      <div
        style={{
          background: '#0d0a14',
          borderRadius: '1rem',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            MPPD Score
          </span>
          <span style={{ color: '#64748b', fontSize: 11 }}>
            Menstrual Phase Performance Differential
          </span>
        </div>

        {hasInsufficientData(mppd) ? (
          <div>
            <p style={{ color: '#64748b', fontSize: 18, fontWeight: 500 }}>
              Need more data
            </p>
            <p style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>
              Log at least 3 games on your period and 3 off to see your MPPD score.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: getScoreColor(mppd!.direction),
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {getScorePrefix(mppd!.score)}{mppd!.score.toFixed(1)}
              </span>
              <span style={{ color: '#64748b', fontSize: 16 }}>pp</span>
            </div>

            <p style={{ color: '#94a3b8', fontSize: 14 }}>
              On Period:{' '}
              <span style={{ color: '#e2e8f0', fontWeight: 500 }}>
                {mppd!.onPeriodWinRate.toFixed(1)}% WR
              </span>{' '}
              <span style={{ color: '#475569' }}>({mppd!.gamesOnPeriod} games)</span>
              {' • '}
              Off Period:{' '}
              <span style={{ color: '#e2e8f0', fontWeight: 500 }}>
                {mppd!.offPeriodWinRate.toFixed(1)}% WR
              </span>{' '}
              <span style={{ color: '#475569' }}>({mppd!.gamesOffPeriod} games)</span>
            </p>

            <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
              {mppd!.direction === 'better' && 'You perform better when on your period. Period power is real.'}
              {mppd!.direction === 'worse' && 'You perform slightly worse on your period. Consider lighter sessions during menstrual phase.'}
              {mppd!.direction === 'neutral' && 'Your performance is consistent across your cycle. Nice stability.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
