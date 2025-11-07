/**
 * Supabase Master Bridge
 * Re-exporta TODAS as funções do supabase-full.js (17k linhas)
 */

// Re-exportar TUDO sem filtro
export * from './supabase-full.js';

// Log para debug
import * as supabaseFull from './supabase-full.js';
console.log('✅ Supabase Master carregado:', Object.keys(supabaseFull).length, 'exports');
