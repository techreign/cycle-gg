import type { ReactNode } from 'react'

interface GradientCardProps {
  children: ReactNode
  className?: string
}

export function GradientCard({ children, className = '' }: GradientCardProps) {
  return (
    <div className={`warm-card p-6 ${className}`}>
      {children}
    </div>
  )
}
