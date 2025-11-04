// ✅ Auditado em 10/10/2025 - Padrão window globals correto
/**
 * ALSHAM 360° PRIMA - Enterprise Token Refresh V5.2
 * CORRIGIDO: Aguarda Supabase carregar e sem exports ES6
 */

// Aguarda Supabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.getCurrentSession) {
    console.log("✅ Supabase carregado para Token Refresh");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou - Token Refresh desabilitado");
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

// Aguarda Supabase antes de executar
waitForSupabase(() => {
  const { getCurrentSession, createAuditLog } = window.AlshamSupabase;
  const { clearAuthenticatedUser } = window.AlshamAuth || {};

  // ===== CONFIGURAÇÃO =====
  const TOKEN_REFRESH_CONFIG = {
    intervalMs: 5 * 60 * 1000,
    warningThreshold: 15 * 60,
    redirectOnFail: "/login.html",
    auditEnabled: true,
    debug: true
  };

  // ===== ESTADO =====
  let refreshInterval = null;
  let lastSessionCheck = null;
  let lastUserId = null;

  // ===== UI HELPERS =====
  function showRefreshNotification(message, type = "info") {
    if (!TOKEN_REFRESH_CONFIG.debug) return;
    const div = document.createElement("div");
    div.className = `fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
      type === "error" ? "bg-red-600" : type === "success" ? "bg-green-600" : "bg-blue-600"
    }`;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }

  // ===== REFRESH AUTOMÁTICO =====
  async function checkAndRefreshToken() {
    try {
      const session = await getCurrentSession();
      lastSessionCheck = new Date();

      if (!session?.user) {
        showRefreshNotification("⚠️ Nenhuma sessão ativa encontrada.", "error");
        clearAuthenticatedUser?.();
        handleSessionExpired("NO_SESSION");
        return;
      }

      const expiresAt = session.expires_at ? new Date(session.expires_at).getTime() : null;

      if (!expiresAt) {
        showRefreshNotification("⚠️ Sessão sem expiração definida.", "warning");
        return;
      }

      const now = Date.now();
      const secondsLeft = Math.floor((expiresAt - now) / 1000);

      if (TOKEN_REFRESH_CONFIG.debug) {
        console.log("⏳ Tempo restante sessão:", secondsLeft, "segundos");
      }

      if (secondsLeft <= TOKEN_REFRESH_CONFIG.warningThreshold) {
        showRefreshNotification("🔄 Renovando sessão...", "info");
        const refreshed = await getCurrentSession();
        if (refreshed?.user) {
          if (TOKEN_REFRESH_CONFIG.auditEnabled && refreshed.user.id !== lastUserId) {
            await createAuditLog?.("SESSION_REFRESHED", {
              user: refreshed.user.id,
              email: refreshed.user.email,
              timestamp: new Date().toISOString()
            });
            lastUserId = refreshed.user.id;
          }
          showRefreshNotification("✅ Sessão renovada com sucesso.", "success");
        } else {
          handleSessionExpired("REFRESH_FAILED");
        }
      }
    } catch (err) {
      console.error("❌ Erro no refresh automático:", err);
      showRefreshNotification("Erro ao renovar sessão", "error");
      handleSessionExpired("ERROR", err.message);
    }
  }

  // ===== TRATAMENTO DE EXPIRAÇÃO =====
  async function handleSessionExpired(reason = "EXPIRED", details = "") {
    try {
      if (TOKEN_REFRESH_CONFIG.auditEnabled && lastUserId) {
        await createAuditLog?.("SESSION_EXPIRED", {
          user: lastUserId,
          reason,
          details,
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      clearAuthenticatedUser?.();
      setTimeout(() => {
        window.location.replace(TOKEN_REFRESH_CONFIG.redirectOnFail);
      }, 1500);
    }
  }

  // ===== INICIALIZAÇÃO =====
  function startTokenRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(checkAndRefreshToken, TOKEN_REFRESH_CONFIG.intervalMs);
    checkAndRefreshToken();
    console.log("🔄 Token Refresh ativo - verificando a cada", TOKEN_REFRESH_CONFIG.intervalMs / 1000, "segundos");
  }

  function stopTokenRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
      console.log("🛑 Token Refresh parado.");
    }
  }

  // ===== EXPORT GLOBAL =====
  window.AlshamTokenRefresh = { 
    start: startTokenRefresh, 
    stop: stopTokenRefresh,
    startTokenRefresh,
    stopTokenRefresh
  };

  document.addEventListener("DOMContentLoaded", () => {
    startTokenRefresh();
  });

  console.log("🔄 Token Refresh v5.2 carregado");
});
