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
    <div className="glass-card" style={{ padding: '10px 14px', minWidth: 170 }}>
      <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{d.date}</p>
      <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}>
        {d.champion} — <span style={{ color: d.wins ? '#4ade80' : '#f87171' }}>{d.wins ? 'W' : 'L'}</span>
      </p>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        KDA: <span style={{ color: '#fff' }}>{d.kda.toFixed(2)}</span>
      </p>
      <p style={{ color: d.phaseColor, fontSize: 12 }}>{d.phaseLabel}</p>
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
      phaseColor: config?.color ?? '#64748b',
      champion: g.champion,
      wins: g.win,
    }
  })

  // Build phase bands — group consecutive same-phase games
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
    <div className="glass-card" style={{ padding: '20px 24px' }}>
      <h3
        style={{
          color: '#e2e8f0',
          fontWeight: 600,
          fontSize: 16,
          marginBottom: 20,
        }}
      >
        KDA Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
          />
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
            stroke="#ffffff"
            strokeWidth={2}
            dot={{ fill: '#ec4899', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#ec4899', strokeWidth: 0 }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.6))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
