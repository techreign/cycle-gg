import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log locally so users can share stack traces when reporting bugs.
    console.error('[cycle.gg] unhandled error', error, info)
  }

  handleReset = (): void => {
    this.setState({ error: null })
  }

  handleWipe = (): void => {
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
    window.location.href = '/'
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: '#110a0a', color: '#f8e4e7' }}
      >
        <div
          className="max-w-md w-full rounded-2xl p-8 text-center"
          style={{ backgroundColor: '#1f1215', border: '1px solid rgba(225,29,72,0.3)' }}
        >
          <div className="text-4xl mb-4">🩸</div>
          <h1 className="text-xl font-black mb-2">Something broke.</h1>
          <p className="text-sm mb-1" style={{ color: '#cda3a9' }}>
            Cycle.gg ran into an unexpected error. Your data is still safe locally — try reloading first.
          </p>
          <pre
            className="text-left text-[11px] mt-4 mb-5 p-3 rounded-lg overflow-auto max-h-40"
            style={{ background: 'rgba(0,0,0,0.3)', color: '#cda3a9', fontFamily: 'ui-monospace, monospace' }}
          >
            {error.message}
          </pre>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleReset}
              className="btn-rose-gradient flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold border border-white/10 hover:bg-white/5 transition-all"
            >
              Reload
            </button>
          </div>
          <button
            onClick={this.handleWipe}
            className="mt-4 text-xs underline"
            style={{ color: '#7a6169' }}
          >
            Nuclear option: clear all data
          </button>
        </div>
      </div>
    )
  }
}
