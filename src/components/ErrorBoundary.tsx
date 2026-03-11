import React, { Component, type ReactNode } from 'react'
import * as Sentry from '@sentry/react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg,#0a0a0a)] p-6">
          <div className="w-full max-w-md rounded-xl border border-[var(--border,#333)] bg-[var(--surface,#111)] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-alert,#ef4444)]/10">
              <svg className="h-8 w-8 text-[var(--accent-alert,#ef4444)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text,#fff)]">
              Algo deu errado
            </h2>
            <p className="mb-6 text-sm text-[var(--text-secondary,#888)]">
              {this.state.error?.message || 'Ocorreu um erro inesperado. Nossa equipe foi notificada.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="rounded-lg bg-[var(--accent-1,#a855f7)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg border border-[var(--border,#333)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary,#888)] transition-colors hover:bg-[var(--surface-strong,#1a1a1a)]"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
