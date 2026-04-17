import type { MppdResult } from '../../types'

interface Props {
  mppd: MppdResult | null
}

function getScoreColor(direction: MppdResult['direction']): string {
  if (direction === 'better') return '#34d399'
  if (direction === 'worse') return '#fb7185'
  return '#cda3a9'
}

function getScorePrefix(score: number): string {
  if (score > 0) return '+'
  return ''
}

const hasInsufficientData = (mppd: MppdResult | null): boolean => {
  if (!mppd) return true
  return mppd.gamesOnPeriod < 3 || mppd.gamesOffPeriod < 3
}

export function MppdScore({ mppd }: Props) {
  const insufficient = hasInsufficientData(mppd)
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 45%, #9f1239 100%)',
        padding: '1px',
      }}
    >
      <div
        className="relative rounded-2xl px-7 py-6"
        style={{ backgroundColor: 'var(--color-bg-raised)' }}
      >
        {/* Soft inner tint */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: 'radial-gradient(circle at 0% 0%, rgba(251, 113, 133, 0.10), transparent 60%)',
          }}
        />

        <div className="relative">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: '#fb7185' }}>
              MPPD Score
            </span>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              Menstrual Phase Performance Differential
            </span>
          </div>

          {insufficient ? (
            <div>
              <p className="text-lg font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Need more data
              </p>
              <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                Log at least 3 games on your period and 3 off to see your MPPD score.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-1 mb-3">
                <span
                  className="text-5xl font-black leading-none"
                  style={{
                    color: getScoreColor(mppd!.direction),
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {getScorePrefix(mppd!.score)}{mppd!.score.toFixed(1)}
                </span>
                <span className="text-base" style={{ color: 'var(--color-text-muted)' }}>pp</span>
              </div>

              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                On Period:{' '}
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {mppd!.onPeriodWinRate.toFixed(1)}% WR
                </span>{' '}
                <span style={{ color: 'var(--color-text-faint)' }}>({mppd!.gamesOnPeriod} games)</span>
                {' • '}
                Off Period:{' '}
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {mppd!.offPeriodWinRate.toFixed(1)}% WR
                </span>{' '}
                <span style={{ color: 'var(--color-text-faint)' }}>({mppd!.gamesOffPeriod} games)</span>
              </p>

              <p className="text-[13px] mt-2.5" style={{ color: 'var(--color-text-muted)' }}>
                {mppd!.direction === 'better' && 'You perform better when on your period. Period power is real.'}
                {mppd!.direction === 'worse' && 'You perform slightly worse on your period. Consider lighter sessions during menstrual phase.'}
                {mppd!.direction === 'neutral' && 'Your performance is consistent across your cycle. Nice stability.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
