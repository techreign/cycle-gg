import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatCard } from '../components/ui/StatCard'
import { Button } from '../components/ui/Button'
import { GradientCard } from '../components/ui/GradientCard'
import { useRiotData } from '../hooks/useRiotData'
import { useApp } from '../context/AppContext'
import { REGIONS, type Region } from '../utils/riotApi'

const REGION_OPTIONS = Object.keys(REGIONS) as Region[]

const inputClass =
  'w-full px-3 py-3 rounded-lg text-sm text-white placeholder-slate-500 bg-white/5 border border-white/10 focus:outline-none focus:border-pink-400/50 transition-all'

export function LandingPage() {
  const navigate = useNavigate()
  const riot = useRiotData()
  const { updateCycleConfig, setGames: setContextGames } = useApp()

  // Search bar state
  const [riotId, setRiotId] = useState('') // "Name#Tag" format
  const [region, setRegion] = useState<Region>('NA')

  // Period state
  const [periodStart, setPeriodStart] = useState('')
  const [cycleLength, setCycleLength] = useState(28)

  async function handleGo() {
    // Parse Riot ID
    const parts = riotId.split('#')
    const gameName = parts[0]?.trim()
    const tagLine = parts[1]?.trim()

    if (!gameName || !tagLine) return

    // Save cycle config
    if (periodStart) {
      updateCycleConfig({ lastPeriodStart: periodStart, cycleLength, periodDuration: 5 })
    }

    try {
      // Connect & fetch games
      await riot.connectAccount(gameName, tagLine, region)

      // Sync to React context
      const stored = localStorage.getItem('cycle_gg_games')
      if (stored) setContextGames(JSON.parse(stored))

      navigate('/dashboard')
    } catch {
      // Error shows inline
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-deep)' }}>
      {/* ─── Hero Section with Search ─────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 glass-card text-slate-300">
            <span>🩸</span>
            <span>Cycle-aware League analytics</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-4">
            <span className="gradient-text">Your Cycle.</span>
            <br />
            <span className="text-white">Your Meta.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            See how your period cycle affects your League of Legends performance.
          </p>

          {/* ─── op.gg-style Search Box ─────────────────────────────── */}
          <div className="max-w-lg mx-auto glass-card p-5 space-y-4">
            {/* Riot ID + Region row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  placeholder="Riot ID (e.g. Bwipo#EUW)"
                  className={inputClass + ' text-base'}
                  disabled={riot.isLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleGo()}
                />
              </div>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className="px-3 py-3 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-pink-400/50 cursor-pointer"
                disabled={riot.isLoading}
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r} className="bg-slate-900">{r}</option>
                ))}
              </select>
            </div>

            {/* Period row */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Last period start</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className={inputClass + ' cursor-pointer'}
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-slate-500 mb-1">Cycle (days)</label>
                <input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (v >= 21 && v <= 35) setCycleLength(v)
                  }}
                  min={21}
                  max={35}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Error */}
            {riot.error && (
              <div className="px-3 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
                {riot.error}
              </div>
            )}

            {/* Progress bar */}
            {riot.isLoading && riot.progress && riot.progress.total > 0 && (
              <div className="space-y-1">
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-300"
                    style={{ width: `${(riot.progress.current / riot.progress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Fetching match {riot.progress.current} of {riot.progress.total}...
                </p>
              </div>
            )}

            {/* Go button */}
            <button
              onClick={handleGo}
              disabled={riot.isLoading || !riotId.includes('#')}
              className="w-full py-3 rounded-lg text-base font-bold text-white bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {riot.isLoading ? 'Fetching your games...' : 'Track My Cycle →'}
            </button>
          </div>

          <p className="text-sm text-slate-600 mt-6">
            Inspired by{' '}
            <a
              href="https://twitter.com/SaskioLoL"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-pink-400 transition-colors underline underline-offset-2"
            >
              @SaskioLoL
            </a>
            's viral discovery
          </p>
        </div>
      </section>

      {/* ─── Discovery Section ────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            The Data <span className="gradient-text">Don't Lie</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Real numbers from a real tracking experiment. Are yours different?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <StatCard title="Win Rate Swing" value="+5.5%" subtitle="higher off period" trend="up" />
          <StatCard title="Aggression On Period" value="8.6/10" subtitle="based on damage + deaths" trend="up" />
          <StatCard title="Aggression Off Period" value="4.85/10" subtitle="calculated, fewer deaths" trend="down" />
        </div>

        <div className="glass-card p-6 md:p-8">
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            <span className="text-white font-semibold">SaskioLoL tracked 147 games</span> with
            his duo and found that her period directly affected her playstyle — aggression
            spikes, win rate dips. Is it the same for you?{' '}
            <span className="gradient-text font-semibold">Cycle.gg helps you find out.</span>
          </p>
        </div>
      </section>

      {/* ─── Features Grid ────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Everything You Need</h2>
          <p className="text-slate-400">Built for the data-driven gamer.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { emoji: '🩸', title: 'Cycle Tracking', desc: 'Enter your period start date — we map phases to your game history automatically' },
            { emoji: '🎮', title: 'Auto Game Import', desc: 'Connect your Riot account, we pull your match history instantly' },
            { emoji: '📊', title: 'MPPD Score', desc: 'Your personal Mean Period Performance Deviation — like GPI but for your cycle' },
            { emoji: '😤', title: 'Bwipo Mode', desc: "When aggression goes over 8.6... you've entered Bwipo territory" },
          ] as const).map((feature) => (
            <div key={feature.title} className="glass-card p-6 hover:border-white/20 transition-all">
              <div className="text-3xl mb-4">{feature.emoji}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bwipo Section ────────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-3xl mx-auto">
        <GradientCard className="bwipo-glow text-center">
          <div className="text-5xl mb-6">😤</div>
          <blockquote className="text-xl md:text-2xl text-slate-200 italic mb-3 leading-relaxed">
            "Women shouldn't play competitive during their period"
          </blockquote>
          <p className="text-sm text-slate-500 mb-10">— Some guy, probably.</p>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-10">
            Prove them wrong. Or prove them right.{' '}
            <span className="text-white font-semibold">Either way, you'll have the data.</span>
          </p>
          <Button size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-bold">
            Get Started
          </Button>
        </GradientCard>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="px-6 py-10 text-center border-t border-white/5">
        <p className="text-slate-600 text-sm">
          Cycle.gg v1.0 • Inspired by @SaskioLoL • Built with 💜
        </p>
      </footer>
    </div>
  )
}
