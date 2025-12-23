// src/pages/Leads.tsx
// ALSHAM 360° PRIMA — Leads (migrado para shadcn/ui)

import React, { useEffect, useState } from 'react'
import { leadsQueries } from '../lib/supabase/queries/leads'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Lead } from '../lib/supabase/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Leads: React.FC = () => {
  const { currentOrg } = useAuthStore()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    if (currentOrg) {
      loadLeads()
    }
  }, [currentOrg, searchTerm, statusFilter])

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: any = {}
      if (searchTerm) filters.search = searchTerm
      if (statusFilter) filters.status = statusFilter

      const { data, error } = await leadsQueries.getAll(filters)

      if (error) {
        setError('Erro ao carregar leads')
        return
      }

      setLeads(data)
    } catch (err) {
      console.error('Error loading leads:', err)
      setError('Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusVariant = (status: string): { bg: string; text: string } => {
    switch (status) {
      case 'novo':
        return { bg: 'bg-[var(--accent-emerald)]/10', text: 'text-[var(--accent-emerald)]' }
      case 'qualificado':
        return { bg: 'bg-[var(--accent-sky)]/10', text: 'text-[var(--accent-sky)]' }
      case 'contato':
        return { bg: 'bg-[var(--accent-warning)]/10', text: 'text-[var(--accent-warning)]' }
      case 'proposta':
        return { bg: 'bg-[var(--accent-purple)]/10', text: 'text-[var(--accent-purple)]' }
      case 'fechado':
        return { bg: 'bg-[var(--surface-strong)]', text: 'text-[var(--text-secondary)]' }
      default:
        return { bg: 'bg-[var(--surface-strong)]', text: 'text-[var(--text-secondary)]' }
    }
  }

  const getTemperatureVariant = (temperature: string): { bg: string; text: string } => {
    switch (temperature) {
      case 'quente':
        return { bg: 'bg-[var(--accent-alert)]/10', text: 'text-[var(--accent-alert)]' }
      case 'morno':
        return { bg: 'bg-[var(--accent-warning)]/10', text: 'text-[var(--accent-warning)]' }
      case 'frio':
        return { bg: 'bg-[var(--accent-sky)]/10', text: 'text-[var(--accent-sky)]' }
      default:
        return { bg: 'bg-[var(--surface-strong)]', text: 'text-[var(--text-secondary)]' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Leads</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Gerencie seus leads e prospects
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-[var(--border)]/40 bg-[var(--surface)]/70 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--background)] border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-[var(--background)] border-[var(--border)] text-[var(--text-primary)]">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--surface)] border-[var(--border)]">
                    <SelectItem value=" " className="text-[var(--text-primary)]">Todos os status</SelectItem>
                    <SelectItem value="novo" className="text-[var(--text-primary)]">Novo</SelectItem>
                    <SelectItem value="qualificado" className="text-[var(--text-primary)]">Qualificado</SelectItem>
                    <SelectItem value="contato" className="text-[var(--text-primary)]">Contato</SelectItem>
                    <SelectItem value="proposta" className="text-[var(--text-primary)]">Proposta</SelectItem>
                    <SelectItem value="fechado" className="text-[var(--text-primary)]">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="border-[var(--border)]/40 bg-[var(--surface)]/70 backdrop-blur-xl overflow-hidden">
          {leads.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--border)]/50 hover:bg-transparent">
                    <TableHead className="text-[var(--text-secondary)]">Lead</TableHead>
                    <TableHead className="text-[var(--text-secondary)]">Empresa</TableHead>
                    <TableHead className="text-[var(--text-secondary)]">Status</TableHead>
                    <TableHead className="text-[var(--text-secondary)]">Temperatura</TableHead>
                    <TableHead className="text-[var(--text-secondary)]">Score</TableHead>
                    <TableHead className="text-[var(--text-secondary)]">Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const statusVariant = getStatusVariant(lead.status)
                    const temperatureVariant = getTemperatureVariant(lead.temperature)

                    return (
                      <TableRow
                        key={lead.id}
                        className="border-[var(--border)]/50 hover:bg-[var(--surface-strong)]/50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              {lead.name}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              {lead.email}
                            </div>
                            {lead.phone && (
                              <div className="text-sm text-[var(--text-secondary)]">
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-[var(--text-primary)]">
                            {lead.company || '-'}
                          </div>
                          <div className="text-sm text-[var(--text-secondary)]">
                            {lead.position || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${statusVariant.bg} ${statusVariant.text} border-0 font-semibold`}
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${temperatureVariant.bg} ${temperatureVariant.text} border-0 font-semibold`}
                          >
                            {lead.temperature}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-[var(--text-primary)]">
                          {lead.score}
                        </TableCell>
                        <TableCell className="text-sm text-[var(--text-secondary)]">
                          {formatDate(lead.created_at)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <CardContent className="py-12 text-center">
              <p className="text-[var(--text-secondary)]">
                {error || 'Nenhum lead encontrado'}
              </p>
              {error && (
                <Button
                  onClick={loadLeads}
                  className="mt-4 bg-[var(--accent-sky)] text-white hover:bg-[var(--accent-sky)]/90"
                >
                  Tentar novamente
                </Button>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
