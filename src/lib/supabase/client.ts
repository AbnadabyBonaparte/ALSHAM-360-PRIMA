import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Cliente base do Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'alsham-360-prima@11.0.0',
      'X-Environment': 'production'
    }
  }
})

// Cliente com org_id injetado dinamicamente via JWT
export function createSupabaseClientWithOrg(orgId: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'alsham-360-prima@11.0.0',
        'X-Environment': 'production',
        'X-Organization-Id': orgId // Injeta org_id no header para RLS
      }
    }
  })
}

// Função para obter cliente com org_id atual
export function getSupabaseClientWithOrg() {
  // Esta função será implementada no auth store quando a org for selecionada
  // Por enquanto retorna o cliente base
  return supabase
}






