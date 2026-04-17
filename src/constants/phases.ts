import type { CyclePhase } from '../types'

export const PHASE_CONFIG: Record<Exclude<CyclePhase, 'unknown'>, {
  label: string
  color: string
  bgColor: string
  emoji: string
  days: string
  description: string
}> = {
  menstrual:  { label: 'Menstrual',  color: '#dc2626', bgColor: '#dc2626', emoji: '🩸', days: '1–5',   description: 'Flow phase' },
  follicular: { label: 'Follicular', color: '#f59e0b', bgColor: '#f59e0b', emoji: '🌅', days: '6–13',  description: 'Rising energy' },
  ovulation:  { label: 'Ovulation',  color: '#fb7185', bgColor: '#fb7185', emoji: '🌕', days: '14–16', description: 'Peak power' },
  luteal:     { label: 'Luteal',     color: '#9f1239', bgColor: '#9f1239', emoji: '🌑', days: '17–28', description: 'Wind down' },
}
