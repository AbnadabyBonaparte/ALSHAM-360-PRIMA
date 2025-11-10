/**
 * Supabase Master Bridge
 * Re-exporta TODAS as funções do supabase-full.js (17k linhas)
 */

// Re-exportar TUDO sem filtro
export * from './supabase-full.js';

// Log para debug
import * as supabaseFull from './supabase-full.js';
console.log('✅ Supabase Master carregado:', Object.keys(supabaseFull).length, 'exports');

// Funções personalizadas para LeadsDetails (usando genéricas do full.js)
export async function getLead(id: string) {
  const { data, error } = await genericSelect('leads_crm', { id });
  if (error) throw new Error(error.message);
  return data[0]; // Retorna o lead único ou undefined se não existir
}

export async function updateLead(id: string, updates: any) {
  const { data, error } = await genericUpdate('leads_crm', { id }, updates);
  if (error) throw new Error(error.message);
  return data;
}

export async function getLeadInteractions(leadId: string) {
  const { data, error } = await genericSelect('lead_interactions', { lead_id: leadId });
  if (error) throw new Error(error.message);
  return data;
}

// subscribeLeads já existe no full.js, então o re-export deve funcionar
