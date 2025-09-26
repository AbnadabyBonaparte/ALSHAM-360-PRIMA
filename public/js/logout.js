/**
 * ALSHAM 360° PRIMA - Enterprise Logout System V5.2.0 NASA 10/10 FINAL
 * Handles secure logout with audit logging, fallback resilience and
 * complete session termination across storage layers.
 *
 * @version 5.2.0 - FINAL BUILD READY
 * @license MIT
 */

// ===== IMPORTAÇÕES GLOBAIS =====
const {
  signOut,
  createAuditLog,
  getCurrentUser,
  getCurrentSession
} = window.AlshamSupabase || {};

// ===== UI HELPERS =====
function showNotification(message, type = "info") {
  console.log(`[${type.toUpperCase()}] ${message}`);
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
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}
const showError = (m) => showNotification(m, "error");
const showSuccess = (m) => showNotification(m, "success");

// ===== CORE LOGOUT HANDLER =====
async function handleLogout(redirect = "/login.html") {
  try {
    console.log("🔐 Logout iniciado...");
    let user = null;

    try {
      user = await getCurrentUser?.();
      if (!user) {
        const session = await getCurrentSession?.();
        user = session?.user || null;
      }
    } catch (e) {
      console.warn("⚠️ Não foi possível obter usuário antes do logout:", e);
    }

    // Executa signOut no Supabase
    let result = null;
    try {
      result = await signOut?.();
      if (result?.error) throw result.error;
    } catch (e) {
      console.warn("⚠️ signOut falhou, prosseguindo com fallback:", e.message);
    }

    // Auditoria
    if (user?.id) {
      await createAuditLog?.("USER_LOGGED_OUT", {
        user_id: user.id,
        timestamp: new Date().toISOString(),
        details: "User signed out via logout.js v5.2.0"
      });
    }

    // Limpeza de dados locais (profunda)
    const keysToClear = [
      "alsham_auth_state",
      "alsham_org_id",
      "alsham_registration_data",
      "supabase.auth.token",
      "supabase.auth.expires_at"
    ];
    keysToClear.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();

    // Feedback
    showSuccess("Você saiu da sua conta com segurança.");

    // Redirecionamento
    setTimeout(() => {
      window.location.href = redirect;
    }, 1200);

    console.log("✅ Logout concluído com sucesso");
  } catch (err) {
    console.error("❌ Erro no logout:", err);
    showError("Erro ao sair: " + (err.message || "desconhecido"));
    await createAuditLog?.("LOGOUT_FAILURE", {
      reason: err.message || "unknown",
      timestamp: new Date().toISOString()
    });
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("#logout-button");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
  console.log("🚀 Logout System V5.2.0 pronto - ALSHAM 360° PRIMA");
});

// ===== EXPORT =====
export default handleLogout;
window.AlshamLogout = handleLogout;
