import type { MppdResult, EnrichedGame, PhaseStats, CyclePhase } from '../types'
import { PHASE_CONFIG } from '../constants/phases'

export interface ShareCardData {
  overallWinRate: number
  totalGames: number
  mppd: MppdResult
  currentPhase: CyclePhase
  bestPhase: { phase: Exclude<CyclePhase, 'unknown'>; winRate: number; games: number } | null
  topChampion: { champion: string; winRate: number; games: number } | null
  phaseStats: PhaseStats[]
}

/**
 * Build the data the share card needs from raw game/phase state.
 */
export function buildShareData(
  games: EnrichedGame[],
  phaseStats: PhaseStats[],
  mppd: MppdResult,
  currentPhase: CyclePhase
): ShareCardData {
  const overallWinRate =
    games.length > 0 ? (games.filter(g => g.win).length / games.length) * 100 : 0

  // Best phase = highest WR among known phases with ≥3 games
  const phaseCandidates = phaseStats.filter(
    s => s.phase !== 'unknown' && s.games >= 3
  )
  const bestPhaseStat = phaseCandidates.sort((a, b) => b.winRate - a.winRate)[0]
  const bestPhase = bestPhaseStat
    ? {
        phase: bestPhaseStat.phase as Exclude<CyclePhase, 'unknown'>,
        winRate: bestPhaseStat.winRate,
        games: bestPhaseStat.games,
      }
    : null

  // Top champion = most games with ≥2 games, then highest WR
  const champMap = new Map<string, { games: number; wins: number }>()
  for (const g of games) {
    const e = champMap.get(g.champion) ?? { games: 0, wins: 0 }
    e.games += 1
    e.wins += g.win ? 1 : 0
    champMap.set(g.champion, e)
  }
  const topChampion = Array.from(champMap.entries())
    .filter(([, d]) => d.games >= 2)
    .map(([champion, d]) => ({
      champion,
      games: d.games,
      winRate: (d.wins / d.games) * 100,
    }))
    .sort((a, b) => b.games - a.games || b.winRate - a.winRate)[0] ?? null

  return {
    overallWinRate,
    totalGames: games.length,
    mppd,
    currentPhase,
    bestPhase,
    topChampion,
    phaseStats,
  }
}

/**
 * Render the share card to a canvas and return a PNG data URL.
 * 1080×1080 works for all socials.
 */
