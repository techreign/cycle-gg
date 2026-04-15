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
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
          Champion Performance
        </h3>
        <p style={{ color: '#64748b', fontSize: 14 }}>No games logged yet.</p>
      </div>
    )
  }

  // Group by champion
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
    <div className="glass-card" style={{ padding: '20px 24px' }}>
      <h3
        style={{
          color: '#e2e8f0',
          fontWeight: 600,
          fontSize: 16,
          marginBottom: 20,
        }}
      >
        Champion Performance
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  color: '#64748b',
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Champion
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '8px 12px',
                  color: '#64748b',
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Games
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '8px 12px',
                  color: '#64748b',
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Win Rate
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '8px 12px',
                  color: '#64748b',
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Avg KDA
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: '8px 12px',
                  color: '#64748b',
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Phases
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.champion}
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLTableRowElement).style.background =
                    'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                }}
              >
                <td
                  style={{
                    padding: '10px 12px',
                    color: '#e2e8f0',
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {row.champion}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    textAlign: 'right',
                    color: '#94a3b8',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {row.games}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    textAlign: 'right',
                    color: row.winRate >= 50 ? '#4ade80' : '#f87171',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {row.winRate.toFixed(0)}%
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    textAlign: 'right',
                    color: '#94a3b8',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {row.avgKDA.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span style={{ display: 'inline-flex', gap: 4 }}>
                    {KNOWN_PHASES.map(phase => {
                      const count = row.phaseCounts[phase] ?? 0
                      if (count === 0) return null
                      const config = PHASE_CONFIG[phase]
                      return (
                        <span
                          key={phase}
                          title={`${config.label}: ${count} games`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: config.color,
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
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
