import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { getUserRiotKey, setUserRiotKey, clearUserRiotKey } from '../utils/riotApi'

export function SettingsPage() {
  const { averageCycleLength } = useApp()

  const [apiKey, setApiKey] = useState(() => getUserRiotKey() ?? '')
  const [keyStatus, setKeyStatus] = useState<'idle' | 'saved' | 'cleared'>('idle')
  const [showKey, setShowKey] = useState(false)
  const [cycleLength, setCycleLength] = useState(averageCycleLength)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearDone, setClearDone] = useState(false)

  function handleSaveKey() {
    const trimmed = apiKey.trim()
    if (!trimmed) return
    setUserRiotKey(trimmed)
    setKeyStatus('saved')
    setTimeout(() => setKeyStatus('idle'), 2500)
  }

  function handleClearKey() {
    clearUserRiotKey()
    setApiKey('')
    setKeyStatus('cleared')
    setTimeout(() => setKeyStatus('idle'), 2500)
  }

  // ─── Export ──────────────────────────────────────────────────────────────
  function handleExport() {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key !== null) {
        const raw = localStorage.getItem(key)
        if (raw !== null) {
          try {
            data[key] = JSON.parse(raw) as unknown
          } catch {
            data[key] = raw
          }
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cycle-gg-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Import ──────────────────────────────────────────────────────────────
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError('')
    setImportSuccess(false)
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const result = ev.target?.result
        if (typeof result !== 'string') {
          setImportError('Could not read file.')
          return
        }
        const parsed = JSON.parse(result) as Record<string, unknown>
        for (const [key, value] of Object.entries(parsed)) {
          localStorage.setItem(key, JSON.stringify(value))
        }
        setImportSuccess(true)
        // Reset file input
        e.target.value = ''
      } catch {
        setImportError('Invalid JSON file. Please use a valid Cycle.gg export.')
      }
    }
    reader.readAsText(file)
  }

  // ─── Clear All ───────────────────────────────────────────────────────────
  function handleClearConfirm() {
    localStorage.clear()
    setClearDone(true)
    setShowClearModal(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 fade-up">
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Manage your account and data.</p>
      </div>

      {/* ─── Riot Developer Key (BYO) ─────────────────────────────────────── */}
      <section className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Riot API Key</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Cycle.gg never sees your key — it's stored only in your browser. Grab a free 24-hour dev key from{' '}
          <a
            href="https://developer.riotgames.com"
            target="_blank"
            rel="noreferrer"
            className="underline font-semibold"
            style={{ color: '#fb7185' }}
          >
            developer.riotgames.com
          </a>{' '}
          and paste it below.
        </p>

        {keyStatus === 'saved' && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
            API key saved. You can now connect your Riot account on the Setup page.
          </div>
        )}
        {keyStatus === 'cleared' && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
            API key removed.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="field w-full font-mono text-xs pr-12"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShowKey(s => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold px-2 py-1 rounded hover:bg-white/10"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <Button variant="primary" onClick={handleSaveKey} disabled={!apiKey.trim()}>
            Save
          </Button>
          {getUserRiotKey() && (
            <Button variant="danger" onClick={handleClearKey}>
              Clear
            </Button>
          )}
        </div>
      </section>

      {/* ─── Cycle Length ─────────────────────────────────────────────────── */}
      <section className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Cycle Length</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
          Used for phase predictions when fewer than 2 periods are logged.
        </p>

        <div>
          <label className="field-label">Average Cycle Length (days)</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={21}
              max={35}
              value={cycleLength}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (v >= 21 && v <= 35) setCycleLength(v)
              }}
              className="field w-24 text-center"
            />
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>days (21–35)</span>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-faint)' }}>
            Your calculated average based on logged periods:{' '}
            <span style={{ color: 'var(--color-text-secondary)' }}>{averageCycleLength} days</span>
          </p>
        </div>
      </section>

      {/* ─── Data Management ──────────────────────────────────────────────── */}
      <section className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Data Management</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Export, import, or clear all your Cycle.gg data stored locally.
        </p>

        {importSuccess && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
            Data imported successfully. Reload the page to see changes.
          </div>
        )}
        {importError && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.3)', color: '#fb7185' }}>
            {importError}
          </div>
        )}
        {clearDone && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
            All data cleared. Reload the page to reset the app.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={handleExport} className="flex-1 justify-center">
            📥 Export Data
          </Button>

          <label className="flex-1">
            <span className="sr-only">Import data file</span>
            <div className="inline-flex w-full items-center justify-center px-4 py-2 text-sm font-medium rounded-lg cursor-pointer bg-white/8 hover:bg-white/14 border border-white/10 transition-all" style={{ color: 'var(--color-text-primary)' }}>
              📤 Import Data
            </div>
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              className="sr-only"
            />
          </label>

          <Button
            variant="danger"
            onClick={() => setShowClearModal(true)}
            className="flex-1 justify-center"
          >
            🗑️ Clear All Data
          </Button>
        </div>
      </section>

      {/* ─── About ────────────────────────────────────────────────────────── */}
      <section className="glass-card p-6">
        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>About</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Cycle.gg v1.0 · Built with 🩸
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-faint)' }}>
          All data is stored locally on your device. Nothing is sent to any server.
        </p>
      </section>

      {/* ─── Clear Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Data"
      >
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          This will permanently delete all your period logs, game history, and settings.
          This action <strong style={{ color: 'var(--color-text-primary)' }}>cannot be undone</strong>.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowClearModal(false)}
            className="flex-1 justify-center"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleClearConfirm}
            className="flex-1 justify-center font-bold"
          >
            Yes, Clear Everything
          </Button>
        </div>
      </Modal>
    </div>
  )
}
