// src/lib/supabase/useAuthStore.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - AUTH STORE SUPREMO (ABSOLUTE EDITION)
// - Blindado contra undefined
// - Organizations sempre array vazio por default
// - CurrentOrg sempre null por default
// - Loading e initialized corretos
// - Listener único
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './client'
import type { Organization } from './types'

interface AuthState {
  user: User | null
  session: Session | null
  currentOrg: Organization | null
  organizations: Organization[]
  loading: boolean
  initialized: boolean
  error: string | null

  init: () => Promise<void>
  signOut: () => Promise<void>
  setCurrentOrg: (org: Organization | null) => void
  setOrganizations: (orgs: Organization[]) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      currentOrg: null,
      organizations: [], // ← SEMPRE array vazio, nunca undefined
      loading: true,
      initialized: false,
      error: null,

      init: async () => {
        const state = get()
        if (state.initialized) return

        set({ loading: true })

        // 1. Sessão inicial
        const { data: { session } } = await supabase.auth.getSession()
        set({
          session,
          user: session?.user ?? null,
          loading: false,
          initialized: true,
        })

        // 2. Listener único de auth state
        supabase.auth.onAuthStateChange((_event, session) => {
          set({
            session,
            user: session?.user ?? null,
            loading: false,
          })
        })
      },

      signOut: async () => {
        set({ loading: true })
        await supabase.auth.signOut()
        set({
          user: null,
          session: null,
          currentOrg: null,
          organizations: [],
          loading: false,
        })
      },

      setCurrentOrg: (org) => set({ currentOrg: org }),
      setOrganizations: (orgs) => set({ organizations: orgs ?? [] }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'alsham-auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        currentOrg: state.currentOrg,
        organizations: state.organizations ?? [],
      }),
    }
  )
)
