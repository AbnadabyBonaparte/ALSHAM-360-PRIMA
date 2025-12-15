import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './client'

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer' | string

export type Organization = {
  id: string
  name: string
  created_at?: string | null
  updated_at?: string | null
  domain?: string | null
  logo_url?: string | null
}

export type UserOrganization = {
  org_id: string
  role: OrgRole
  organizations?: Organization | null
}

interface AuthState {
  user: User | null
  session: Session | null

  organizations: Organization[]
  currentOrgId: string | null
  currentOrg: Organization | null
  roleInOrg: OrgRole | null

  loading: boolean
  loadingAuth: boolean
  loadingOrgs: boolean
  initialized: boolean
  error: string | null

  isAuthenticated: boolean
  needsOrgSelection: boolean

  init: () => Promise<void>
  fetchOrganizations: () => Promise<void>
  refreshOrganizations: () => Promise<void>
  switchOrganization: (orgId: string) => Promise<void>
  clearError: () => void
  signOut: () => Promise<void>
}

// 🔒 listener único
let authUnsub: (() => void) | null = null
let initInFlight: Promise<void> | null = null

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
  const { data, error } = await supabase
    .from('user_organizations')
    .select('org_id, role, organizations:organizations(*)')
    .eq('user_id', userId)

  if (error) throw error

  const rows = safeArray<UserOrganization>(data)

  const roleByOrgId: Record<string, OrgRole> = {}
  const orgs = rows
    .map((r) => {
      if (r.org_id) roleByOrgId[r.org_id] = r.role ?? 'member'
      return r.organizations ?? null
    })
    .filter(Boolean) as Organization[]

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
  user: null,
  session: null,

  organizations: [],
  currentOrgId: null,
  currentOrg: null,
  roleInOrg: null,

  loading: true,
  loadingAuth: true,
  loadingOrgs: false,
  initialized: false,
  error: null,

  isAuthenticated: false,
  needsOrgSelection: false,

  clearError: () => set({ error: null }),

  init: async () => {
    // 🔒 de-dup: se já há init em execução, aguarde a mesma promise
    if (initInFlight) return initInFlight

    const run = async () => {
      const state = get()

      // “rehydrate” seguro:
      // se já inicializado e não está carregando orgs e tem user,
      // mas ainda não tem org resolvida (0 ou >1), não precisa re-init pesado
      // (o estado já representa o gate corretamente).
      if (state.initialized && !state.loadingOrgs) {
        set({
          loading: false,
          loadingAuth: false,
          isAuthenticated: !!state.user,
          needsOrgSelection: !!state.user && !state.currentOrgId && state.organizations.length !== 1,
        })
        return
      }

      const setDerived = () => {
        const s = get()
        set({
          isAuthenticated: !!s.user,
          needsOrgSelection: !!s.user && !s.currentOrgId && s.organizations.length !== 1 && !s.loadingOrgs,
        })
      }

      set({ loading: true, loadingAuth: true, error: null })

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
        setDerived()
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

      // ✅ ÚNICA fonte de carregamento de orgs
      if (user) {
        await get().fetchOrganizations()
      } else {
        set({
          organizations: [],
          currentOrgId: null,
          currentOrg: null,
          roleInOrg: null,
        })
        writeOrgToStorage(null)
      }

      // 🔒 listener único (SEM fetchOrganizations aqui)
      if (!authUnsub) {
        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          const newUser = newSession?.user ?? null

          set({
            session: newSession,
            user: newUser,
            loadingAuth: false,
            error: null,
          })

          // ⚠️ Regra UX: listener NÃO carrega orgs.
          // Apenas limpa estado quando logout.
          if (!newUser) {
            set({
              organizations: [],
              currentOrgId: null,
              currentOrg: null,
              roleInOrg: null,
              loadingOrgs: false,
            })
            writeOrgToStorage(null)
          }

          setDerived()
        })

        authUnsub = () => sub.subscription.unsubscribe()
      }

      set({ loading: false })
      setDerived()
    }

    initInFlight = run().finally(() => {
      initInFlight = null
    })

    return initInFlight
  },

  fetchOrganizations: async () => {
    const user = get().user

    const setDerived = () => {
      const s = get()
      set({
        isAuthenticated: !!s.user,
        needsOrgSelection: !!s.user && !s.currentOrgId && s.organizations.length !== 1 && !s.loadingOrgs,
      })
    }

    if (!user) {
      set({
        organizations: [],
        currentOrgId: null,
        currentOrg: null,
        roleInOrg: null,
        loadingOrgs: false,
      })
      writeOrgToStorage(null)
      setDerived()
      return
    }

    set({ loadingOrgs: true, error: null })
    try {
      const { orgs, roleByOrgId } = await fetchOrganizationsForUser(user.id)
      const organizations = safeArray<Organization>(orgs)

      // ✅ UX CRAVADA:
      // - 0 orgs: nenhuma selecionada
      // - 1 org: auto-seleciona
      // - >1: força selector (não auto-seleciona, ignora storage)
      let resolvedOrgId: string | null = null

      if (organizations.length === 1) {
        resolvedOrgId = organizations[0].id
      } else {
        resolvedOrgId = null
      }

      const currentOrg = resolvedOrgId
        ? organizations.find((o) => o.id === resolvedOrgId) ?? null
        : null

      const roleInOrg = resolvedOrgId ? roleByOrgId[resolvedOrgId] ?? null : null

      set({
        organizations,
        currentOrgId: resolvedOrgId,
        currentOrg,
        roleInOrg,
        loadingOrgs: false,
      })

      // storage apenas se houver org definida (auto-select ou switch)
      writeOrgToStorage(resolvedOrgId)
      setDerived()
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
      setDerived()
    }
  },

  refreshOrganizations: async () => {
    await get().fetchOrganizations()
  },

  switchOrganization: async (orgId: string) => {
    const orgs = get().organizations
    const target = orgs.find((o) => o.id === orgId) ?? null

    if (!target) {
      set({
        error: 'Organização inválida ou não encontrada.',
        currentOrgId: null,
        currentOrg: null,
      })
      writeOrgToStorage(null)
      set({ needsOrgSelection: true })
      return
    }

    set({
      currentOrgId: target.id,
      currentOrg: target,
      error: null,
      needsOrgSelection: false,
    })

    writeOrgToStorage(target.id)
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
      isAuthenticated: false,
      needsOrgSelection: false,
      initialized: true,
    })

    writeOrgToStorage(null)
  },
}))
