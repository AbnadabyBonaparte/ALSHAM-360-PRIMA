/**
 * src/lib/supabase.ts
 * SSOT Bridge — re-exports the singleton client and query helpers.
 * All imports of `{ supabase }` across the app resolve here.
 */

export { supabase, getSupabaseClientWithOrg } from './supabase/client'
export { leadsQueries } from './supabase/queries/leads'

import { supabase } from './supabase/client'

export function getSupabaseClient() {
  return supabase
}

export async function getActiveOrganization(): Promise<string | null> {
  const raw = localStorage.getItem('ALSHAM_CURRENT_ORG_ID')
  if (raw) {
    try {
      return JSON.parse(raw) as string
    } catch {
      return raw
    }
  }
  return null
}

export const genericSelect = async (
  table: string,
  filters?: Record<string, unknown>,
  options?: {
    columns?: string
    limit?: number
    offset?: number
    orderBy?: { column: string; ascending?: boolean }
  }
) => {
  try {
    const orgId = await getActiveOrganization()

    let query = supabase
      .from(table)
      .select(options?.columns || '*', { count: 'exact' })

    if (orgId) {
      query = query.eq('org_id', orgId)
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value)
        }
      })
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true
      })
    } else {
      query = query.order('id', { ascending: false })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      const startRange = options.offset
      const endRange = startRange + (options.limit || 10) - 1
      query = query.range(startRange, endRange)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data, error: null, count }
  } catch (error: unknown) {
    console.error(`Error in genericSelect (${table}):`, error)
    return { data: null, error, count: 0 }
  }
}

export async function getDeals(filters?: Record<string, unknown>) {
  const { data, error } = await genericSelect('sales_opportunities', filters, {
    orderBy: { column: 'id', ascending: false }
  })
  if (error) return []
  return data || []
}

export async function getRecentActivities(limit = 10) {
  const { data, error } = await genericSelect('lead_interactions', {}, {
    limit,
    orderBy: { column: 'id', ascending: false }
  })
  if (error) return []
  return data || []
}

export function subscribeDeals(callback: (deals: unknown[]) => void) {
  const channel = supabase
    .channel('deals-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sales_opportunities' },
      async () => {
        const deals = await getDeals()
        callback(deals)
      }
    )
    .subscribe()

  return () => { channel.unsubscribe() }
}

export async function getLeads(orgId?: string) {
  const activeOrg = orgId || await getActiveOrganization()
  let query = supabase.from('leads_crm').select('*')
  if (activeOrg) query = query.eq('org_id', activeOrg)
  query = query.order('updated_at', { ascending: false })
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function updateLeadScore(id: string, score: number) {
  const { data, error } = await supabase
    .from('leads_crm')
    .update({ score })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTopLeadsByScore(limit = 10) {
  const orgId = await getActiveOrganization()
  let query = supabase.from('leads_crm').select('*')
  if (orgId) query = query.eq('org_id', orgId)
  query = query.order('score', { ascending: false }).limit(limit)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export function subscribeLeads(callback: (leads: unknown[]) => void) {
  const channel = supabase
    .channel('leads-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leads_crm' },
      async () => {
        const leads = await getLeads()
        callback(leads)
      }
    )
    .subscribe()
  return () => { channel.unsubscribe() }
}

export async function createLead(lead: Record<string, unknown>) {
  const { data, error } = await supabase.from('leads_crm').insert(lead).select().single()
  if (error) throw error
  return data
}

export async function updateLead(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from('leads_crm').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from('leads_crm').delete().eq('id', id)
  if (error) throw error
}

export async function getLeadInteractions(leadId: string) {
  const { data, error } = await supabase
    .from('lead_interactions')
    .select('*')
    .eq('lead_id', leadId)
    .order('id', { ascending: false })
  if (error) throw error
  return data || []
}

export async function bulkImportLeads(leads: Record<string, unknown>[]) {
  const { data, error } = await supabase.from('leads_crm').insert(leads).select()
  if (error) throw error
  return data || []
}

export async function getLead(id: string) {
  const { data, error } = await supabase.from('leads_crm').select('*').eq('id', id).single()
  if (error) throw error
  return data
}
