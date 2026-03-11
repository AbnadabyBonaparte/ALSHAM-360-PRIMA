// src/pages/Analytics.tsx
// ALSHAM 360° PRIMA — Analytics Dashboard
// 100% CSS Variables + shadcn/ui

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { PageSkeleton, ErrorState } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Analytics: React.FC = () => {
  const orgId = useAuthStore((s) => s.currentOrgId)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_reports')
        .select('*')
        .eq('org_id', orgId!)
      if (error) throw error
      return data ?? []
    },
    enabled: !!orgId,
  })

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text)]">Analytics</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Análises e relatórios detalhados
          </p>
        </div>

        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text)]">Analytics em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-[var(--text-secondary)]">
              Gráficos e métricas avançadas serão implementados em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Analytics;
