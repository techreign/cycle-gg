import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRiotData } from '../hooks/useRiotData'
import { useApp } from '../context/AppContext'
import { REGIONS, type Region } from '../utils/riotApi'

const REGION_OPTIONS = Object.keys(REGIONS) as Region[]

const BWIPO_QUOTES = [
  "I don't need vision. I need respect.",
  "Every fight is winnable if you want it enough.",
  "The play wasn't wrong. The result was.",
  "Why ward when you can die with information?",
  "If I die, I die with style.",
]

export function LandingPage() {
  const navigate = useNavigate()
  const riot = useRiotData()
  const { updateCycleConfig, setGames: setContextGames } = useApp()

  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState<Region>('NA')
  const [periodStart, setPeriodStart] = useState('')
  const [cycleLength, setCycleLength] = useState(28)
  const [showPeriod, setShowPeriod] = useState(false)

  const randomQuote = BWIPO_QUOTES[Math.floor(Date.now() / 60000) % BWIPO_QUOTES.length]

  async function handleGo() {
    const parts = riotId.split('#')
    const gameName = parts[0]?.trim()
    const tagLine = parts[1]?.trim()
    if (!gameName || !tagLine) return

    if (periodStart) {
      updateCycleConfig({ lastPeriodStart: periodStart, cycleLength, periodDuration: 5 })
    }

    try {
      await riot.connectAccount(gameName, tagLine, region)
      const stored = localStorage.getItem('cycle_gg_games')
      if (stored) setContextGames(JSON.parse(stored))
      navigate('/dashboard')
    } catch {
      // error shown inline
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#070510' }}>

      {/* ─── Top bar ──────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-6">
          <span className="text-lg font-black gradient-text tracking-tight">Cycle.gg</span>
          <div className="hidden md:flex items-center gap-5 text-sm text-slate-500">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#stats" className="hover:text-white transition-colors">The Data</a>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600 hidden sm:inline">Inspired by @SaskioLoL</span>
        </div>
      </nav>

      {/* ─── Hero: Centered search (op.gg style) ──────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-10">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
            style={{ background: '#ec4899' }} />
          <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
            style={{ background: '#8b5cf6' }} />
        </div>

        <div className="relative z-10 w-full max-w-xl mx-auto text-center">
          {/* Logo / Title */}
          <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tight">
            <span className="gradient-text">Cycle</span>
            <span className="text-white">.gg</span>
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Period cycle + League of Legends performance tracker
          </p>

          {/* ─── Search Card ──────────────────────────────────────── */}
          <div className="rounded-2xl p-1" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(139,92,246,0.3))' }}>
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#0d0a18' }}>

              {/* Region tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {REGION_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      region === r
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  placeholder="Game Name + #Tag"
                  className="w-full px-4 py-3.5 rounded-xl text-base text-white placeholder-slate-600 bg-white/5 border border-white/10 focus:outline-none focus:border-pink-400/50 transition-all pr-24"
                  disabled={riot.isLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleGo()}
                />
                <button
                  onClick={handleGo}
                  disabled={riot.isLoading || !riotId.includes('#')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {riot.isLoading ? '...' : '.GG'}
                </button>
              </div>

              {/* Period toggle */}
              {!showPeriod ? (
                <button
                  onClick={() => setShowPeriod(true)}
                  className="w-full py-2 text-xs text-slate-500 hover:text-pink-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>🩸</span>
                  <span>Add period data for cycle analysis</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              ) : (
                <div className="flex gap-2 items-end pt-1">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-600 mb-1 uppercase tracking-wider">Last period start</label>
                    <input
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      max={new Date().toISOString().slice(0, 10)}
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-pink-400/50 cursor-pointer"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] text-slate-600 mb-1 uppercase tracking-wider">Cycle</label>
                    <input
                      type="number"
                      value={cycleLength}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        if (v >= 21 && v <= 35) setCycleLength(v)
                      }}
                      min={21} max={35}
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-pink-400/50 text-center"
                    />
                  </div>
                  <span className="text-slate-600 text-xs pb-3">days</span>
                </div>
              )}

              {/* Error */}
              {riot.error && (
                <div className="px-3 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {riot.error}
                </div>
              )}

              {/* Progress */}
              {riot.isLoading && riot.progress && riot.progress.total > 0 && (
                <div className="space-y-1.5">
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${(riot.progress.current / riot.progress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 text-center">
                    Fetching match {riot.progress.current} of {riot.progress.total}
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-700 mt-3">
            Enter your Riot ID to auto-pull match history and analyze performance by cycle phase
          </p>
        </div>

        {/* ─── Bwipo floating card ─────────────────────────────────── */}
        <div className="relative z-10 mt-12 max-w-md mx-auto w-full">
          <div className="glass-card p-4 bwipo-glow flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/20 to-violet-500/20 border border-rose-500/30 flex items-center justify-center text-2xl">
              😤
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-white">Bwipo Mode</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">Live</span>
              </div>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                "{randomQuote}"
              </p>
              <p className="text-[10px] text-slate-600 mt-1.5">
                Activates when your aggression score exceeds 8.6
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Stats strip (below the fold) ─────────────────────────── */}
      <section id="stats" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
            The Data <span className="gradient-text">Don't Lie</span>
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            SaskioLoL tracked 147 games with his duo and found period cycles directly affect playstyle.
          </p>
        </div>

        {/* Big stat numbers */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="glass-card p-5 text-center">
            <p className="text-3xl md:text-4xl font-black gradient-text">5.5%</p>
            <p className="text-xs text-slate-500 mt-1">Win rate swing</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl md:text-4xl font-black text-rose-400">8.6</p>
            <p className="text-xs text-slate-500 mt-1">Aggression on period</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl md:text-4xl font-black text-violet-400">4.85</p>
            <p className="text-xs text-slate-500 mt-1">Aggression off period</p>
          </div>
        </div>

        {/* Bwipo quote section */}
        <div className="glass-card p-6 md:p-8 bwipo-glow text-center max-w-2xl mx-auto">
          <p className="text-3xl mb-4">😤</p>
          <blockquote className="text-lg md:text-xl text-slate-200 italic mb-2 leading-relaxed">
            "Women shouldn't play competitive during their period"
          </blockquote>
          <p className="text-xs text-slate-600 mb-6">— Some guy, probably.</p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Prove them wrong. Or prove them right.{' '}
            <span className="text-white font-semibold">Either way, you'll have the data.</span>
          </p>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────── */}
      <section id="how" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-white text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([
            { step: '1', icon: '🎮', title: 'Connect', desc: 'Enter your Riot ID — we pull your match history automatically' },
            { step: '2', icon: '🩸', title: 'Log', desc: 'Add your last period start date and cycle length' },
            { step: '3', icon: '📊', title: 'Discover', desc: 'See win rates, aggression, and KDA broken down by cycle phase' },
          ] as const).map((item) => (
            <div key={item.step} className="glass-card p-5 text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold mb-2">{item.step}</div>
              <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { emoji: '📈', label: 'MPPD Score' },
            { emoji: '🗓️', label: 'Phase Calendar' },
            { emoji: '⚔️', label: 'Champion Stats' },
            { emoji: '😤', label: 'Bwipo Mode' },
          ] as const).map((f) => (
            <div key={f.label} className="glass-card p-4 text-center hover:border-pink-500/30 transition-all cursor-default">
              <div className="text-xl mb-1">{f.emoji}</div>
              <p className="text-xs font-medium text-slate-400">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="px-6 py-8 text-center border-t border-white/5">
        <p className="text-slate-700 text-xs">
          Cycle.gg • Inspired by{' '}
          <a href="https://twitter.com/SaskioLoL" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-400 transition-colors">
            @SaskioLoL
          </a>
          {' '}• Not affiliated with Riot Games
        </p>
      </footer>
    </div>
  )
}
