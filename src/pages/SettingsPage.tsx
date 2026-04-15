import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

export function SettingsPage() {
  const { averageCycleLength } = useApp()

  const [riotUsername, setRiotUsername] = useState('')
  const [riotToast, setRiotToast] = useState(false)
  const [cycleLength, setCycleLength] = useState(averageCycleLength)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearDone, setClearDone] = useState(false)

  // ─── Riot Connect (placeholder) ──────────────────────────────────────────
  function handleRiotConnect() {
    setRiotToast(true)
    setTimeout(() => setRiotToast(false), 3000)
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
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account and data</p>
      </div>

      {/* ─── Riot Account ─────────────────────────────────────────────────── */}
      <section className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold text-white mb-1">Riot Account</h2>
        <p className="text-slate-500 text-sm mb-5">
          Connect your Riot account to auto-import match history.
        </p>

        {riotToast && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-medium">
            🚧 Riot API integration coming soon!
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="text"
            value={riotUsername}
            onChange={(e) => setRiotUsername(e.target.value)}
            placeholder="GameName#TAG"
            className="flex-1 px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 bg-white/5 border border-white/10 focus:outline-none focus:border-violet-400/50 transition-all"
          />
          <Button variant="secondary" onClick={handleRiotConnect}>
            Connect
          </Button>
        </div>
      </section>

      {/* ─── Cycle Length ─────────────────────────────────────────────────── */}
      <section className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold text-white mb-1">Cycle Length</h2>
        <p className="text-slate-500 text-sm mb-5">
          Used for phase predictions when fewer than 2 periods are logged.
        </p>

        <div>
          <label className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">
            Average Cycle Length (days)
          </label>
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
              className="w-24 px-3 py-2.5 rounded-lg text-sm text-white text-center bg-white/5 border border-white/10 focus:outline-none focus:border-pink-400/50 transition-all"
            />
            <span className="text-slate-500 text-sm">days (21–35)</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Your calculated average based on logged periods:{' '}
            <span className="text-slate-400">{averageCycleLength} days</span>
          </p>
        </div>
      </section>

      {/* ─── Data Management ──────────────────────────────────────────────── */}
      <section className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold text-white mb-1">Data Management</h2>
        <p className="text-slate-500 text-sm mb-6">
          Export, import, or clear all your Cycle.gg data stored locally.
        </p>

        {/* Import success / error messages */}
        {importSuccess && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
            Data imported successfully. Reload the page to see changes.
          </div>
        )}
        {importError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
            {importError}
          </div>
        )}
        {clearDone && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm">
            All data cleared. Reload the page to reset the app.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={handleExport} className="flex-1 justify-center">
            📥 Export Data
          </Button>

          <label className="flex-1">
            <span className="sr-only">Import data file</span>
            <div className="inline-flex w-full items-center justify-center px-4 py-2 text-sm font-medium rounded-lg cursor-pointer bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all">
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
        <h2 className="text-base font-bold text-white mb-3">About</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Cycle.gg v1.0 • Inspired by @SaskioLoL • Built with 💜
        </p>
        <p className="text-slate-600 text-xs mt-2">
          All data is stored locally on your device. Nothing is sent to any server.
        </p>
      </section>

      {/* ─── Clear Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Data"
      >
        <p className="text-slate-400 text-sm mb-6">
          This will permanently delete all your period logs, game history, and settings.
          This action <strong className="text-white">cannot be undone</strong>.
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
