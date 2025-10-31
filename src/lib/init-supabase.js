// src/lib/init-supabase.js
console.log('Iniciando Supabase Init...');

async function bootstrapSupabase() {
  try {
    const module = await import('./attach-supabase.js');
    const initializer = module.ensureSupabaseGlobal || module.default;

    if (typeof initializer === 'function') {
      await initializer();
      console.log('Supabase carregado com sucesso!');
    } else {
      console.warn('Módulo attach-supabase não exporta uma função inicializadora.');
    }
  } catch (err) {
    console.error('Falha:', err);
  }
}

document.addEventListener('DOMContentLoaded', bootstrapSupabase);
