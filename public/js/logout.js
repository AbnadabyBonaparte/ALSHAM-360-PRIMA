/**
 * ALSHAM 360° PRIMA - Enterprise Logout System V5.4.0 NASA 10/10
 * Logout seguro com auditoria, cleanup profundo e compatível com Cypress.
 *
 * @version 5.4.0 - ENTERPRISE FINAL BUILD
 */

const { supabase, createAuditLog, getCurrentUser, getCurrentSession } =
  window.AlshamSupabase || {};

// ==== UI HELPERS ====
function ensureToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-4 right-4 z-50 space-y-2";
    document.body.appendChild(container);
  }
  return container;
}

function showNotification(message, type = "info") {
  console.log(`[${type.toUpperCase()}] ${message}`);
  const container = ensureToastContainer();
  const div = document.createElement("div");
  div.className = `px-4 py-2 rounded-lg shadow-lg text-white ${
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

// ==== CORE LOGOUT HANDLER ====
async function handleLogout(redirect = "/index.html") {
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

    // Supabase signOut oficial
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e) {
      console.warn("⚠️ supabase.auth.signOut falhou:", e.message);
    }

    // Auditoria
    await createAuditLog?.("USER_LOGGED_OUT", {
      user_id: user?.id || "anonymous",
      timestamp: new Date().toISOString(),
      details: "Logout realizado via logout.js v5.4.0"
    });

    // Cleanup local
    const keysToClear = [
      "alsham_auth_state",
      "alsham_org_id",
      "alsham_registration_data",
      "supabase.auth.token",
      "supabase.auth.expires_at"
    ];
    keysToClear.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();

    showSuccess("Você saiu da sua conta com segurança.");
    setTimeout(() => {
      window.location.href = redirect;
    }, 1200);

    console.log("✅ Logout concluído");
  } catch (err) {
    console.error("❌ Erro no logout:", err);
    showError("Erro ao sair: " + (err.message || "desconhecido"));
    await createAuditLog?.("LOGOUT_FAILURE", {
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
  const session = await getCurrentSession?.();
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
  console.log("🚀 Logout System V5.4.0 pronto - ALSHAM 360° PRIMA");
});

// ==== EXPORT ====
export default handleLogout;
window.AlshamLogout = handleLogout;
