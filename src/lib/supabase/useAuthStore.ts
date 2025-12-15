import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './client'

/**
 * ✅ Auth Store (BLINDADO + MULTI-ORG)
 * - organizations NUNCA undefined (sempre [])
 * - Listener único (evita duplicar em HMR / re-init)
 * - currentOrg + needsOrgSelection
 * - fetchOrganizations via user_organizations -> organizations
 */

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer' | string

export type Organization = {
  id: string
  name: string
  created_at?: string | null
  updated_at?: string | null
  // campos opcionais (se existirem no seu schema)
  domain?: string | null
  logo_url?: string | null
}

export type UserOrganization = {
  org_id: string
  role: OrgRole
  organizations?: Organization | null
}

interface AuthState {
  // auth
  user: User | null
  session: Session | null

  // org
  organizations: Organization[]
  currentOrgId: string | null
  currentOrg: Organization | null
  roleInOrg: OrgRole | null

  // status
  loading: boolean
  loadingAuth: boolean
  loadingOrgs: boolean
  initialized: boolean
  error: string | null

  // derived helpers
  isAuthenticated: boolean
  needsOrgSelection: boolean

  // actions
  init: () => Promise<void>
  refreshOrganizations: () => Promise<void>
  switchOrganization: (orgId: string) => Promise<void>
  clearError: () => void
  signOut: () => Promise<void>
}

// 🔒 Listener único (fora do Zustand para não duplicar)
let authUnsub: (() => void) | null = null

const ORG_STORAGE_KEY = 'ALSHAM_CURRENT_ORG_ID'

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function readOrgFromStorage(): string | null {
  try {
    return localStorage.getItem(ORG_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeOrgToStorage(orgId: string | null) {
  try {
    if (!orgId) localStorage.removeItem(ORG_STORAGE_KEY)
    else localStorage.setItem(ORG_STORAGE_KEY, orgId)
  } catch {
    // ignore
  }
}

async function fetchOrganizationsForUser(userId: string): Promise<{
  orgs: Organization[]
  roleByOrgId: Record<string, OrgRole>
}> {
  /**
   * Esperado (pelo que você mostrou):
   * - public.organizations (id, name, ...)
   * - public.user_organizations (user_id, org_id, role)
   *
   * Faz join:
   * user_organizations -> organizations(*)
   */
  const { data, error } = await supabase
    .from('user_organizations')
    .select('org_id, role, organizations:organizations(*)')
    .eq('user_id', userId)

  if (error) throw error

  const rows = safeArray<UserOrganization>(data)

  const roleByOrgId: Record<string, OrgRole> = {}
  const orgs: Organization[] = rows
    .map((r) => {
      if (r.org_id) roleByOrgId[r.org_id] = r.role ?? 'member'
      return r.organizations ?? null
    })
    .filter(Boolean) as Organization[]

  // dedupe por id
  const seen = new Set<string>()
  const deduped: Organization[] = []
  for (const o of orgs) {
    if (!o?.id) continue
    if (seen.has(o.id)) continue
    seen.add(o.id)
    deduped.push(o)
  }

  return { orgs: deduped, roleByOrgId }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // auth
  user: null,
  session: null,

  // org
  organizations: [],
  currentOrgId: null,
  currentOrg: null,
  roleInOrg: null,

  // status
  loading: true,
  loadingAuth: true,
  loadingOrgs: false,
  initialized: false,
  error: null,

  // derived
  get isAuthenticated() {
    return !!get().user
  },
  get needsOrgSelection() {
    // precisa estar logado e ter ao menos uma org
    const user = get().user
    const orgs = get().organizations
    const currentOrgId = get().currentOrgId
    if (!user) return false
    if (orgs.length === 0) return false // se não tem org, não seleciona (ou você pode tratar como erro)
    return !currentOrgId
  },

  clearError: () => set({ error: null }),

  init: async () => {
    if (get().initialized) return

    set({ loading: true, loadingAuth: true, error: null })

    // 1) sessão inicial
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      set({
        session: null,
        user: null,
        organizations: [],
        currentOrgId: null,
        currentOrg: null,
        roleInOrg: null,
        loading: false,
        loadingAuth: false,
        loadingOrgs: false,
        initialized: true,
        error: error.message,
      })
      return
    }

    const session = data.session
    const user = session?.user ?? null

    set({
      session,
      user,
      loadingAuth: false,
      initialized: true,
    })

    // 2) carregar orgs (se logado)
    if (user) {
      await get().refreshOrganizations()
    } else {
      // sem user => limpa org state
      set({
        organizations: [],
        currentOrgId: null,
        currentOrg: null,
        roleInOrg: null,
      })
      writeOrgToStorage(null)
    }

    // 3) listener único
    if (!authUnsub) {
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        const newUser = newSession?.user ?? null

        set({
          session: newSession,
          user: newUser,
          loadingAuth: false,
          error: null,
        })

        if (newUser) {
          await get().refreshOrganizations()
        } else {
          set({
            organizations: [],
            currentOrgId: null,
            currentOrg: null,
            roleInOrg: null,
          })
          writeOrgToStorage(null)
        }
      })

      authUnsub = () => sub.subscription.unsubscribe()
    }

    set({ loading: false })
  },

  refreshOrganizations: async () => {
    const user = get().user
    if (!user) {
      set({
        organizations: [],
        currentOrgId: null,
        currentOrg: null,
        roleInOrg: null,
        loadingOrgs: false,
      })
      writeOrgToStorage(null)
      return
    }

    set({ loadingOrgs: true, error: null })

    try {
      const { orgs, roleByOrgId } = await fetchOrganizationsForUser(user.id)

      // sempre array
      const organizations = safeArray<Organization>(orgs)

      // resolve org atual (storage -> primeira org)
      const storedOrgId = readOrgFromStorage()
      let currentOrgId =
        (storedOrgId && organizations.some((o) => o.id === storedOrgId) ? storedOrgId : null) ??
        (organizations[0]?.id ?? null)

      const currentOrg = currentOrgId
        ? organizations.find((o) => o.id === currentOrgId) ?? null
        : null

      const roleInOrg = currentOrgId ? roleByOrgId[currentOrgId] ?? null : null

      set({
        organizations,
        currentOrgId,
        currentOrg,
        roleInOrg,
        loadingOrgs: false,
      })

      writeOrgToStorage(currentOrgId)
    } catch (e: any) {
      set({
        organizations: [],
        currentOrgId: null,
        currentOrg: null,
        roleInOrg: null,
        loadingOrgs: false,
        error: e?.message || 'Falha ao carregar organizações.',
      })
      writeOrgToStorage(null)
    }
  },

  switchOrganization: async (orgId: string) => {
    const orgs = get().organizations
    const target = orgs.find((o) => o.id === orgId) ?? null
    if (!target) {
      set({ error: 'Organização inválida ou não encontrada.', currentOrgId: null, currentOrg: null })
      writeOrgToStorage(null)
      return
    }

    set({
      currentOrgId: target.id,
      currentOrg: target,
      error: null,
    })

    writeOrgToStorage(target.id)

    // Se você tem lógica extra (ex: setar org no supabase headers),
    // faça aqui. Exemplo (opcional):
    // supabase.realtime.setAuth(get().session?.access_token ?? '')
  },

  signOut: async () => {
    set({ loading: true, loadingAuth: true, error: null })
    await supabase.auth.signOut()

    set({
      user: null,
      session: null,
      organizations: [],
      currentOrgId: null,
      currentOrg: null,
      roleInOrg: null,
      loading: false,
      loadingAuth: false,
      loadingOrgs: false,
    })

    writeOrgToStorage(null)
  },
}))
