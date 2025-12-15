import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const GLOBAL_KEY = '__ALSHAM_SUPABASE_CLIENT__'
const STORAGE_KEY = 'alsham-360-prima-auth' // importante: único e consistente

function createSingleton(): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: STORAGE_KEY,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
    global: {
      headers: {
        'X-Client-Info': 'alsham-360-prima@11.0.0',
        'X-Environment': 'production',
      },
    },
  })
}

// ✅ garante 1 instância por navegador (evita warning do GoTrue)
export const supabase: SupabaseClient<Database> =
  (globalThis as any)[GLOBAL_KEY] ?? ((globalThis as any)[GLOBAL_KEY] = createSingleton())

// ⚠️ NÃO crie outro createClient aqui. Se precisar de org, use headers por requisição (RPC/edge) ou RLS via JWT.
// Mantendo por compatibilidade, mas SEM criar instância nova:
export function getSupabaseClientWithOrg() {
  return supabase
}
