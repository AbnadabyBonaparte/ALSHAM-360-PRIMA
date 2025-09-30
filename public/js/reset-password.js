/**
 * 🔒 ALSHAM 360° PRIMA - Reset Password System V5.3.0
 * CORRIGIDO: Aguarda Supabase carregar
 */

// Aguarda Supabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.resetPassword) {
    console.log("✅ Supabase carregado para Reset Password");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou");
    showMessage("reset-error", "Erro ao carregar sistema", "error");
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

// UI Helpers (fora do waitForSupabase)
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

// Aguarda Supabase antes de executar
waitForSupabase(() => {
  const { resetPassword, createAuditLog } = window.AlshamSupabase;

  // ===== STATE =====
  const resetState = {
    isLoading: false,
    lastEmail: null
  };

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
      const { error } = await resetPassword(email);
      if (error) throw error;

      showMessage("reset-message", "✅ Um link de redefinição foi enviado para seu e-mail.", "success");
      await createAuditLog("PASSWORD_RESET_REQUEST", { email });
    } catch (err) {
      console.error("❌ Erro redefinição:", err);
      showMessage("reset-error", "⚠️ Erro ao enviar link: " + (err.message || "desconhecido"), "error");
      await createAuditLog("PASSWORD_RESET_FAILURE", { email, reason: err.message });
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
    console.log("🔒 Reset Password System v5.3.0 pronto");
  });

  // ===== EXPORT GLOBAL =====
  window.ResetPasswordSystem = {
    state: resetState,
    validateEmail,
    handlePasswordReset
  };
});
