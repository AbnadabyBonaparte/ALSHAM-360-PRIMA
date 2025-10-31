// src/lib/init-supabase.js
// ALSHAM 360° PRIMA – BOOTSTRAP SUPABASE (V6.4-GRAAL-COMPLIANT+)

/**
 * Inicia o Supabase via attach-supabase.js
 * Compatível com Vercel, Vite, CDN e fallback
 */

console.info('Iniciando bootstrap do Supabase...');

async function bootstrapSupabase() {
  try {
    // Import dinâmico do attach-supabase
    const module = await import('./attach-supabase.js');

    // Prioriza ensureSupabaseGlobal, fallback para default
    const initializer = module.ensureSupabaseGlobal || module.default;

    if (typeof initializer !== 'function') {
      throw new Error('attach-supabase.js não exporta uma função inicializadora.');
    }

    // Executa a inicialização
    await initializer();

    console.info('Supabase carregado e conectado com sucesso!');
  } catch (err) {
    console.error('Falha crítica ao inicializar Supabase:', err);
    // Mostra erro visível no UI (opcional)
    document.body.insertAdjacentHTML(
      'afterbegin',
      `<div style="position:fixed;top:0;left:0;right:0;background:#b91c1c;color:white;padding:1rem;z-index:9999;font-family:sans-serif;">
        <strong>Erro:</strong> ${err.message}
        <br><small>Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel.</small>
      </div>`
    );
  }
}

// Executa assim que o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapSupabase);
} else {
  bootstrapSupabase();
}
