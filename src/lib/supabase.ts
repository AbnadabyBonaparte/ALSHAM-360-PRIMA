/**
 * Supabase Client - Bridge file
 * Re-exporta todas as funcionalidades do módulo completo
 */

// Importa e re-exporta TUDO do módulo completo
export * from './supabase-full.js';

// Re-exporta os principais para compatibilidade
import { 
  getSupabaseClient,
  getCurrentSession,
  getCurrentOrgId 
} from './supabase-full.js';

export const supabase = getSupabaseClient();
export { getSupabaseClient, getCurrentSession, getCurrentOrgId };
