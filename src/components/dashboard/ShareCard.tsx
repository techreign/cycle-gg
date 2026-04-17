import { useState } from 'react'
import type { MppdResult, EnrichedGame, PhaseStats, CyclePhase } from '../../types'
import { buildShareData, renderShareCard } from '../../utils/shareCard'

interface Props {
  enrichedGames: EnrichedGame[]
  phaseStats: PhaseStats[]
  mppd: MppdResult
  currentPhase: CyclePhase
}

export function ShareCard({ enrichedGames, phaseStats, mppd, currentPhase }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleGenerate() {
    const data = buildShareData(enrichedGames, phaseStats, mppd, currentPhase)
    const url = renderShareCard(data)
    setDataUrl(url)
  }

  function handleDownload() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `cycle-gg-${new Date().toISOString().slice(0, 10)}.png`
    a.click()
  }

  async function handleCopy() {
    if (!dataUrl) return
    try {
      const blob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not support images in all browsers
    }
  }

  if (enrichedGames.length === 0) return null

  return (
    <div className="glass-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="section-heading mb-0">Share Your Cycle</h3>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          1080 × 1080 png
        </span>
      </div>

      {!dataUrl ? (
        <div
          className="rounded-xl p-6 text-center flex flex-col items-center gap-3"
          style={{ background: 'rgba(251,113,133,0.04)', border: '1px dashed rgba(251,113,133,0.3)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Generate a shareable card with your MPPD score, best phase, and top champion.
          </p>
          <button
            onClick={handleGenerate}
            className="btn-rose-gradient px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Generate Share Card
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl overflow-hidden border border-white/10">
            <img
              src={dataUrl}
              alt="Cycle.gg share card"
              className="block w-full h-auto"
              style={{ aspectRatio: '1 / 1' }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="btn-rose-gradient flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold"
            >
              ⬇ Download PNG
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/8 hover:bg-white/14 border border-white/10 transition-all"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {copied ? '✓ Copied!' : '⎘ Copy to Clipboard'}
            </button>
            <button
              onClick={handleGenerate}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ↻ Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
