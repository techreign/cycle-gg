import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useRiotData } from '../hooks/useRiotData'
import { Button } from '../components/ui/Button'
import type { Region } from '../utils/riotApi'
import { REGIONS } from '../utils/riotApi'

const REGION_OPTIONS = Object.keys(REGIONS) as Region[]

const inputClass =
  'w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 bg-white/5 border border-white/10 focus:outline-none focus:border-violet-400/50 transition-all'

const labelClass = 'block text-xs text-slate-400 font-medium mb-1.5 uppercase tracking-wide'

export function SetupPage() {
  const { cycleConfig, updateCycleConfig, games, setGames: setContextGames } = useApp()
  const riot = useRiotData()

  // ─── Riot form state ─────────────────────────────────────────────────────
  const [gameName, setGameName] = useState('')
  const [tagLine, setTagLine] = useState('')
  const [region, setRegion] = useState<Region>('NA')

  // ─── Cycle form state ────────────────────────────────────────────────────
  const [lastPeriodStart, setLastPeriodStart] = useState(
    cycleConfig?.lastPeriodStart ?? ''
  )
  const [cycleLength, setCycleLength] = useState(cycleConfig?.cycleLength ?? 28)
  const [periodDuration, setPeriodDuration] = useState(cycleConfig?.periodDuration ?? 5)
  const [cycleSaved, setCycleSaved] = useState(false)

  // Sync form when config changes externally
  useEffect(() => {
    if (cycleConfig) {
      setLastPeriodStart(cycleConfig.lastPeriodStart)
      setCycleLength(cycleConfig.cycleLength)
      setPeriodDuration(cycleConfig.periodDuration)
    }
  }, [cycleConfig])

  // ─── Riot: Connect via real API ──────────────────────────────────────────
  async function handleRiotConnect() {
    const trimName = gameName.trim()
    const trimTag = tagLine.trim().replace(/^#/, '')

    if (!trimName || !trimTag) return

    try {
      await riot.connectAccount(trimName, trimTag, region)
      setGameName('')
      setTagLine('')
      // Sync fetched games to React context
      const stored = localStorage.getItem('cycle_gg_games')
      if (stored) {
        setContextGames(JSON.parse(stored))
      }
    } catch {
      // error is already set in the hook
    }
  }

  function handleRiotDisconnect() {
    riot.disconnectAccount()
  }

  // ─── Fetch / Refresh matches ─────────────────────────────────────────────
  async function handleFetchMatches() {
    try {
      await riot.fetchMatches(100)
      // Sync to React context
      const stored = localStorage.getItem('cycle_gg_games')
      if (stored) {
        setContextGames(JSON.parse(stored))
      }
    } catch {
      // error handled by hook
    }
  }

  // ─── Cycle: Save ─────────────────────────────────────────────────────────
  function handleCycleSave() {
    if (!lastPeriodStart) return
    updateCycleConfig({ lastPeriodStart, cycleLength, periodDuration })
    setCycleSaved(true)
    setTimeout(() => setCycleSaved(false), 2500)
  }

  const bothConfigured = riot.isConnected && !!cycleConfig

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Setup</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Connect your account and configure your cycle to get started.
        </p>
      </div>

      {/* ─── Section 1: Connect Your Account ─────────────────────────────── */}
      <section className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold text-white mb-1">Connect Your League Account</h2>
        <p className="text-slate-500 text-sm mb-5">
          Enter your Riot ID to auto-pull match history.
        </p>

        {riot.isConnected && riot.riotConfig ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {riot.riotConfig.gameName}
                  <span className="text-slate-400 font-normal">#{riot.riotConfig.tagLine}</span>
                </p>
                <p className="text-xs text-slate-500">{riot.riotConfig.region} region</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={handleRiotDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {riot.error && (
              <div className="px-4 py-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
                {riot.error}
              </div>
            )}

            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="flex-1">
                <label className={labelClass}>Game Name</label>
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Bwipo"
                  className={inputClass}
                  disabled={riot.isLoading}
                />
              </div>
              <div className="w-full sm:w-32">
                <label className={labelClass}>Tag (no #)</label>
                <input
                  type="text"
                  value={tagLine}
                  onChange={(e) => setTagLine(e.target.value)}
                  placeholder="NA1"
                  maxLength={10}
                  className={inputClass}
                  disabled={riot.isLoading}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className={inputClass + ' cursor-pointer'}
                disabled={riot.isLoading}
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              onClick={handleRiotConnect}
              disabled={riot.isLoading || !gameName.trim() || !tagLine.trim()}
              className="w-full justify-center"
            >
              {riot.isLoading ? 'Connecting & fetching games...' : 'Connect Account'}
            </Button>

            {/* Progress bar during initial connect+fetch */}
            {riot.isLoading && riot.progress && (
              <div className="space-y-2">
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-300"
                    style={{ width: `${riot.progress.total > 0 ? (riot.progress.current / riot.progress.total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Fetching match {riot.progress.current} of {riot.progress.total}...
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ─── Section 2: Your Cycle ────────────────────────────────────────── */}
      <section className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold text-white mb-1">Set Your Cycle</h2>
        <p className="text-slate-500 text-sm mb-5">
          We'll use this to map your cycle phases to your game history going back ~6 months.
        </p>

        {cycleSaved && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
            Cycle saved! Periods generated automatically.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={labelClass}>When did your last period start?</label>
            <input
              type="date"
              value={lastPeriodStart}
              onChange={(e) => setLastPeriodStart(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className={inputClass + ' cursor-pointer'}
            />
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1">
              <label className={labelClass}>Average cycle length</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={21}
                  max={35}
                  value={cycleLength}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (v >= 21 && v <= 35) setCycleLength(v)
                  }}
                  className={inputClass}
                />
                <span className="text-slate-500 text-sm whitespace-nowrap">days</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Range: 21–35</p>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Period duration</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={3}
                  max={7}
                  value={periodDuration}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (v >= 3 && v <= 7) setPeriodDuration(v)
                  }}
                  className={inputClass}
                />
                <span className="text-slate-500 text-sm whitespace-nowrap">days</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Range: 3–7</p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleCycleSave}
            disabled={!lastPeriodStart}
            className="w-full justify-center"
          >
            {cycleConfig ? 'Update Cycle' : 'Save Cycle'}
          </Button>
        </div>

        {cycleConfig && (
          <p className="text-xs text-slate-500 mt-4">
            Currently set: last period started <span className="text-slate-300">{cycleConfig.lastPeriodStart}</span>,
            {' '}{cycleConfig.cycleLength}-day cycle, {cycleConfig.periodDuration}-day duration.
          </p>
        )}
      </section>

      {/* ─── Section 3: Match History ─────────────────────────────────────── */}
      {bothConfigured && (
        <section className="glass-card p-6">
          <h2 className="text-base font-bold text-white mb-1">Match History</h2>
          <p className="text-slate-500 text-sm mb-5">
            Fetch your recent games to see how your cycle affects your performance.
          </p>

          {riot.error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
              {riot.error}
            </div>
          )}

          {/* Progress bar */}
          {riot.isLoading && riot.progress && (
            <div className="mb-4 space-y-2">
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${riot.progress.total > 0 ? (riot.progress.current / riot.progress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                Fetching match {riot.progress.current} of {riot.progress.total}...
              </p>
            </div>
          )}

          {games.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400 flex-shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-white">{games.length} games</span> loaded.
                  {riot.lastFetchTime && (
                    <span className="text-slate-500">
                      {' '}Last updated: {new Date(riot.lastFetchTime).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-3 flex-col sm:flex-row">
                <Link
                  to="/dashboard"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:from-pink-400 hover:to-violet-400 transition-all"
                >
                  View Dashboard
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Button
                  variant="secondary"
                  className="flex-1 justify-center"
                  onClick={handleFetchMatches}
                  disabled={riot.isLoading}
                >
                  {riot.isLoading ? 'Fetching...' : 'Refresh Games'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={handleFetchMatches}
                disabled={riot.isLoading}
              >
                {riot.isLoading ? 'Fetching matches...' : 'Fetch Match History'}
              </Button>
            </div>
          )}
        </section>
      )}

      {!bothConfigured && (
        <p className="text-xs text-slate-600 text-center mt-2">
          Complete both sections above to unlock match history fetching.
        </p>
      )}
    </div>
  )
}
