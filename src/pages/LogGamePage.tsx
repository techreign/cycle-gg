import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { PhaseChip } from '../components/ui/PhaseChip'
import { Button } from '../components/ui/Button'
import type { CyclePhase } from '../types'
import { PHASE_CONFIG } from '../constants/phases'

type Role = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support'

const ROLES: Role[] = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']

const ROLE_ICONS: Record<Role, string> = {
  Top: '🗡️',
  Jungle: '🌿',
  Mid: '⚡',
  ADC: '🏹',
  Support: '🛡️',
}

function todayYMD(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function phaseLabel(phase: CyclePhase): string {
  if (phase === 'unknown') return 'Unknown'
  return PHASE_CONFIG[phase].label
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[Number(m) - 1]} ${Number(d)}, ${y}`
}

const EMPTY_FORM = {
  win: null as boolean | null,
  champion: '',
  role: '' as Role | '',
  kills: '',
  deaths: '',
  assists: '',
  damage: '',
  notes: '',
}

export function LogGamePage() {
  const { enrichedGames, addGame, removeGame, currentPhase } = useApp()

  const [form, setForm] = useState(EMPTY_FORM)
  const [successMsg, setSuccessMsg] = useState<{ phase: CyclePhase } | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  function validate(): string[] {
    const errs: string[] = []
    if (form.win === null) errs.push('Please select Win or Loss.')
    if (!form.champion.trim()) errs.push('Champion is required.')
    if (!form.role) errs.push('Role is required.')
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccessMsg(null)

    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    setErrors([])

    addGame({
      date: todayYMD(),
      win: form.win!,
      champion: form.champion.trim(),
      role: form.role,
      kills: Number(form.kills) || 0,
      deaths: Number(form.deaths) || 0,
      assists: Number(form.assists) || 0,
      damageDealt: Number(form.damage) || 0,
      notes: form.notes.trim() || undefined,
    })

    setSuccessMsg({ phase: currentPhase })
    setForm(EMPTY_FORM)
  }

  // Show the 10 most recent enriched games
  const recentGames = [...enrichedGames]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8 fade-up">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Log a Game</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Games are tagged with your current cycle phase.
          </p>
        </div>
        <div className="ml-auto">
          <PhaseChip phase={currentPhase} size="md" />
        </div>
      </div>

      {/* Success Toast */}
      {successMsg !== null && (
        <div className="glass-card mb-6 p-4 flex items-center gap-3 border-emerald-500/30 bg-emerald-500/10">
          <span className="text-emerald-400 text-xl">✓</span>
          <span className="text-emerald-300 text-sm font-medium">
            Game logged! Tagged as{' '}
            <span className="font-bold">{phaseLabel(successMsg.phase)}</span> phase.
          </span>
          <button
            onClick={() => setSuccessMsg(null)}
            className="ml-auto text-emerald-600 hover:text-emerald-400 transition-colors"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Game Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 mb-8 fade-up-2">
        <h2 className="section-heading">Game Details</h2>

        {/* Win / Loss Toggle */}
        <div className="mb-6">
          <label className="field-label">Result</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, win: true }))}
              className={[
                'py-4 rounded-xl text-lg font-black tracking-wide transition-all border-2',
                form.win === true
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'border-white/10 hover:border-white/20',
              ].join(' ')}
              style={form.win === true ? undefined : { color: 'var(--color-text-muted)' }}
            >
              WIN
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, win: false }))}
              className={[
                'py-4 rounded-xl text-lg font-black tracking-wide transition-all border-2',
                form.win === false
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                  : 'border-white/10 hover:border-white/20',
              ].join(' ')}
              style={form.win === false ? undefined : { color: 'var(--color-text-muted)' }}
            >
              LOSS
            </button>
          </div>
        </div>

        {/* Champion */}
        <div className="mb-5">
          <label className="field-label">Champion</label>
          <input
            type="text"
            value={form.champion}
            onChange={(e) => setForm((f) => ({ ...f, champion: e.target.value }))}
            placeholder="e.g. Tristana"
            className="field"
          />
        </div>

        {/* Role */}
        <div className="mb-5">
          <label className="field-label">Role</label>
          <div className="flex gap-2 flex-wrap">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role }))}
                className="flex-1 min-w-[80px] py-2.5 rounded-lg text-sm font-semibold transition-all border"
                style={
                  form.role === role
                    ? { background: 'rgba(251, 113, 133, 0.18)', borderColor: '#fb7185', color: '#fb7185' }
                    : { borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }
                }
              >
                <span className="mr-1">{ROLE_ICONS[role]}</span>
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* KDA */}
        <div className="mb-5">
          <label className="field-label">KDA</label>
          <div className="grid grid-cols-3 gap-3">
            {(['kills', 'deaths', 'assists'] as const).map((stat) => (
              <div key={stat}>
                <input
                  type="number"
                  min="0"
                  value={form[stat]}
                  onChange={(e) => setForm((f) => ({ ...f, [stat]: e.target.value }))}
                  placeholder="0"
                  className="field text-center"
                />
                <p className="text-center text-xs mt-1 capitalize" style={{ color: 'var(--color-text-muted)' }}>{stat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Damage */}
        <div className="mb-5">
          <label className="field-label">
            Damage Dealt <span className="normal-case" style={{ color: 'var(--color-text-faint)' }}>(optional)</span>
          </label>
          <input
            type="number"
            min="0"
            value={form.damage}
            onChange={(e) => setForm((f) => ({ ...f, damage: e.target.value }))}
            placeholder="e.g. 25000"
            className="field"
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="field-label">
            Notes <span className="normal-case" style={{ color: 'var(--color-text-faint)' }}>(optional)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="How did you feel? Any tilt? Unusual focus?"
            rows={3}
            className="field resize-none"
          />
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.25)' }}>
            {errors.map((err) => (
              <p key={err} className="text-sm" style={{ color: '#fb7185' }}>{err}</p>
            ))}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full justify-center font-bold">
          Log Game
        </Button>
      </form>

      {/* Recent Games */}
      <div>
        <h2 className="section-heading">Recent Games</h2>

        {recentGames.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No games logged yet. Log your first game above.
          </div>
        ) : (
          <div className="space-y-3">
            {recentGames.map((game) => {
              const kda =
                game.deaths === 0
                  ? 'Perfect'
                  : ((game.kills + game.assists) / game.deaths).toFixed(2)

              return (
                <div
                  key={game.id}
                  className="glass-card p-4 flex items-center gap-3"
                >
                  {/* W/L Badge */}
                  <span
                    className={[
                      'shrink-0 text-xs font-black px-2 py-1 rounded-md',
                      game.win
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400',
                    ].join(' ')}
                  >
                    {game.win ? 'W' : 'L'}
                  </span>

                  {/* Champion + date */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {game.champion || '—'}
                      {game.role && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>{game.role}</span>
                      )}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {formatDate(game.date)} · KDA {kda}
                      {game.damageDealt > 0 && ` · ${(game.damageDealt / 1000).toFixed(1)}k dmg`}
                    </p>
                  </div>

                  {/* Phase chip */}
                  <PhaseChip phase={game.phase} size="sm" />

                  {/* Delete */}
                  <button
                    onClick={() => removeGame(game.id)}
                    className="shrink-0 p-2 rounded-lg transition-all hover:bg-rose-500/10"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-label="Delete game"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
