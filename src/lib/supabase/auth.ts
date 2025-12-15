// src/lib/supabase/auth.ts
import { supabase } from './client'
import type { User, Session } from '@supabase/supabase-js'

/**
 * Wrapper único de autenticação.
 * ✅ NÃO cria client novo.
 * ✅ NÃO reexporta createClient.
 * ✅ Redirect de reset alinhado com sua rota /auth/reset-password.
 */

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, any>
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : ''

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // ✅ rota correta do seu App.tsx
    redirectTo: `${origin}/auth/reset-password`,
  })

  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}
