import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { useRiotData } from '../hooks/useRiotData'
import { Button } from '../components/ui/Button'
import type { Region } from '../utils/riotApi'
import { REGIONS } from '../utils/riotApi'

const REGION_OPTIONS = Object.keys(REGIONS) as Region[]

const inputClass = 'field'
const labelClass = 'field-label'

export function SetupPage() {
  const { cycleConfig, updateCycleConfig, games, setGames: setContextGames } = useApp()
  const riot = useRiotData()

  // ─── Riot form state ─────────────────────────────────────────────────────
  const [gameName, setGameName] = useState('')
  const [tagLine, setTagLine] = useState('')
  const [region, setRegion] = useState<Region>('NA')

  // ─── Cycle form state — initialized from config, reset via key prop ─────
  const [lastPeriodStart, setLastPeriodStart] = useState(cycleConfig?.lastPeriodStart ?? '')
  const [cycleLength, setCycleLength] = useState(cycleConfig?.cycleLength ?? 28)
  const [periodDuration, setPeriodDuration] = useState(cycleConfig?.periodDuration ?? 5)
  const [cycleSaved, setCycleSaved] = useState(false)

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
      <div className="mb-8 fade-up">
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Setup</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Connect your account and configure your cycle to get started.
        </p>
      </div>

      {/* ─── Section 1: Connect Your Account ─────────────────────────────── */}
      <section className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Connect Your League Account</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
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
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {riot.riotConfig.gameName}
                  <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>#{riot.riotConfig.tagLine}</span>
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{riot.riotConfig.region} region</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={handleRiotDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {riot.error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.3)', color: '#fb7185' }}>
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
                  <option key={r} value={r} style={{ backgroundColor: '#1f1215', color: '#f8e4e7' }}>
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
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${riot.progress.total > 0 ? (riot.progress.current / riot.progress.total) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, #fb7185, #e11d48)',
                    }}
                  />
                </div>
                <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                  Fetching match {riot.progress.current} of {riot.progress.total}...
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ─── Section 2: Your Cycle ────────────────────────────────────────── */}
      <section className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Set Your Cycle</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
          We'll use this to map your cycle phases to your game history going back ~6 months.
        </p>

        {cycleSaved && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
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
                <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>days</span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>Range: 21–35</p>
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
                <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>days</span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>Range: 3–7</p>
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
          <p className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
            Currently set: last period started <span style={{ color: 'var(--color-text-secondary)' }}>{cycleConfig.lastPeriodStart}</span>,
            {' '}{cycleConfig.cycleLength}-day cycle, {cycleConfig.periodDuration}-day duration.
          </p>
        )}
      </section>

      {/* ─── Section 3: Match History ─────────────────────────────────────── */}
      {bothConfigured && (
        <section className="glass-card p-6">
          <h2 className="text-base font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Match History</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
            Fetch your recent games to see how your cycle affects your performance.
          </p>

          {riot.error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.3)', color: '#fb7185' }}>
              {riot.error}
            </div>
          )}

          {riot.isLoading && riot.progress && (
            <div className="mb-4 space-y-2">
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${riot.progress.total > 0 ? (riot.progress.current / riot.progress.total) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, #fb7185, #e11d48)',
                  }}
                />
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                Fetching match {riot.progress.current} of {riot.progress.total}...
              </p>
            </div>
          )}

          {games.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fb7185' }} className="flex-shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{games.length} games</span> loaded.
                  {riot.lastFetchTime && (
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {' '}Last updated: {new Date(riot.lastFetchTime).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-3 flex-col sm:flex-row">
                <Link
                  to="/dashboard"
                  className="btn-rose-gradient flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg"
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
        <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-faint)' }}>
          Complete both sections above to unlock match history fetching.
        </p>
      )}
    </div>
  )
}
