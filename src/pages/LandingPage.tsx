import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRiotData } from '../hooks/useRiotData'
import { useApp } from '../hooks/useApp'
import type { Region } from '../utils/riotApi'

const REGION_OPTIONS: { value: Region; label: string }[] = [
  { value: 'NA', label: 'North America' },
  { value: 'EUW', label: 'Europe West' },
  { value: 'EUNE', label: 'Europe Nordic & East' },
  { value: 'KR', label: 'Korea' },
  { value: 'JP', label: 'Japan' },
  { value: 'BR', label: 'Brazil' },
  { value: 'LAN', label: 'LAN' },
  { value: 'LAS', label: 'LAS' },
  { value: 'OCE', label: 'Oceania' },
  { value: 'TR', label: 'Turkey' },
  { value: 'RU', label: 'Russia' },
  { value: 'PH', label: 'Philippines' },
  { value: 'SG', label: 'Singapore' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'ME', label: 'Middle East' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const riot = useRiotData()
  const { updateCycleConfig, setGames: setContextGames } = useApp()

  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState<Region>('NA')
  const [periodStart, setPeriodStart] = useState('')
  const [cycleLength, setCycleLength] = useState(28)

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#110a0a' }}>
      {/* Ambient glows — warm burgundy/rose */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
          style={{ background: '#9f1239' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
          style={{ background: '#be123c' }} />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px] opacity-8"
          style={{ background: '#c2410c' }} />
      </div>

      <div className="relative z-10 w-full max-w-[660px] mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            <span style={{ background: 'linear-gradient(135deg, #fb7185, #e11d48, #9f1239)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Cycle</span>
            <span className="text-white">.gg</span>
          </h1>
          <p className="text-rose-900/60 text-xs mt-1.5">does your period affect your LP?</p>
        </div>

        {/* ─── op.gg-style search bar ───────────────────────────────── */}
        <div className="rounded-full flex items-center h-[60px] overflow-hidden" style={{ backgroundColor: '#1f1215' }}>
          {/* Region selector */}
          <div className="flex-shrink-0 pl-5 pr-4 h-full flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 font-medium leading-none mb-1">Region</span>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className="appearance-none bg-transparent text-white text-sm font-medium pr-5 cursor-pointer focus:outline-none"
                disabled={riot.isLoading}
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-[#1f1215] text-white">
                    {r.label}
                  </option>
                ))}
              </select>
              <svg className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          {/* Search input */}
          <div className="flex-1 pl-4 h-full flex flex-col justify-center min-w-0">
            <span className="text-[10px] text-slate-500 font-medium leading-none mb-1">Search</span>
            <input
              type="text"
              value={riotId}
              onChange={(e) => setRiotId(e.target.value)}
              placeholder={`Game name + #${region}1`}
              className="bg-transparent text-white text-sm placeholder-slate-600 focus:outline-none w-full"
              disabled={riot.isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleGo()}
            />
          </div>

          {/* .GG button */}
          <button
            onClick={handleGo}
            disabled={riot.isLoading || !riotId.includes('#')}
            className="flex-shrink-0 h-full px-5 flex items-center text-lg font-black text-rose-400 hover:text-rose-300 disabled:text-rose-900/40 disabled:cursor-not-allowed transition-colors"
          >
            {riot.isLoading ? '...' : '.GG'}
          </button>
        </div>

        {/* Error */}
        {riot.error && (
          <div className="mt-3 px-4 py-2 rounded-lg bg-red-900/20 border border-red-800/30 text-rose-300 text-xs text-center">
            {riot.error}
          </div>
        )}

        {/* Progress */}
        {riot.isLoading && riot.progress && riot.progress.total > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-red-800 rounded-full transition-all duration-300"
                style={{ width: `${(riot.progress.current / riot.progress.total) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 text-center">
              Fetching match {riot.progress.current} of {riot.progress.total}
            </p>
          </div>
        )}

        {/* ─── Period data row ──────────────────────────────────────── */}
        <div className="mt-4 rounded-2xl flex items-center gap-3 px-5 py-3" style={{ backgroundColor: '#1f1215' }}>
          <span className="text-sm">🩸</span>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Last period start</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="bg-transparent text-white text-sm focus:outline-none cursor-pointer w-full"
            />
          </div>
          <div className="w-px h-8 bg-white/10 flex-shrink-0" />
          <div className="w-20">
            <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Cycle length</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={cycleLength}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (v >= 21 && v <= 35) setCycleLength(v)
                }}
                min={21} max={35}
                className="bg-transparent text-white text-sm focus:outline-none w-10 text-center"
              />
              <span className="text-slate-600 text-xs">days</span>
            </div>
          </div>
        </div>

        {/* ─── Bwipo meme ───────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="rounded-xl overflow-hidden border border-white/10 w-[300px]">
            <div style={{ position: 'relative', paddingBottom: '56%' }}>
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

          <div className="px-4 py-2 rounded-lg text-center" style={{ backgroundColor: '#1f1215' }}>
            <p className="text-xs text-slate-400 italic">
              "tracking my duo's menstrual cycle increased my winrate by 5.5%"
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">— a League player, probably</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-rose-900/40 text-[11px] text-center mt-8">
          free forever • not affiliated with Riot Games
          <br />
          © {new Date().getFullYear()} Cycle.gg. All rights reserved.
        </p>
      </div>
    </div>
  )
}
