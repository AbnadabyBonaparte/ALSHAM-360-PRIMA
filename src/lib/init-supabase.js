// src/lib/init-supabase.js
console.info('Iniciando bootstrap do Supabase...');

async function bootstrapSupabase() {
  try {
    const module = await import('./attach-supabase.js');
    const initializer = module.ensureSupabaseGlobal || module.default;

    if (typeof initializer !== 'function') {
      throw new Error('attach-supabase.js não exporta função inicializadora.');
    }

    await initializer();
    console.info('Supabase carregado com sucesso!');
  } catch (err) {
    console.error('Falha ao carregar Supabase:', err);
    document.body.innerHTML = `
      <div style="padding:2rem;text-align:center;color:#b91c1c;">
        <h2>Erro de Inicialização</h2>
        <p>${err.message}</p>
        <button onclick="location.reload()">Tentar Novamente</button>
      </div>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapSupabase);
} else {
  bootstrapSupabase();
}
