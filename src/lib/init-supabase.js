// init-supabase.js
console.log('🔹 [Supabase Init] Iniciando...');

async function bootstrapSupabase() {
  try {
    const module = await import('./attach-supabase.js');
    const initializer = module.ensureSupabaseGlobal || module.default;

    if (typeof initializer === 'function') {
      await initializer();
      console.log('✅ Supabase carregado com sucesso!');
    } else {
      console.warn('⚠️ [Supabase Init] Módulo attach-supabase não exporta uma função inicializadora.');
    }
  } catch (err) {
    console.error('❌ [Supabase Init] Falha:', err);
  }
}

document.addEventListener('DOMContentLoaded', bootstrapSupabase);
