import type { CyclePhase } from '../types'

export const PHASE_CONFIG: Record<Exclude<CyclePhase, 'unknown'>, {
  label: string
  color: string
  bgColor: string
  emoji: string
  days: string
  description: string
}> = {
  menstrual: { label: 'Menstrual', color: '#f43f5e', bgColor: '#fff1f2', emoji: '🌑', days: '1–5', description: 'Flow phase' },
  follicular: { label: 'Follicular', color: '#a855f7', bgColor: '#faf5ff', emoji: '🌒', days: '6–13', description: 'Rising energy' },
  ovulation: { label: 'Ovulation', color: '#ec4899', bgColor: '#fdf4ff', emoji: '🌕', days: '14–16', description: 'Peak power' },
  luteal: { label: 'Luteal', color: '#8b5cf6', bgColor: '#f5f3ff', emoji: '🌗', days: '17–28', description: 'Wind down' },
}
