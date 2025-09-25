/**
 * ALSHAM 360° PRIMA - Enterprise Token Refresh V5.0 NASA 10/10 OPTIMIZED
 * Mantém a sessão ativa em background com renovação automática
 *
 * @version 5.0.0 - NASA 10/10 FINAL BUILD
 * @license MIT
 */

// ===== IMPORTS GLOBAIS =====
const { getCurrentSession } = window.AlshamSupabase;
const { clearAuthenticatedUser } = window.AlshamAuth || {};

// ===== CONFIGURAÇÃO =====
const TOKEN_REFRESH_CONFIG = {
  intervalMs: 5 * 60 * 1000, // a cada 5 min
  warningThreshold: 10 * 60, // 10 min antes da expiração
  debug: true
};

// ===== ESTADO =====
let refreshInterval = null;
let lastSessionCheck = null;

// ===== UI HELPERS =====
function showRefreshNotification(message, type = "info") {
  if (!TOKEN_REFRESH_CONFIG.debug) return;
  const div = document.createElement("div");
  div.className = `fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
    type === "error"
      ? "bg-red-600"
      : type === "success"
      ? "bg-green-600"
      : "bg-blue-600"
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
      return;
    }

    const expiresAt = session.expires_at
      ? new Date(session.expires_at).getTime()
      : null;

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

      // Chamando getCurrentSession força o supabase-js a renovar
      const refreshed = await getCurrentSession();

      if (refreshed?.user) {
        showRefreshNotification("✅ Sessão renovada com sucesso.", "success");
      } else {
        showRefreshNotification("⚠️ Sessão inválida, faça login novamente.", "error");
        clearAuthenticatedUser?.();
        window.location.replace("/login.html");
      }
    }
  } catch (err) {
    console.error("❌ Erro no refresh automático:", err);
    showRefreshNotification("Erro ao renovar sessão", "error");
  }
}

// ===== INICIALIZAÇÃO =====
function startTokenRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(checkAndRefreshToken, TOKEN_REFRESH_CONFIG.intervalMs);
  checkAndRefreshToken(); // primeira execução imediata
  console.log("🔄 Token Refresh ativo - verificando a cada", TOKEN_REFRESH_CONFIG.intervalMs / 1000, "segundos");
}

function stopTokenRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log("🛑 Token Refresh parado.");
  }
}

// ===== EXPORT =====
export default { startTokenRefresh, stopTokenRefresh };
window.AlshamTokenRefresh = { start: startTokenRefresh, stop: stopTokenRefresh };

document.addEventListener("DOMContentLoaded", () => {
  startTokenRefresh();
});

console.log("🔄 Token Refresh v5.0 NASA 10/10 carregado - ALSHAM 360° PRIMA");
