import { supabase } from '@/lib/supabase/client'

export type AuditAction =
  | 'auth.login' | 'auth.logout' | 'auth.signup'
  | 'org.switch' | 'org.create'
  | 'lead.create' | 'lead.update' | 'lead.delete'
  | 'contact.create' | 'contact.update' | 'contact.delete'
  | 'opportunity.create' | 'opportunity.update'
  | 'campaign.create' | 'campaign.update'
  | 'settings.update'
  | 'export.data'

interface AuditEntry {
  action: AuditAction
  resource_type?: string
  resource_id?: string
  metadata?: Record<string, unknown>
}

export async function logAudit(entry: AuditEntry) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const orgId = localStorage.getItem('ALSHAM_CURRENT_ORG_ID')
    let parsedOrgId: string | null = null
    if (orgId) {
      try { parsedOrgId = JSON.parse(orgId) } catch { parsedOrgId = orgId }
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      org_id: parsedOrgId,
      action: entry.action,
      resource_type: entry.resource_type ?? null,
      resource_id: entry.resource_id ?? null,
      metadata: entry.metadata ?? null,
      ip_address: null,
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString(),
    })
  } catch {
    // Audit logging should never break the app
  }
}
