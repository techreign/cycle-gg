import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  className?: string
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  if (trend === 'up') {
    return (
      <span className="text-emerald-400 text-sm font-semibold flex items-center gap-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </span>
    )
  }
  if (trend === 'down') {
    return (
      <span className="text-rose-400 text-sm font-semibold flex items-center gap-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    )
  }
  return (
    <span className="text-slate-400 text-sm font-semibold flex items-center gap-0.5">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </span>
  )
}

export function StatCard({ title, value, subtitle, trend, icon, className = '' }: StatCardProps) {
  return (
    <div
      className={`glass-card p-4 hover:border-white/20 transition-colors ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{title}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white leading-none">{value}</span>
        {trend && <TrendArrow trend={trend} />}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>
      )}
    </div>
  )
}
