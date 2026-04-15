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
        style={{ backgroundColor: 'rgba(148,163,184,0.15)', color: '#94a3b8' }}
      >
        <span>?</span>
        <span>Unknown</span>
      </span>
    )
  }

  const config = PHASE_CONFIG[phase]

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${SIZE_CLASSES[size]}`}
      style={{ backgroundColor: config.bgColor + '26', color: config.color }}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
