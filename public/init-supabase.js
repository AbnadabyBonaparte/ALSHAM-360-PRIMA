/**
 * 🔌 ALSHAM 360° PRIMA - SUPABASE INITIALIZATION SCRIPT
 * -----------------------------------------------------
 * Compatível com ambiente local (Vite) e produção (Vercel)
 * Carrega automaticamente o SDK Supabase via CDN e cria o cliente global.
 */

(function () {
  console.log("⚡ Iniciando Supabase global...");

  // ✅ CONFIGURAÇÕES DO SUPABASE
  const SUPABASE_URL = "https://rgvnbtuqtxvfxhrdnkjg.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NjU3NTIsImV4cCI6MjA1MDE0MTc1Mn0.ey3hbGci0i1JIUzI1NiIsInR5cCI6IkpXVCJ9"; // 🔑 Substitua se necessário

  /**
   * 📦 Carrega o Supabase via CDN, caso ainda não esteja presente
   */
  function loadSupabaseFromCDN() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) {
        console.log("✅ Supabase já carregado no ambiente");
        return resolve();
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.crossOrigin = "anonymous";
      script.async = true;

      script.onload = () => {
        console.log("✅ Supabase CDN carregado com sucesso");
        resolve();
      };

      script.onerror = () => {
        console.error("❌ Falha ao carregar Supabase CDN");
        reject(new Error("Falha ao carregar o Supabase via CDN"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 🧠 Inicializa o cliente global
   */
  async function initializeSupabase() {
    try {
      await loadSupabaseFromCDN();

      const { createClient } = window.supabase;

      window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          storageKey: "alsham.auth.token",
        },
      });

      console.log("✅ Cliente Supabase inicializado!");
      console.log("🌍 URL:", SUPABASE_URL);

      // Testa sessão ativa
      window.supabase.auth.getSession().then(({ data, error }) => {
        if (error) console.warn("⚠️ Erro ao recuperar sessão:", error);
        else if (data.session) console.log("✅ Sessão ativa detectada");
        else console.log("ℹ️ Nenhuma sessão ativa");
      });

      // Evento global
      window.dispatchEvent(new Event("supabase-ready"));
    } catch (err) {
      console.error("💥 Erro fatal ao inicializar Supabase:", err);
    }
  }

  // 🚀 Executar inicialização
  initializeSupabase();
})();
