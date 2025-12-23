// src/pages/Analytics.tsx
// ALSHAM 360° PRIMA — Analytics Dashboard
// 100% CSS Variables + shadcn/ui

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Analytics: React.FC = () => {
  const { currentOrg } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentOrg) {
      setTimeout(() => setLoading(false), 1000)
    }
  }, [currentOrg])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

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
