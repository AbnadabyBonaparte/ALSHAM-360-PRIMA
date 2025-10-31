// src/lib/init-supabase.js
console.info("🚀 Iniciando bootstrap do ALSHAM 360°...");

async function bootstrapSupabase() {
  try {
    console.log("🔐 Carregando módulo attach-supabase.js...");

    // Importa o módulo de inicialização do Supabase
    const module = await import("./attach-supabase.js");
    const initializer = module.ensureSupabaseGlobal || module.default;

    if (typeof initializer !== "function") {
      throw new Error("attach-supabase.js não exporta uma função inicializadora válida.");
    }

    // Executa inicialização principal
    await initializer();
    console.log("✅ Supabase inicializado com sucesso!");

    // Inicialização segura do PostHog (após Supabase)
    console.log("📊 Iniciando PostHog...");
    await initPostHog();

    console.info("🎉 Bootstrap do ALSHAM 360° concluído com sucesso!");
  } catch (err) {
    console.error("🚨 Falha crítica durante o bootstrap:", err);

    document.body.innerHTML = `
      <div style="padding:2rem;text-align:center;color:#b91c1c;font-family:sans-serif;">
        <h2>Erro de Inicialização</h2>
        <p style="margin:1rem 0;">${err.message}</p>
        <p>Ocorreu uma falha ao inicializar o ALSHAM 360°.</p>
        <button style="padding:0.5rem 1rem;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;"
                onclick="location.reload()">
          🔄 Tentar Novamente
        </button>
      </div>`;
  }
}

// Inicialização segura do PostHog com fallback
async function initPostHog() {
  try {
    if (typeof posthog?.init === "function") {
      posthog.init("phc_XZSAUQbnoAWAZiIUyaGu1mCnzVwhIO5huxXC7tv2ldA", {
        api_host: "https://us.i.posthog.com",
        capture_pageview: false,
        disable_session_recording: false,
        loaded: () => console.log("📈 PostHog inicializado e pronto!")
      });
    } else {
      console.warn("⚠️ PostHog não disponível — inicialização ignorada.");
    }
  } catch (error) {
    console.error("⚠️ Erro ao inicializar PostHog:", error);
  }
}

// Executa o bootstrap assim que o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapSupabase);
} else {
  bootstrapSupabase();
}
