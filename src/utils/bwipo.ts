import type { PhaseStats } from '../types'

const BWIPO_QUOTES: string[] = [
  "I don't need wards, I need kills. — Bwipo, probably",
  "Playing safe? Never heard of it. — Bwipo",
  "The enemy nexus IS my ward. — Bwipo",
  "My KDA is a suggestion, not a goal. — Bwipo",
  "I dove the fountain and I'd do it again. — Bwipo",
  "Vision control? My mechanics ARE the vision. — Bwipo",
  "I play aggro because the game gets boring when you're not dying. — Bwipo",
  "Every fight is a winnable fight if you believe hard enough. — Bwipo, 0/7 at 10 mins",
]

/**
 * Returns a random Bwipo quote when aggression score exceeds 7.5,
 * otherwise null.
 */
export function getBwipoAlert(aggressionScore: number): string | null {
  if (aggressionScore <= 7.5) return null
  const index = Math.floor(Math.random() * BWIPO_QUOTES.length)
  return BWIPO_QUOTES[index]
}

/**
 * Returns true when a phase's aggression score exceeds 8.
 */
export function isBwipoMode(phaseStats: PhaseStats): boolean {
  return phaseStats.aggressionScore > 8
}
