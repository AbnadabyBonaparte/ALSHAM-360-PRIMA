/**
 * 🔒 ALSHAM 360° PRIMA - Reset Password System v1.0.0
 * Sistema enterprise para redefinição de senha via Supabase
 *
 * @version 1.0.0 - NASA 10/10 READY
 * @author
 *   ALSHAM Development Team
 */

import { resetPassword } from "/src/lib/supabase.js";

// ==============================
// STATE
// ==============================
const resetState = {
  isLoading: false,
  lastRequest: null
};

// ==============================
// HELPERS
// ==============================
function showMessage(msg, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500"
  };
  toast.className = `${colors[type] || "bg-gray-700"} text-white px-4 py-2 rounded shadow mb-2`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function showLoading(show) {
  resetState.isLoading = show;
  const btn = document.querySelector("#reset-form button[type='submit']");
  if (btn) btn.disabled = show;
}

// ==============================
// HANDLER
// ==============================
async function handleResetPassword(e) {
  e.preventDefault();

  const email = document.getElementById("email")?.value.trim();
  const msg = document.getElementById("reset-message");
  const err = document.getElementById("reset-error");

  msg.classList.add("hidden");
  err.classList.add("hidden");

  if (!email) {
    err.textContent = "⚠️ Por favor, insira um e-mail válido.";
    err.classList.remove("hidden");
    return;
  }

  try {
    showLoading(true);
    const { error } = await resetPassword(email);
    if (error) throw error;

    msg.textContent = "✅ Um link de redefinição foi enviado para seu e-mail.";
    msg.classList.remove("hidden");
    showMessage("Link enviado para o e-mail informado", "success");
    resetState.lastRequest = new Date();
  } catch (ex) {
    console.error("❌ Erro reset-password:", ex);
    err.textContent = "⚠️ Erro ao enviar link: " + (ex.message || "desconhecido");
    err.classList.remove("hidden");
    showMessage("Erro ao enviar link de redefinição", "error");
  } finally {
    showLoading(false);
  }
}

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-form");
  if (form) {
    form.addEventListener("submit", handleResetPassword);
  }
  console.log("🔒 Reset Password System v1.0.0 pronto - ALSHAM 360° PRIMA");
});

// ==============================
// EXPORT
// ==============================
window.ResetPasswordSystem = {
  submit: handleResetPassword,
  state: resetState,
  version: "1.0.0"
};
