import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PHASE_CONFIG } from '../constants/phases'
import { StatCard } from '../components/ui/StatCard'
import { PhaseChip } from '../components/ui/PhaseChip'
import { EmptyState } from '../components/ui/EmptyState'
import { WinRateByPhase } from '../components/charts/WinRateByPhase'
import { AggressionByPhase } from '../components/charts/AggressionByPhase'
import { KdaTrendLine } from '../components/charts/KdaTrendLine'
import { ChampionPhaseTable } from '../components/charts/ChampionPhaseTable'
import { MppdScore } from '../components/dashboard/MppdScore'
import { BestWorstDays } from '../components/dashboard/BestWorstDays'
import { BwipoMeter } from '../components/dashboard/BwipoMeter'

export function DashboardPage() {
  const {
    enrichedGames,
    phaseStats,
    mppd,
    bestWorstDays,
    currentPhase,
    currentCycleDay,
    periods,
  } = useApp()

  const navigate = useNavigate()

  const hasGames = enrichedGames.length > 0
  const hasPeriods = periods.length > 0

  // Overall win rate
  const overallWinRate =
    enrichedGames.length > 0
      ? (enrichedGames.filter(g => g.win).length / enrichedGames.length) * 100
      : 0

  // Current phase win rate
  const currentPhaseStat = phaseStats.find(s => s.phase === currentPhase)
  const currentPhaseWinRate = currentPhaseStat?.winRate ?? 0

  // Current phase aggression score
  const currentAggressionScore = currentPhaseStat?.aggressionScore ?? 0

  // MPPD stat card value
  const mppdDisplay =
    mppd.gamesOnPeriod >= 3 && mppd.gamesOffPeriod >= 3
      ? `${mppd.score > 0 ? '+' : ''}${mppd.score.toFixed(1)}pp`
      : '—'

  const mppdTrend: 'up' | 'down' | 'neutral' =
    mppd.direction === 'better' ? 'up' : mppd.direction === 'worse' ? 'down' : 'neutral'

  // Phase config for current phase
  const currentPhaseConfig =
    currentPhase !== 'unknown' ? PHASE_CONFIG[currentPhase as keyof typeof PHASE_CONFIG] : null

  if (!hasGames) {
    return (
      <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
        <EmptyState
          title="No games logged yet"
          description="Log some games and your period to see your analytics"
          action={{ label: 'Log a Game', onClick: () => navigate('/log-game') }}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Top strip: current phase ── */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {hasPeriods ? (
          <>
            <PhaseChip phase={currentPhase} size="lg" />
            <div>
              {currentCycleDay !== null && (
                <p style={{ color: '#e2e8f0', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                  Day {currentCycleDay} of your cycle
                </p>
              )}
              {currentPhaseConfig && (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>
                  {currentPhaseConfig.description} — Days {currentPhaseConfig.days}
                </p>
              )}
            </div>
          </>
        ) : (
          <div>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>
              Log your first period to get started with cycle-aware analytics.{' '}
              <button
                onClick={() => navigate('/log-period')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ec4899',
                  cursor: 'pointer',
                  fontSize: 14,
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Log period
              </button>
            </p>
          </div>
        )}
      </div>

      {/* ── Stat cards row (2x2 mobile, 4x1 desktop) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          title="Overall Win Rate"
          value={`${overallWinRate.toFixed(1)}%`}
          subtitle={`${enrichedGames.length} games total`}
          trend={overallWinRate >= 50 ? 'up' : 'down'}
        />
        <StatCard
          title="Current Phase WR"
          value={
            currentPhaseStat && currentPhaseStat.games > 0
              ? `${currentPhaseWinRate.toFixed(1)}%`
              : '—'
          }
          subtitle={
            currentPhaseStat && currentPhaseStat.games > 0
              ? `${currentPhaseStat.games} games this phase`
              : 'No games in current phase'
          }
          trend={
            currentPhaseStat && currentPhaseStat.games > 0
              ? currentPhaseWinRate >= 50
                ? 'up'
                : 'down'
              : 'neutral'
          }
        />
        <StatCard
          title="MPPD Score"
          value={mppdDisplay}
          subtitle="Menstrual phase differential"
          trend={mppdTrend}
        />
        <StatCard
          title="Total Games"
          value={enrichedGames.length}
          subtitle={`${enrichedGames.filter(g => g.win).length} wins`}
          trend="neutral"
        />
      </div>

      {/* ── MPPD Hero Card ── */}
      <div style={{ marginBottom: 24 }}>
        <MppdScore mppd={mppd} />
      </div>

      {/* ── Charts section: 2-column on desktop ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
          marginBottom: 24,
        }}
      >
        <WinRateByPhase phaseStats={phaseStats} />
        <AggressionByPhase phaseStats={phaseStats} />
      </div>

      {/* ── KDA Trend full-width ── */}
      <div style={{ marginBottom: 24 }}>
        <KdaTrendLine enrichedGames={enrichedGames} />
      </div>

      {/* ── Bottom section: 2-column on desktop ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
          marginBottom: 24,
        }}
      >
        <BestWorstDays bestWorstDays={bestWorstDays} />
        <BwipoMeter aggressionScore={currentAggressionScore} />
      </div>

      {/* ── Champion Table full-width ── */}
      <ChampionPhaseTable enrichedGames={enrichedGames} />
    </div>
  )
}
