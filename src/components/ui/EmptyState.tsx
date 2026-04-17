interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-card flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-4xl mb-4">🩸</div>
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-rose-gradient mt-5 px-5 py-2.5 text-sm font-semibold rounded-lg"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
