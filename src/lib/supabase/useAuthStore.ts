import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './client'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean

  init: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  init: async () => {
    if (get().initialized) return

    set({ loading: true })

    // 1️⃣ sessão inicial
    const { data } = await supabase.auth.getSession()

    set({
      session: data.session,
      user: data.session?.user ?? null,
      loading: false,
      initialized: true,
    })

    // 2️⃣ listener ÚNICO
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
      loading: false,
    })
  },
}))
