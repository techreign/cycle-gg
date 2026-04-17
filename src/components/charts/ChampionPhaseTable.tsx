import type { EnrichedGame, CyclePhase } from '../../types'
import { PHASE_CONFIG } from '../../constants/phases'

interface Props {
  enrichedGames: EnrichedGame[]
}

interface ChampionRow {
  champion: string
  games: number
  wins: number
  winRate: number
  avgKDA: number
  phaseCounts: Partial<Record<CyclePhase, number>>
}

const KNOWN_PHASES: Exclude<CyclePhase, 'unknown'>[] = ['menstrual', 'follicular', 'ovulation', 'luteal']

export function ChampionPhaseTable({ enrichedGames }: Props) {
  if (enrichedGames.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="section-heading">Champion Performance</h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No games logged yet.</p>
      </div>
    )
  }

  const championMap = new Map<string, ChampionRow>()

  for (const game of enrichedGames) {
    const existing = championMap.get(game.champion)
    const kda = (game.kills + game.assists) / Math.max(game.deaths, 1)

    if (existing) {
      existing.games += 1
      existing.wins += game.win ? 1 : 0
      existing.avgKDA = (existing.avgKDA * (existing.games - 1) + kda) / existing.games
      existing.phaseCounts[game.phase] = (existing.phaseCounts[game.phase] ?? 0) + 1
    } else {
      championMap.set(game.champion, {
        champion: game.champion,
        games: 1,
        wins: game.win ? 1 : 0,
        winRate: 0,
        avgKDA: kda,
        phaseCounts: { [game.phase]: 1 },
      })
    }
  }

  const rows: ChampionRow[] = Array.from(championMap.values())
    .map(r => ({ ...r, winRate: (r.wins / r.games) * 100 }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 10)

  return (
    <div className="glass-card p-5">
      <h3 className="section-heading">Champion Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                Champion
              </th>
              <th className="text-right py-2 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                Games
              </th>
              <th className="text-right py-2 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                Win Rate
              </th>
              <th className="text-right py-2 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                Avg KDA
              </th>
              <th className="text-center py-2 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                Phases
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.champion}
                className="transition-colors hover:bg-white/[0.03]"
              >
                <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {row.champion}
                </td>
                <td className="py-2.5 px-3 text-right" style={{ color: 'var(--color-text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontVariantNumeric: 'tabular-nums' }}>
                  {row.games}
                </td>
                <td
                  className="py-2.5 px-3 text-right font-bold"
                  style={{
                    color: row.winRate >= 50 ? '#34d399' : '#fb7185',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {row.winRate.toFixed(0)}%
                </td>
                <td className="py-2.5 px-3 text-right" style={{ color: 'var(--color-text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontVariantNumeric: 'tabular-nums' }}>
                  {row.avgKDA.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="inline-flex gap-1">
                    {KNOWN_PHASES.map(phase => {
                      const count = row.phaseCounts[phase] ?? 0
                      if (count === 0) return null
                      const config = PHASE_CONFIG[phase]
                      return (
                        <span
                          key={phase}
                          title={`${config.label}: ${count} games`}
                          className="inline-flex items-center justify-center rounded-full text-[10px] font-bold"
                          style={{
                            width: 20, height: 20,
                            background: config.color,
                            color: '#fff',
                          }}
                        >
                          {count}
                        </span>
                      )
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
