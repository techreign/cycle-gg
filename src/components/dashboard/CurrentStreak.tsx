import type { EnrichedGame } from '../../types'
import { computeCurrentStreak } from '../../utils/insights'
import { PHASE_CONFIG } from '../../constants/phases'

interface Props {
  enrichedGames: EnrichedGame[]
}

export function CurrentStreak({ enrichedGames }: Props) {
  const streak = computeCurrentStreak(enrichedGames)

  if (streak.kind === 'none') return null

  const isWin = streak.kind === 'win'
  const color = isWin ? '#34d399' : '#fb7185'
  const emoji = isWin ? '🔥' : '❄️'
  const phaseConfig =
    streak.currentPhase !== 'unknown'
      ? PHASE_CONFIG[streak.currentPhase as keyof typeof PHASE_CONFIG]
      : null

  const label = isWin ? 'Win Streak' : 'Loss Streak'

  return (
    <div
      className="glass-card p-5 flex items-center gap-5"
      style={{
        background: `linear-gradient(120deg, ${color}14, transparent 60%)`,
        borderColor: color + '30',
      }}
    >
      <div
        className="rounded-2xl flex items-center justify-center text-3xl shrink-0"
        style={{
          width: 72, height: 72,
          background: color + '18',
          border: `1px solid ${color}40`,
        }}
      >
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color }}>
          {label}
        </p>
        <p className="text-3xl font-black leading-none mt-0.5" style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {streak.length} <span className="text-lg font-semibold" style={{ color: 'var(--color-text-muted)' }}>games</span>
        </p>
        <p className="text-[13px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          {isWin ? 'You are cooking' : 'One game at a time'} ·{' '}
          {phaseConfig && (
            <>
              during <span style={{ color: phaseConfig.color }}>{phaseConfig.emoji} {phaseConfig.label}</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
