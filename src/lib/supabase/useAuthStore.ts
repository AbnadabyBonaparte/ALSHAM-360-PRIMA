import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from './auth'
import { createSupabaseClientWithOrg } from './client'
import type { AuthUser, Organization, AuthState } from './types'

interface AuthStore extends AuthState {
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  switchOrganization: (orgId: string) => Promise<void>
  initialize: () => Promise<void>
  clearError: () => void

  // Computed properties
  isAuthenticated: boolean
  hasMultipleOrgs: boolean
  needsOrgSelection: boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      currentOrg: null,
      organizations: [],
      loading: true,
      error: null,

      // Computed properties
      get isAuthenticated(): boolean {
        return !!get().user && !!get().session
      },

      get hasMultipleOrgs(): boolean {
        return get().organizations.length > 1
      },

      get needsOrgSelection(): boolean {
        const state = get()
        return state.isAuthenticated && !state.currentOrg && state.organizations.length > 0
      },

      // Actions
      async signIn(email: string, password: string) {
        set({ loading: true, error: null })

        try {
          const { user, session, error } = await auth.signIn({ email, password })

          if (error) {
            set({ error, loading: false })
            return
          }

          if (user && session) {
            set({ user, session, loading: false })
            await get().loadUserOrganizations(user.id)
          }
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Erro ao fazer login',
            loading: false
          })
        }
      },

      async signUp(email: string, password: string, fullName?: string) {
        set({ loading: true, error: null })

        try {
          const { user, session, error } = await auth.signUp({ email, password, fullName })

          if (error) {
            set({ error, loading: false })
            return
          }

          if (user && session) {
            set({ user, session, loading: false })
            // Novo usuário pode não ter organizações ainda
          }
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Erro ao criar conta',
            loading: false
          })
        }
      },

      async signInWithGoogle() {
        set({ loading: true, error: null })

        try {
          const { error } = await auth.signInWithGoogle()

          if (error) {
            set({ error, loading: false })
          }
          // O redirecionamento será tratado pelo onAuthStateChange
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Erro ao fazer login com Google',
            loading: false
          })
        }
      },

      async signOut() {
        set({ loading: true, error: null })

        try {
          const { error } = await auth.signOut()

          if (error) {
            set({ error, loading: false })
            return
          }

          set({
            user: null,
            session: null,
            currentOrg: null,
            organizations: [],
            loading: false
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Erro ao fazer logout',
            loading: false
          })
        }
      },

      async switchOrganization(orgId: string) {
        const state = get()

        // Verificar se usuário tem acesso à organização
        if (!state.user) return

        const hasAccess = await auth.hasAccessToOrg(state.user.id, orgId)
        if (!hasAccess) {
          set({ error: 'Acesso negado à organização selecionada' })
          return
        }

        const selectedOrg = state.organizations.find(org => org.id === orgId)
        if (!selectedOrg) {
          set({ error: 'Organização não encontrada' })
          return
        }

        set({ currentOrg: selectedOrg, error: null })

        // Atualizar o cliente Supabase com a nova org
        const clientWithOrg = createSupabaseClientWithOrg(orgId)
        // Aqui você pode armazenar o cliente com org para uso futuro
      },

      async initialize() {
        set({ loading: true })

        try {
          const session = await auth.getCurrentSession()

          if (session?.user) {
            set({ user: session.user, session })
            await get().loadUserOrganizations(session.user.id)
          } else {
            set({ user: null, session: null, currentOrg: null, organizations: [], loading: false })
          }
        } catch (err) {
          console.error('Error initializing auth:', err)
          set({
            user: null,
            session: null,
            currentOrg: null,
            organizations: [],
            loading: false,
            error: 'Erro ao inicializar autenticação'
          })
        }
      },

      async loadUserOrganizations(userId: string) {
        try {
          const userOrgs = await auth.getUserOrganizations(userId)
          const organizations = userOrgs.map(uo => uo.organization)

          set({ organizations })

          // Se só tiver uma organização, seleciona automaticamente
          if (organizations.length === 1) {
            set({ currentOrg: organizations[0] })
          }
          // Se tiver múltiplas, o usuário precisará escolher
        } catch (err) {
          console.error('Error loading user organizations:', err)
          set({ error: 'Erro ao carregar organizações' })
        }
      },

      clearError() {
        set({ error: null })
      }
    }),
    {
      name: 'alsham-auth-storage',
      partialize: (state) => ({
        // Segurança: não persistir user/session para forçar re-auth
        currentOrg: state.currentOrg,
        organizations: state.organizations
      })
    }
  )
)

// Auth state listener removido para evitar duplicação de lógica
// A lógica de auth é gerenciada exclusivamente pelo método initialize()



