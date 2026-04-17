import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  CartesianGrid,
} from 'recharts'
import type { EnrichedGame } from '../../types'
import { PHASE_CONFIG } from '../../constants/phases'

interface Props {
  enrichedGames: EnrichedGame[]
}

interface TooltipPayloadEntry {
  payload: {
    date: string
    kda: number
    phaseLabel: string
    phaseColor: string
    champion: string
    wins: boolean
  }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const d = payload[0].payload

  return (
    <div className="raised-surface px-3.5 py-2.5" style={{ minWidth: 170 }}>
      <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{d.date}</p>
      <p className="font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {d.champion} — <span style={{ color: d.wins ? '#34d399' : '#fb7185' }}>{d.wins ? 'W' : 'L'}</span>
      </p>
      <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
        KDA: <span style={{ color: '#fff' }}>{d.kda.toFixed(2)}</span>
      </p>
      <p className="text-xs" style={{ color: d.phaseColor }}>{d.phaseLabel}</p>
    </div>
  )
}

export function KdaTrendLine({ enrichedGames }: Props) {
  if (enrichedGames.length === 0) return null

  const last30 = [...enrichedGames]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)

  const data = last30.map((g, i) => {
    const config = g.phase !== 'unknown' ? PHASE_CONFIG[g.phase as keyof typeof PHASE_CONFIG] : null
    return {
      index: i,
      date: g.date,
      kda: Math.round(((g.kills + g.assists) / Math.max(g.deaths, 1)) * 100) / 100,
      phase: g.phase,
      phaseLabel: config?.label ?? 'Unknown',
      phaseColor: config?.color ?? '#7a6169',
      champion: g.champion,
      wins: g.win,
    }
  })

  const bands: { startIndex: number; endIndex: number; phase: string; color: string }[] = []
  let bandStart = 0
  let currentPhase = data[0].phase
  let currentColor = data[0].phaseColor

  for (let i = 1; i < data.length; i++) {
    if (data[i].phase !== currentPhase) {
      bands.push({ startIndex: bandStart, endIndex: i - 1, phase: currentPhase, color: currentColor })
      bandStart = i
      currentPhase = data[i].phase
      currentColor = data[i].phaseColor
    }
  }
  bands.push({ startIndex: bandStart, endIndex: data.length - 1, phase: currentPhase, color: currentColor })

  return (
    <div className="glass-card p-5">
      <h3 className="section-heading">KDA Trend (last 30 games)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#cda3a9', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#cda3a9', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(251,113,133,0.25)', strokeWidth: 1 }} />
          {bands.map((band, i) => (
            <ReferenceArea
              key={i}
              x1={data[band.startIndex].date}
              x2={data[band.endIndex].date}
              fill={band.color}
              fillOpacity={0.08}
              ifOverflow="visible"
            />
          ))}
          <Line
            type="monotone"
            dataKey="kda"
            stroke="#fb7185"
            strokeWidth={2.5}
            dot={{ fill: '#fb7185', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#fb7185', strokeWidth: 0 }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(251, 113, 133, 0.55))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
