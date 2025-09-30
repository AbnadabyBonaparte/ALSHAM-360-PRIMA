/**
 * 🔒 ALSHAM 360° PRIMA - Reset Password System V5.3.0 NASA 10/10
 * Corrigido para Supabase v2 + Cypress
 *
 * @version 5.3.0 - PRODUÇÃO FINAL BUILD
 * @license MIT
 */

const { supabase, createAuditLog } = window.AlshamSupabase || {};

// ===== STATE =====
const resetState = {
  isLoading: false,
  lastEmail: null
};

// ===== UI HELPERS =====
function showMessage(id, msg, type = "info") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");

  if (type === "error") {
    el.className = "mt-4 text-sm text-red-600";
  } else if (type === "success") {
    el.className = "mt-4 text-sm text-green-600";
  } else {
    el.className = "mt-4 text-sm text-gray-600";
  }
}
function clearMessages() {
  ["reset-message", "reset-error"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
}
function showLoading(btn, show) {
  if (!btn) return;
  btn.disabled = show;
  btn.textContent = show ? "⏳ Enviando..." : "Enviar link de redefinição";
}

// ===== VALIDATION =====
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ===== CORE =====
async function handlePasswordReset(e) {
  e.preventDefault();
  clearMessages();

  const emailInput = document.getElementById("email");
  const btn = e.target.querySelector("button[type='submit']");
  const email = emailInput?.value?.trim();

  if (!validateEmail(email)) {
    showMessage("reset-error", "⚠️ Insira um e-mail válido.", "error");
    return;
  }

  showLoading(btn, true);
  resetState.isLoading = true;
  resetState.lastEmail = email;

  try {
    // ✅ Supabase v2 API
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });
    if (error) throw error;

    showMessage("reset-message", "✅ Um link de redefinição foi enviado para seu e-mail.", "success");
    await createAuditLog?.("PASSWORD_RESET_REQUEST", { email });
  } catch (err) {
    console.error("❌ Erro redefinição:", err);
    showMessage("reset-error", "⚠️ Erro ao enviar link: " + (err.message || "desconhecido"), "error");
    await createAuditLog?.("PASSWORD_RESET_FAILURE", { email, reason: err.message });
  } finally {
    showLoading(btn, false);
    resetState.isLoading = false;
  }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-form");
  if (form) {
    form.addEventListener("submit", handlePasswordReset);
  }
  console.log("🔒 Reset Password System v5.3.0 pronto - ALSHAM 360° PRIMA");
});

// ===== EXPORT =====
window.ResetPasswordSystem = {
  state: resetState,
  validateEmail,
  handlePasswordReset
};
export default window.ResetPasswordSystem;
