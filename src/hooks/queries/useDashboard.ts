import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/supabase/useAuthStore'

const DASH_KEY = 'dashboard'

export function useDashboardMetrics() {
  const orgId = useAuthStore((s) => s.currentOrgId)

  return useQuery({
    queryKey: [DASH_KEY, 'metrics', orgId],
    queryFn: async () => {
      const [leads, opportunities, tasks] = await Promise.all([
        supabase.from('leads_crm').select('*', { count: 'exact', head: true }).eq('org_id', orgId!),
        supabase.from('sales_opportunities').select('*', { count: 'exact', head: true }).eq('org_id', orgId!),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('org_id', orgId!),
      ])
      return {
        totalLeads: leads.count ?? 0,
        totalOpportunities: opportunities.count ?? 0,
        totalTasks: tasks.count ?? 0,
      }
    },
    enabled: !!orgId,
  })
}

export function useDashboardRecentLeads(limit = 5) {
  const orgId = useAuthStore((s) => s.currentOrgId)

  return useQuery({
    queryKey: [DASH_KEY, 'recent-leads', orgId, limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('leads_crm')
        .select('*')
        .eq('org_id', orgId!)
        .order('created_at', { ascending: false })
        .limit(limit)
      return data ?? []
    },
    enabled: !!orgId,
  })
}
