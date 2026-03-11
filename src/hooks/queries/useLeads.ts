import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsQueries } from '@/lib/supabase/queries/leads'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import type { LeadInsert, LeadUpdate } from '@/lib/supabase/types'

const LEADS_KEY = 'leads'

export function useLeads(filters?: Parameters<typeof leadsQueries.getAll>[0]) {
  const orgId = useAuthStore((s) => s.currentOrgId)
  return useQuery({
    queryKey: [LEADS_KEY, orgId, filters],
    queryFn: () => leadsQueries.getAll(filters),
    enabled: !!orgId,
  })
}

export function useLeadById(id: string | undefined) {
  return useQuery({
    queryKey: [LEADS_KEY, 'detail', id],
    queryFn: () => leadsQueries.getById(id!),
    enabled: !!id,
  })
}

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lead: LeadInsert) => leadsQueries.create(lead),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [LEADS_KEY] }) },
  })
}

export function useUpdateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: LeadUpdate }) =>
      leadsQueries.update(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [LEADS_KEY] }) },
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leadsQueries.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [LEADS_KEY] }) },
  })
}

export function useLeadsStats() {
  const orgId = useAuthStore((s) => s.currentOrgId)
  return useQuery({
    queryKey: [LEADS_KEY, 'stats', orgId],
    queryFn: () => leadsQueries.getStatsByStatus(),
    enabled: !!orgId,
  })
}
