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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 GENERIC SELECT - EXPORTAÇÃO OBRIGATÓRIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const genericSelect = async (
  table: string,
  filters?: Record<string, any>,
  options?: {
    columns?: string;
    limit?: number;
    offset?: number;
    orderBy?: { column: string; ascending?: boolean };
  }
) => {
  try {
    const orgId = await getCurrentOrgId();
    if (!orgId) {
      throw new Error('Organização não identificada');
    }

    let query = supabase
      .from(table)
      .select(options?.columns || '*', { count: 'exact' });

    // Aplicar filtro de organização (SEMPRE)
    query = query.eq('org_id', orgId);

    // Aplicar filtros adicionais
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
    }

    // Aplicar ordenação
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }

    // Aplicar paginação
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      const start = options.offset;
      const end = start + (options.limit || 10) - 1;
      query = query.range(start, end);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    console.log(`✅ genericSelect: ${count} registros em ${table}`);

    return { 
      data, 
      error: null, 
      count 
    };
  } catch (error: any) {
    console.error(`❌ Erro em genericSelect (${table}):`, error);
    return { 
      data: null, 
      error, 
      count: 0 
    };
  }
};