export function renderShareCard(data: ShareCardData): string {
  const size = 1080
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // ─── Background gradient ──────────────────────────────────────────────
  const bg = ctx.createRadialGradient(size * 0.2, size * 0.15, 0, size * 0.5, size * 0.5, size * 0.9)
  bg.addColorStop(0, '#2a0d13')
  bg.addColorStop(0.55, '#1a0a0d')
  bg.addColorStop(1, '#0c0607')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // Warm rose glow blob top-right
  const glow = ctx.createRadialGradient(size * 0.85, size * 0.15, 0, size * 0.85, size * 0.15, 600)
  glow.addColorStop(0, 'rgba(225, 29, 72, 0.35)')
  glow.addColorStop(1, 'rgba(225, 29, 72, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  // ─── Logo ─────────────────────────────────────────────────────────────
  ctx.font = '900 72px Inter, system-ui, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#fb7185'
  ctx.fillText('Cycle', 64, 60)
  const cycleW = ctx.measureText('Cycle').width
  ctx.fillStyle = '#ffffff'
  ctx.fillText('.gg', 64 + cycleW, 60)

  ctx.font = '500 22px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#cda3a9'
  ctx.fillText('my cycle × league report', 66, 142)

  // ─── MPPD hero ────────────────────────────────────────────────────────
  const heroY = 240
  ctx.font = '700 24px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#fb7185'
  ctx.letterSpacing = '3px'
  ctx.fillText('MPPD SCORE', 64, heroY)

  const enough = data.mppd.gamesOnPeriod >= 3 && data.mppd.gamesOffPeriod >= 3
  const scoreText = enough
    ? `${data.mppd.score > 0 ? '+' : ''}${data.mppd.score.toFixed(1)}`
    : '—'
  const scoreColor =
    data.mppd.direction === 'better'
      ? '#34d399'
      : data.mppd.direction === 'worse'
        ? '#fb7185'
        : '#cda3a9'

  ctx.font = '900 180px Inter, system-ui, sans-serif'
  ctx.fillStyle = scoreColor
  ctx.fillText(scoreText, 64, heroY + 36)
  const scoreWidth = ctx.measureText(scoreText).width

  if (enough) {
    ctx.font = '600 48px Inter, system-ui, sans-serif'
    ctx.fillStyle = '#cda3a9'
    ctx.fillText('pp', 78 + scoreWidth, heroY + 150)
  }

  ctx.font = '500 24px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#cda3a9'
  const verdict =
    data.mppd.direction === 'better'
      ? 'I play better on my period 🩸'
      : data.mppd.direction === 'worse'
        ? 'My period costs me LP'
        : 'Cycle-consistent grinder'
  ctx.fillText(verdict, 64, heroY + 260)

  // ─── Phase bars ───────────────────────────────────────────────────────
  const barsY = 560
  ctx.font = '700 20px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#7a6169'
  ctx.fillText('WIN RATE BY PHASE', 64, barsY)

  const phaseList: Exclude<CyclePhase, 'unknown'>[] = ['menstrual', 'follicular', 'ovulation', 'luteal']
  const barAreaX = 64
  const barAreaW = size - 128
  const barAreaH = 110
  const barW = (barAreaW - 3 * 24) / 4

  phaseList.forEach((phase, idx) => {
    const config = PHASE_CONFIG[phase]
    const stat = data.phaseStats.find(s => s.phase === phase)
    const wr = stat && stat.games > 0 ? stat.winRate : 0
    const barH = (wr / 100) * barAreaH

    const x = barAreaX + idx * (barW + 24)
    const yTop = barsY + 50 + (barAreaH - barH)

    // track
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(x, barsY + 50, barW, barAreaH)

    // fill
    ctx.fillStyle = config.color + 'dd'
    ctx.fillRect(x, yTop, barW, barH)

    // label
    ctx.font = '600 18px Inter, system-ui, sans-serif'
    ctx.fillStyle = config.color
    ctx.textAlign = 'center'
    ctx.fillText(`${config.emoji} ${config.label}`, x + barW / 2, barsY + 50 + barAreaH + 16)

    ctx.font = '800 22px Inter, system-ui, sans-serif'
    ctx.fillStyle = '#f8e4e7'
    ctx.fillText(
      stat && stat.games > 0 ? `${wr.toFixed(0)}%` : '—',
      x + barW / 2,
      yTop - 28
    )
    ctx.textAlign = 'left'
  })

  // ─── Highlights row ───────────────────────────────────────────────────
  const cardsY = 830
  const cardW = (size - 128 - 24) / 2
  const cardH = 140

  // Best phase card
  drawHighlightCard(
    ctx,
    64,
    cardsY,
    cardW,
    cardH,
    'BEST PHASE',
    data.bestPhase
      ? `${PHASE_CONFIG[data.bestPhase.phase].emoji} ${PHASE_CONFIG[data.bestPhase.phase].label}`
      : '—',
    data.bestPhase ? `${data.bestPhase.winRate.toFixed(0)}% · ${data.bestPhase.games}g` : 'not enough data',
    data.bestPhase ? PHASE_CONFIG[data.bestPhase.phase].color : '#7a6169'
  )

  // Top champion card
  drawHighlightCard(
    ctx,
    64 + cardW + 24,
    cardsY,
    cardW,
    cardH,
    'TOP CHAMPION',
    data.topChampion ? data.topChampion.champion : '—',
    data.topChampion
      ? `${data.topChampion.winRate.toFixed(0)}% · ${data.topChampion.games}g`
      : 'need more games',
    '#fb7185'
  )

  // ─── Footer ───────────────────────────────────────────────────────────
  const footerY = size - 56
  ctx.font = '500 22px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#7a6169'
  ctx.fillText(
    `${data.totalGames} games · ${data.overallWinRate.toFixed(1)}% overall WR`,
    64,
    footerY
  )
  ctx.textAlign = 'right'
  ctx.fillStyle = '#fb7185'
  ctx.font = '700 22px Inter, system-ui, sans-serif'
  ctx.fillText('cycle.gg', size - 64, footerY)
  ctx.textAlign = 'left'

  return canvas.toDataURL('image/png')
}

function drawHighlightCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  title: string,
  subtitle: string,
  accent: string
) {
  // Rounded rect
  const r = 20
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()

  const grad = ctx.createLinearGradient(x, y, x + w, y + h)
  grad.addColorStop(0, accent + '22')
  grad.addColorStop(1, accent + '08')
  ctx.fillStyle = grad
  ctx.fill()

  ctx.strokeStyle = accent + '55'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.font = '700 16px Inter, system-ui, sans-serif'
  ctx.fillStyle = accent
  ctx.fillText(label, x + 24, y + 22)

  ctx.font = '800 42px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#f8e4e7'
  ctx.fillText(title, x + 24, y + 54)

  ctx.font = '500 20px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#cda3a9'
  ctx.fillText(subtitle, x + 24, y + 104)
}
