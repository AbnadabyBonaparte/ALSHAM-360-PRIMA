// init-supabase.js
console.log("🔹 [Supabase Init] Iniciando...");

async function bootstrapSupabase() {
  try {
    const attachPath = '/assets/attach-supabase.js';

    let module = await import(attachPath).catch(async () => {
      const res = await fetch('/manifest.json').then(r => r.json());
      const assetFile = Object.keys(res).find(f => f.includes('attach-supabase'));
      if (assetFile) return import(`/assets/${assetFile}`);
      throw new Error('attach-supabase não encontrado no manifest');
    });

    if (module && module.default) {
      module.default();
      console.log("✅ Supabase carregado com sucesso!");
    }
  } catch (err) {
    console.error("❌ [Supabase Init] Falha:", err);
  }
}

document.addEventListener('DOMContentLoaded', bootstrapSupabase);
