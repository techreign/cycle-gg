import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts'
import type { PhaseStats } from '../../types'
import { PHASE_CONFIG } from '../../constants/phases'

interface Props {
  phaseStats: PhaseStats[]
}

interface TooltipPayloadEntry {
  payload: {
    label: string
    emoji: string
    winRate: number
    games: number
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
    <div className="glass-card" style={{ padding: '10px 14px', minWidth: 160 }}>
      <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}>
        {d.emoji} {d.label}
      </p>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        Win Rate: <span style={{ color: '#fff' }}>{d.winRate.toFixed(1)}%</span>
      </p>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        Games: <span style={{ color: '#fff' }}>{d.games}</span>
      </p>
    </div>
  )
}

export function WinRateByPhase({ phaseStats }: Props) {
  const data = phaseStats
    .filter(s => s.phase !== 'unknown')
    .map(s => {
      const config = PHASE_CONFIG[s.phase as keyof typeof PHASE_CONFIG]
      return {
        phase: s.phase,
        label: config.label,
        emoji: config.emoji,
        color: config.color,
        winRate: Math.round(s.winRate * 10) / 10,
        games: s.games,
        xLabel: `${config.emoji} ${config.label}`,
      }
    })

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
        Win Rate by Phase
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="xLabel"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="winRate" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.phase} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
