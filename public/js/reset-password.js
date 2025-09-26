/**
 * ALSHAM 360° PRIMA - Reset Password System V1.0
 * Fluxo seguro de redefinição de senha integrado ao Supabase
 *
 * @version 1.0.0 - Produção Ready
 * @author
 *   ALSHAM Development Team
 */

import { resetPassword } from "/src/lib/supabase.js";

// ===== STATE =====
const resetState = {
  email: "",
  isLoading: false,
  lastRequest: null
};

// ===== UI HELPERS =====
function showMessage(msg, type = "success") {
  const msgBox = document.getElementById("reset-message");
  const errBox = document.getElementById("reset-error");
  msgBox.classList.add("hidden");
  errBox.classList.add("hidden");

  if (type === "success") {
    msgBox.textContent = msg;
    msgBox.classList.remove("hidden");
  } else {
    errBox.textContent = msg;
    errBox.classList.remove("hidden");
  }
}
function showLoading(show) {
  const btn = document.querySelector("#reset-form button[type='submit']");
  if (!btn) return;
  btn.disabled = show;
  btn.textContent = show ? "⏳ Enviando..." : "Enviar link de redefinição";
}

// ===== CORE =====
async function handleReset(e) {
  e.preventDefault();
  const emailInput = document.getElementById("email");
  if (!emailInput) return;

  resetState.email = emailInput.value.trim();
  if (!resetState.email) {
    showMessage("⚠️ Digite um e-mail válido.", "error");
    return;
  }

  showLoading(true);
  try {
    const { error } = await resetPassword(resetState.email);
    if (error) throw error;

    resetState.lastRequest = new Date();
    showMessage("✅ Um link de redefinição foi enviado para seu e-mail.", "success");
  } catch (err) {
    console.error("❌ Erro redefinição:", err);
    showMessage("⚠️ Erro ao enviar link: " + (err.message || "desconhecido"), "error");
  } finally {
    showLoading(false);
  }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-form");
  if (form) {
    form.addEventListener("submit", handleReset);
  }
  console.log("🔒 Reset-Password.js carregado v1.0");
});

// ===== EXPORT =====
window.ResetPasswordSystem = {
  state: resetState,
  reset: handleReset
};
