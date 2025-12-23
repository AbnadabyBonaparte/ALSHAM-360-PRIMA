import { supabase } from './client'
import type { AuthUser, UserOrganizationWithDetails } from './types'

// Tipos para os métodos de auth
export type SignInCredentials = {
  email: string
  password: string
}

export type SignUpCredentials = {
  email: string
  password: string
  fullName?: string
}

export type AuthResponse = {
  user: AuthUser | null
  session: any | null
  error: string | null
}

// Auth methods
export const auth = {
  // Sign In com email/senha
  async signIn({ email, password }: SignInCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, session: null, error: error.message }
      }

      return {
        user: data.user,
        session: data.session,
        error: null
      }
    } catch (err) {
      return {
        user: null,
        session: null,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      }
    }
  },

  // Sign Up com email/senha
  async signUp({ email, password, fullName }: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        return { user: null, session: null, error: error.message }
      }

      return {
        user: data.user,
        session: data.session,
        error: null
      }
    } catch (err) {
      return {
        user: null,
        session: null,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      }
    }
  },

  // Sign In com Google OAuth
  async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      }
    }
  },

  // Sign Out
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      }
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      }
    }
  },

  // Update password
  async updatePassword(password: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      }
    }
  },

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
        return null
      }

      return session
    } catch (err) {
      console.error('Error getting session:', err)
      return null
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('Error getting user:', error)
        return null
      }

      return user
    } catch (err) {
      console.error('Error getting user:', err)
      return null
    }
  },

  // Listener para mudanças de estado de auth
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Obter organizações do usuário
  async getUserOrganizations(userId: string): Promise<UserOrganizationWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('user_organizations')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', userId)

      if (error) {
        console.error('Error getting user organizations:', error)
        return []
      }

      return data as UserOrganizationWithDetails[]
    } catch (err) {
      console.error('Error getting user organizations:', err)
      return []
    }
  },

  // Verificar se usuário tem acesso à organização
  async hasAccessToOrg(userId: string, orgId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_organizations')
        .select('id')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .single()

      if (error) {
        return false
      }

      return !!data
    } catch (err) {
      return false
    }
  }
}






