// ✅ Auditado em 10/10/2025 - Padrão window globals correto
/**
 * 🔐 ALSHAM 360° PRIMA - Reset Password Confirmation V2.0
 * CORRIGIDO: Aguarda Supabase carregar e sem imports ES6
 */

// Aguarda Supabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.supabase) {
    console.log("✅ Supabase carregado para Reset Confirm");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou");
    showMessage("confirm-error", "Erro ao carregar sistema", "error");
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
  }
}

function clearMessages() {
  ["confirm-message", "confirm-error"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
}

// Aguarda Supabase antes de executar
waitForSupabase(() => {
  const { supabase, createAuditLog } = window.AlshamSupabase;

  console.log("🔐 Reset password confirmation page initialized");

  const form = document.getElementById("confirm-form");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm");

  if (!form) {
    console.error("❌ Form não encontrado");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();

    const password = passwordInput.value.trim();
    const confirm = confirmInput.value.trim();

    if (password !== confirm) {
      showMessage("confirm-error", "As senhas não coincidem.", "error");
      return;
    }

    if (password.length < 8) {
      showMessage("confirm-error", "A senha deve ter pelo menos 8 caracteres.", "error");
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      showMessage("confirm-message", "✅ Senha redefinida com sucesso! Você já pode fazer login.", "success");
      
      await createAuditLog("PASSWORD_RESET_COMPLETED", { 
        user: data.user?.email || "unknown" 
      });

      setTimeout(() => {
        window.location.href = "/login.html";
      }, 2000);
    } catch (err) {
      console.error("❌ Reset password error:", err);
      showMessage("confirm-error", err.message || "Erro ao redefinir senha.", "error");
      
      await createAuditLog("PASSWORD_RESET_FAILED", { 
        error: err.message 
      });
    }
  });
});
