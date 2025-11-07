/**
 * Supabase Client Master - Bridge para supabase-full.js
 * Este arquivo importa TODAS as 570 funções do arquivo mestre
 */

// @ts-ignore - supabase-full.js tem 17k linhas sem types
import * as supabaseFull from './supabase-full.js';

// Re-exportar TUDO
export * from './supabase-full.js';

// Exportar principais com nomes específicos
// @ts-ignore
export const supabase = supabaseFull.getSupabaseClient();
// @ts-ignore
export const getSupabaseClient = supabaseFull.getSupabaseClient;
// @ts-ignore
export const getCurrentSession = supabaseFull.getCurrentSession;
// @ts-ignore
export const getCurrentOrgId = supabaseFull.getCurrentOrgId;
// @ts-ignore
export const getLeads = supabaseFull.getLeads;
// @ts-ignore
export const createLead = supabaseFull.createLead;
// @ts-ignore
export const updateLead = supabaseFull.updateLead;
// @ts-ignore
export const deleteLead = supabaseFull.deleteLead;

// Garantir que o cliente está inicializado
if (!supabase) {
  console.error('❌ Supabase client não inicializado!');
}

console.log('✅ Supabase Master carregado:', Object.keys(supabaseFull).length, 'exports');
