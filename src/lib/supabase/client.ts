import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Fall back to a valid placeholder instead of throwing at module load. An unset
// env var would make createClient throw "supabaseUrl is required" and blank the
// entire app before it renders. In degraded mode the client constructs fine;
// Supabase-backed features simply fail their requests until real keys are set.
const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!rawUrl || !rawKey) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — running in degraded mode (backend features disabled).'
  )
}

const supabaseUrl = rawUrl || 'https://placeholder.supabase.co'
const supabaseAnonKey = rawKey || 'placeholder-key'

const GLOBAL_KEY = '__ALSHAM_SUPABASE_CLIENT__'
const STORAGE_KEY = 'alsham-360-prima-auth' // importante: único e consistente

function createSingleton(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
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
export const supabase: SupabaseClient =
  (globalThis as any)[GLOBAL_KEY] ?? ((globalThis as any)[GLOBAL_KEY] = createSingleton())

// ⚠️ NÃO crie outro createClient aqui. Se precisar de org, use headers por requisição (RPC/edge) ou RLS via JWT.
// Mantendo por compatibilidade, mas SEM criar instância nova:
export function getSupabaseClientWithOrg() {
  return supabase
}






