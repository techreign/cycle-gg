import type { ReactNode } from 'react'

interface GradientCardProps {
  children: ReactNode
  className?: string
}

export function GradientCard({ children, className = '' }: GradientCardProps) {
  return (
    <div className={`glass-card phase-gradient p-6 ${className}`}>
      {children}
    </div>
  )
}
