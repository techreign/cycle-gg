import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

export function SettingsPage() {
  const { averageCycleLength } = useApp()

  const [cycleLength, setCycleLength] = useState(averageCycleLength)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearDone, setClearDone] = useState(false)

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
