// src/pages/CampaignForm.tsx
// ALSHAM 360° PRIMA — Criar/Editar Campanha (form real, multi-tenant)
import React, { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Megaphone, Save, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  budget: number
  spent: number
  start_date: string
  end_date: string | null
}

const CAMPAIGN_TYPES = ['email', 'social', 'ads', 'evento', 'webinar', 'outbound']
const CAMPAIGN_STATUS = ['draft', 'active', 'paused', 'completed']

const NEW = '__new__'

const emptyForm = () => ({
  name: '',
  type: 'email',
  status: 'draft',
  budget: '',
  spent: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
})

export default function CampaignForm() {
  const { data = [], isLoading, error, refetch } = useOrgData<Campaign>('campaigns', {
    orderBy: { column: 'start_date', ascending: false },
    limit: 200,
  })
  const orgId = useAuthStore((s) => s.currentOrgId)
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [selectedId, setSelectedId] = useState<string>(NEW)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  const selected = useMemo(
    () => (selectedId === NEW ? null : data.find((c) => c.id === selectedId) ?? null),
    [data, selectedId],
  )

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name ?? '',
        type: selected.type ?? 'email',
        status: selected.status ?? 'draft',
        budget: String(selected.budget ?? ''),
        spent: String(selected.spent ?? ''),
        start_date: (selected.start_date ?? '').slice(0, 10),
        end_date: (selected.end_date ?? '')?.slice(0, 10) ?? '',
      })
    } else {
      setForm(emptyForm())
    }
  }, [selected])

  const set = (key: keyof ReturnType<typeof emptyForm>, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!orgId) {
      toast({ title: 'Organização não selecionada', description: 'Selecione uma organização antes de salvar.' })
      return
    }
    if (!form.name.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Informe o nome da campanha.' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        org_id: orgId,
        name: form.name.trim(),
        type: form.type,
        status: form.status,
        budget: Number(form.budget) || 0,
        spent: Number(form.spent) || 0,
        start_date: form.start_date,
        end_date: form.end_date ? form.end_date : null,
        ...(userId ? { owner_id: userId } : {}),
      }

      if (selected) {
        const { error: updateError } = await supabase
          .from('campaigns')
          .update(payload)
          .eq('id', selected.id)
          .eq('org_id', orgId)
        if (updateError) throw updateError
        toast({ title: 'Campanha atualizada', description: `"${payload.name}" foi salva com sucesso.` })
      } else {
        const { error: insertError } = await supabase.from('campaigns').insert(payload)
        if (insertError) throw insertError
        toast({ title: 'Campanha criada', description: `"${payload.name}" foi adicionada.` })
        setSelectedId(NEW)
        setForm(emptyForm())
      }

      await queryClient.invalidateQueries({ queryKey: ['org-data', 'campaigns'] })
      await refetch()
    } catch (err) {
      toast({
        title: 'Não foi possível salvar',
        description: err instanceof Error ? err.message : 'Erro inesperado ao salvar a campanha.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  const picker = (
    <Select value={selectedId} onValueChange={setSelectedId}>
      <SelectTrigger className="w-64 bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]">
        <SelectValue placeholder="Nova campanha" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NEW}>+ Nova campanha</SelectItem>
        {data.map((c) => (
          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="p-1 space-y-6">
      <PageHeader
        title={selected ? 'Editar Campanha' : 'Criar Campanha'}
        description="Defina orçamento, tipo e período da campanha de marketing"
        actions={picker}
      />

      <Card className="bg-[var(--surface)] border-[var(--border)] max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--text-primary)] text-base">
            <Megaphone className="h-4 w-4 text-[var(--accent-1)]" />
            {selected ? selected.name : 'Nova campanha'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[var(--text-secondary)]">Nome</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Black Friday 2026"
              className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[var(--text-secondary)]">Tipo</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text-secondary)]">Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-[var(--text-secondary)]">Orçamento (R$)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
                placeholder="0"
                className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spent" className="text-[var(--text-secondary)]">Investido (R$)</Label>
              <Input
                id="spent"
                type="number"
                min="0"
                value={form.spent}
                onChange={(e) => set('spent', e.target.value)}
                placeholder="0"
                className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start" className="text-[var(--text-secondary)]">Início</Label>
              <Input
                id="start"
                type="date"
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
                className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end" className="text-[var(--text-secondary)]">Fim (opcional)</Label>
              <Input
                id="end"
                type="date"
                value={form.end_date}
                onChange={(e) => set('end_date', e.target.value)}
                className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {selected ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saving ? 'Salvando...' : selected ? 'Salvar alterações' : 'Criar campanha'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
