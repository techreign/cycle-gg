import type { EnrichedGame, CyclePhase } from '../../types'
import { PHASE_CONFIG } from '../../constants/phases'
import { getPhaseRecommendations, type ChampionRec } from '../../utils/insights'

interface Props {
  enrichedGames: EnrichedGame[]
  currentPhase: CyclePhase
}

function RecRow({ rec, kind }: { rec: ChampionRec; kind: 'play' | 'avoid' }) {
  const color = kind === 'play' ? '#34d399' : '#fb7185'
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
      <div className="flex items-center gap-2.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}aa` }}
        />
        <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {rec.champion}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {rec.games}g
        </span>
        <span className="font-bold" style={{ color, minWidth: 38, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {rec.winRate.toFixed(0)}%
        </span>
        <div
          className="rounded-full"
          title={`Confidence: ${(rec.confidence * 100).toFixed(0)}%`}
          style={{
            width: 40,
            height: 4,
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: `${rec.confidence * 100}%`, height: '100%', background: color }} />
        </div>
      </div>
    </div>
  )
}

export function ChampionRecs({ enrichedGames, currentPhase }: Props) {
  if (currentPhase === 'unknown' || enrichedGames.length === 0) {
    return null
  }

  const recs = getPhaseRecommendations(enrichedGames, currentPhase)
  const config = PHASE_CONFIG[currentPhase as keyof typeof PHASE_CONFIG]
  const insufficient = recs.play.length === 0 && recs.avoid.length === 0

  return (
    <div
      className="glass-card p-5"
      style={{ borderTop: `3px solid ${config.color}` }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="section-heading mb-0">
          Champion Picks — <span style={{ color: config.color }}>{config.emoji} {config.label}</span>
        </h3>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {recs.totalGamesInPhase} games in phase
        </span>
      </div>

      {insufficient ? (
        <p className="text-sm py-4" style={{ color: 'var(--color-text-muted)' }}>
          Not enough samples yet. Play at least 2 games on a champ during this phase to unlock recs.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-1" style={{ color: '#34d399' }}>
              ▸ Play these
            </p>
            {recs.play.length > 0 ? (
              recs.play.map(r => <RecRow key={r.champion} rec={r} kind="play" />)
            ) : (
              <p className="text-[13px] py-2" style={{ color: 'var(--color-text-faint)' }}>
                No standout picks yet.
              </p>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-1" style={{ color: '#fb7185' }}>
              ▸ Avoid these
            </p>
            {recs.avoid.length > 0 ? (
              recs.avoid.map(r => <RecRow key={r.champion} rec={r} kind="avoid" />)
            ) : (
              <p className="text-[13px] py-2" style={{ color: 'var(--color-text-faint)' }}>
                No red flags yet. Nice.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
