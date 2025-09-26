/**
 * ALSHAM 360° PRIMA - Enterprise Logout System V5.1 NASA 10/10 OPTIMIZED
 * Handles secure logout with audit logging and clean session termination.
 *
 * @version 5.1.0 - FINAL BUILD READY
 * @license MIT
 */

// ===== IMPORTAÇÕES GLOBAIS =====
const { signOut, createAuditLog, getCurrentUser } = window.AlshamSupabase;

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

// ===== LOGOUT HANDLER =====
async function handleLogout(redirect = "/login.html") {
  try {
    console.log("🔐 Logout iniciado...");
    const user = await getCurrentUser();

    // Executa signOut Supabase
    const result = await signOut();
    if (result?.error) throw result.error;

    // Log de auditoria
    if (user?.id) {
      await createAuditLog("USER_LOGGED_OUT", {
        user_id: user.id,
        timestamp: new Date().toISOString(),
        details: "User signed out via logout.js"
      });
    }

    // Limpa dados locais
    ["alsham_auth_state", "alsham_org_id", "alsham_registration_data"].forEach(k =>
      localStorage.removeItem(k)
    );

    // Notificação
    showSuccess("Você saiu da sua conta com segurança.");

    // Redireciona
    setTimeout(() => {
      window.location.href = redirect;
    }, 1000);

    console.log("✅ Logout concluído com sucesso");
  } catch (err) {
    console.error("❌ Erro no logout:", err);
    showError("Erro ao sair: " + (err.message || "desconhecido"));
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
  console.log("🚀 Logout System V5.1 pronto - ALSHAM 360° PRIMA");
});

// ===== EXPORT =====
export default handleLogout;
window.AlshamLogout = handleLogout;
