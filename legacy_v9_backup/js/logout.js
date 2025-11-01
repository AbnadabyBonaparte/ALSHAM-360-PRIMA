/**
 * ALSHAM 360° PRIMA - Enterprise Logout System V5.4.0
 * CORRIGIDO: Aguarda Supabase carregar
 */

// Aguarda Supabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.signOut) {
    console.log("✅ Supabase carregado para Logout");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou");
    showNotification("Erro ao carregar sistema", "error");
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

// UI Helpers (fora do waitForSupabase)
function showNotification(message, type = "info") {
  console.log(`[${type.toUpperCase()}] ${message}`);
  const container = document.getElementById("toast-container");
  if (!container) return;
  
  const div = document.createElement("div");
  div.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
    type === "error"
      ? "bg-red-600"
      : type === "success"
      ? "bg-green-600"
      : type === "warning"
      ? "bg-yellow-500"
      : "bg-blue-600"
  }`;
  div.textContent = message;
  container.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

const showError = (m) => showNotification(m, "error");
const showSuccess = (m) => showNotification(m, "success");

// Aguarda Supabase antes de executar
waitForSupabase(() => {
  const {
    signOut,
    createAuditLog,
    getCurrentUser,
    getCurrentSession
  } = window.AlshamSupabase;

  // ==== CORE LOGOUT HANDLER ====
  async function handleLogout(redirect = "/index.html") {
    try {
      console.log("🔐 Logout iniciado...");
      let user = null;
      
      try {
        user = await getCurrentUser();
        if (!user) {
          const session = await getCurrentSession();
          user = session?.user || null;
        }
      } catch (e) {
        console.warn("⚠️ Não foi possível obter usuário antes do logout:", e);
      }

      // Logout oficial Supabase
      try {
        const result = await signOut();
        if (result?.error) throw result.error;
      } catch (e) {
        console.warn("⚠️ signOut falhou, fallback local:", e.message);
      }

      // Auditoria
      if (user?.id) {
        await createAuditLog("USER_LOGGED_OUT", {
          user_id: user.id,
          timestamp: new Date().toISOString(),
          details: "Logout realizado via logout.js v5.4.0"
        });
      }

      // Limpeza profunda
      const keysToClear = [
        "alsham_auth_state",
        "alsham_org_id",
        "alsham_registration_data",
        "supabase.auth.token",
        "supabase.auth.expires_at"
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();

      // Feedback + redirect
      showSuccess("Você saiu da sua conta com segurança.");
      setTimeout(() => {
        window.location.href = redirect;
      }, 1200);
      
      console.log("✅ Logout concluído");
    } catch (err) {
      console.error("❌ Erro no logout:", err);
      showError("Erro ao sair: " + (err.message || "desconhecido"));
      
      await createAuditLog("LOGOUT_FAILURE", {
        reason: err.message || "unknown",
        timestamp: new Date().toISOString()
      });

      setTimeout(() => {
        window.location.href = redirect;
      }, 2000);
    }
  }

  // ==== INIT ====
  document.addEventListener("DOMContentLoaded", async () => {
    const session = await getCurrentSession();
    if (!session?.user) {
      window.location.href = "/login.html";
      return;
    }

    const btn = document.querySelector("#logout-button");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        handleLogout();
      });
    }

    console.log("🚀 Logout System V5.4.0 pronto");
  });

  // ==== GLOBAL ====
  window.AlshamLogout = handleLogout;
});
