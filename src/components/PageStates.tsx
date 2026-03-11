import React from 'react'
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-alert)]/10">
          <AlertCircle className="h-7 w-7 text-[var(--accent-alert)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text)]">
          Erro ao carregar dados
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-strong)]">
          {icon || <Inbox className="h-7 w-7 text-[var(--text-secondary)]" />}
        </div>
        <h3 className="text-lg font-semibold text-[var(--text)]">
          {title || 'Nenhum dado encontrado'}
        </h3>
        {description && (
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        )}
        {action}
      </div>
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
