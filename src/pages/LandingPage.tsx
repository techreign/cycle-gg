import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRiotData } from '../hooks/useRiotData'
import { useApp } from '../context/AppContext'
import { REGIONS, type Region } from '../utils/riotApi'

const REGION_OPTIONS = Object.keys(REGIONS) as Region[]

export function LandingPage() {
  const navigate = useNavigate()
  const riot = useRiotData()
  const { updateCycleConfig, setGames: setContextGames } = useApp()

  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState<Region>('NA')
  const [periodStart, setPeriodStart] = useState('')
  const [cycleLength, setCycleLength] = useState(28)
  const [showPeriod, setShowPeriod] = useState(false)

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#070510' }}>
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] opacity-12"
          style={{ background: '#ec4899' }} />
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] rounded-full blur-[120px] opacity-8"
          style={{ background: '#8b5cf6' }} />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            <span className="gradient-text">Cycle</span>
            <span className="text-white">.gg</span>
          </h1>
          <p className="text-slate-600 text-xs mt-1">does your period affect your LP?</p>
        </div>

        {/* ─── Search Card ──────────────────────────────────────────── */}
        <div className="rounded-2xl p-1" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(139,92,246,0.25))' }}>
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
                      : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
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
                className="w-full py-2 text-xs text-slate-600 hover:text-pink-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🩸</span>
                <span>add period data</span>
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

        {/* ─── Bwipo Meme Section ───────────────────────────────────── */}
        <div className="mt-10 space-y-4">
          {/* Wide Bwipo GIF */}
          <div className="flex justify-center">
            <div className="rounded-xl overflow-hidden border border-white/10 w-[300px]">
              <div className="tenor-gif-embed" style={{ position: 'relative', paddingBottom: '56%' }}>
                <iframe
                  src="https://tenor.com/embed/18950908"
                  width="100%"
                  height="100%"
                  style={{ position: 'absolute', top: 0, left: 0, border: 'none' }}
                  allowFullScreen
                  title="Wide Bwipo"
                />
              </div>
            </div>
          </div>

          {/* SaskioLoL quote */}
          <div className="glass-card px-5 py-3 text-center max-w-sm mx-auto">
            <p className="text-sm text-slate-300 italic">
              "tracking my duo's menstrual cycle increased my winrate by 5.5%"
            </p>
            <p className="text-[10px] text-slate-600 mt-1">— @SaskioLoL, probably</p>
          </div>

          {/* Bwipo Fnatic GIF */}
          <div className="flex justify-center">
            <div className="rounded-xl overflow-hidden border border-white/10 w-[300px]">
              <div style={{ position: 'relative', paddingBottom: '56%' }}>
                <iframe
                  src="https://tenor.com/embed/16508075"
                  width="100%"
                  height="100%"
                  style={{ position: 'absolute', top: 0, left: 0, border: 'none' }}
                  allowFullScreen
                  title="Bwipo Fnatic"
                />
              </div>
            </div>
          </div>

          {/* Bwipo mode teaser */}
          <div className="glass-card px-5 py-3 text-center max-w-sm mx-auto bwipo-glow">
            <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">😤 Bwipo Mode</p>
            <p className="text-[11px] text-slate-500">
              when your aggression score exceeds 8.6, you've entered Bwipo territory
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-slate-700 text-[11px] text-center mt-8">
          free forever • inspired by @SaskioLoL • not affiliated with Riot Games
        </p>
      </div>
    </div>
  )
}
