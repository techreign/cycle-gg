import { useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
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
import { ChampionRecs } from '../components/dashboard/ChampionRecs'
import { CurrentStreak } from '../components/dashboard/CurrentStreak'
import { PhaseForecast } from '../components/dashboard/PhaseForecast'
import { DayOfWeekHeatmap } from '../components/dashboard/DayOfWeekHeatmap'
import { ShareCard } from '../components/dashboard/ShareCard'

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

  const overallWinRate =
    enrichedGames.length > 0
      ? (enrichedGames.filter(g => g.win).length / enrichedGames.length) * 100
      : 0

  const currentPhaseStat = phaseStats.find(s => s.phase === currentPhase)
  const currentPhaseWinRate = currentPhaseStat?.winRate ?? 0
  const currentAggressionScore = currentPhaseStat?.aggressionScore ?? 0

  const mppdDisplay =
    mppd.gamesOnPeriod >= 3 && mppd.gamesOffPeriod >= 3
      ? `${mppd.score > 0 ? '+' : ''}${mppd.score.toFixed(1)}pp`
      : '—'

  const mppdTrend: 'up' | 'down' | 'neutral' =
    mppd.direction === 'better' ? 'up' : mppd.direction === 'worse' ? 'down' : 'neutral'

  const currentPhaseConfig =
    currentPhase !== 'unknown' ? PHASE_CONFIG[currentPhase as keyof typeof PHASE_CONFIG] : null

  if (!hasGames) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-8">
        <EmptyState
          title="No games logged yet"
          description="Log some games and your period to see your analytics."
          action={{ label: 'Log your first game', onClick: () => navigate('/log-game') }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-8 space-y-6">
      {/* ── Hero: current phase ── */}
      <div
        className="rounded-2xl p-5 md:p-6 flex items-center gap-5 flex-wrap fade-up"
        style={{
          background: currentPhaseConfig
            ? `linear-gradient(120deg, ${currentPhaseConfig.color}22, ${currentPhaseConfig.color}08 50%, transparent)`
            : 'var(--color-bg-raised)',
          border: `1px solid ${currentPhaseConfig ? currentPhaseConfig.color + '40' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        {hasPeriods ? (
          <>
            <PhaseChip phase={currentPhase} size="lg" />
            <div className="flex-1 min-w-0">
              {currentCycleDay !== null && (
                <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Day {currentCycleDay} of your cycle
                </p>
              )}
              {currentPhaseConfig && (
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {currentPhaseConfig.description} · Days {currentPhaseConfig.days}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Log your first period to get started with cycle-aware analytics.{' '}
              <button
                onClick={() => navigate('/log-period')}
                className="underline font-semibold"
                style={{ color: '#fb7185' }}
              >
                Log period →
              </button>
            </p>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-up-2">
        <StatCard
          title="Overall Win Rate"
          value={`${overallWinRate.toFixed(1)}%`}
          subtitle={`${enrichedGames.length} games total`}
          trend={overallWinRate >= 50 ? 'up' : 'down'}
        />
        <StatCard
          title="Current Phase WR"
          value={currentPhaseStat && currentPhaseStat.games > 0 ? `${currentPhaseWinRate.toFixed(1)}%` : '—'}
          subtitle={
            currentPhaseStat && currentPhaseStat.games > 0
              ? `${currentPhaseStat.games} games this phase`
              : 'No games in current phase'
          }
          trend={
            currentPhaseStat && currentPhaseStat.games > 0
              ? currentPhaseWinRate >= 50 ? 'up' : 'down'
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
        />
      </div>

      {/* ── NEW: Current streak + 7-day forecast ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 fade-up-3">
        <CurrentStreak enrichedGames={enrichedGames} />
        <PhaseForecast periods={periods} phaseStats={phaseStats} />
      </div>

      {/* ── NEW: Champion recommendations for current phase ── */}
      <ChampionRecs enrichedGames={enrichedGames} currentPhase={currentPhase} />

      {/* ── MPPD Hero ── */}
      <MppdScore mppd={mppd} />

      {/* ── Phase charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <WinRateByPhase phaseStats={phaseStats} />
        <AggressionByPhase phaseStats={phaseStats} />
      </div>

      {/* ── KDA Trend ── */}
      <KdaTrendLine enrichedGames={enrichedGames} />

      {/* ── NEW: Day-of-week heatmap ── */}
      <DayOfWeekHeatmap enrichedGames={enrichedGames} />

      {/* ── Best/Worst + Bwipo ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <BestWorstDays bestWorstDays={bestWorstDays} />
        <BwipoMeter aggressionScore={currentAggressionScore} />
      </div>

      {/* ── Champion table ── */}
      <ChampionPhaseTable enrichedGames={enrichedGames} />

      {/* ── NEW: Share card ── */}
      <ShareCard
        enrichedGames={enrichedGames}
        phaseStats={phaseStats}
        mppd={mppd}
        currentPhase={currentPhase}
      />
    </div>
  )
}
