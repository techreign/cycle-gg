import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  ReferenceLine,
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
    aggressionScore: number
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
    <div className="raised-surface px-3.5 py-2.5" style={{ minWidth: 180 }}>
      <p className="font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {d.emoji} {d.label}
      </p>
      <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
        Aggression: <span style={{ color: '#fff' }}>{d.aggressionScore.toFixed(2)} / 10</span>
      </p>
      <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
        Games: <span style={{ color: '#fff' }}>{d.games}</span>
      </p>
    </div>
  )
}

export function AggressionByPhase({ phaseStats }: Props) {
  const data = phaseStats
    .filter(s => s.phase !== 'unknown')
    .map(s => {
      const config = PHASE_CONFIG[s.phase as keyof typeof PHASE_CONFIG]
      return {
        phase: s.phase,
        label: config.label,
        emoji: config.emoji,
        color: config.color,
        aggressionScore: Math.round(s.aggressionScore * 100) / 100,
        games: s.games,
        xLabel: `${config.emoji} ${config.label}`,
      }
    })

  return (
    <div className="glass-card p-5">
      <h3 className="section-heading">Aggression by Phase</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="xLabel"
            tick={{ fill: '#cda3a9', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#cda3a9', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(251, 113, 133, 0.06)' }} />
          <ReferenceLine
            y={8.6}
            stroke="#e11d48"
            strokeDasharray="6 3"
            label={{
              value: 'Bwipo Line',
              position: 'right',
              fill: '#e11d48',
              fontSize: 11,
            }}
          />
          <Bar dataKey="aggressionScore" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.phase} fill={entry.color} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
