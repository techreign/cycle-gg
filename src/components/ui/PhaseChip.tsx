import type { CyclePhase } from '../../types'
import { PHASE_CONFIG } from '../../constants/phases'

interface PhaseChipProps {
  phase: CyclePhase
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
}

export function PhaseChip({ phase, size = 'md' }: PhaseChipProps) {
  if (phase === 'unknown') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium ${SIZE_CLASSES[size]}`}
        style={{ backgroundColor: 'rgba(122, 97, 105, 0.15)', color: '#7a6169', border: '1px solid rgba(122,97,105,0.3)' }}
      >
        <span>?</span>
        <span>Unknown</span>
      </span>
    )
  }

  const config = PHASE_CONFIG[phase]

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${SIZE_CLASSES[size]}`}
      style={{
        backgroundColor: config.color + '1f',
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
