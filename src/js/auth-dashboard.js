/**
 * ALSHAM 360° PRIMA - Auth Dashboard V5.2 NASA 10/10 FINAL
 * Painel central de diagnóstico e auditoria de autenticação
 *
 * @version 5.2.0 - FINAL BUILD ENTERPRISE
 * @license MIT
 */

// ===== IMPORTS GLOBAIS =====
const { getCurrentSession, signOut, createAuditLog } = window.AlshamSupabase || {};
const SessionGuard = window.AlshamSessionGuard;
const TokenRefresh = window.AlshamTokenRefresh || { start: () => {}, stop: () => {} };

// ===== UI HELPERS =====
function logEvent(message, type = "info") {
  const container = document.getElementById("auth-events");
  if (!container) return;

  const line = document.createElement("div");
  const colors = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400"
  };
  line.className = colors[type] || "text-gray-200";
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function showToast(msg, type = "info") {
  const c = document.getElementById("toast-container");
  const t = document.createElement("div");
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500"
  };
  t.className = `${colors[type] || "bg-gray-700"} text-white px-4 py-2 rounded shadow mb-2`;
  t.textContent = msg;
  t.setAttribute("role", "alert");
  c.appendChild(t);
  setTimeout(() => c.removeChild(t), 4000);
}

// ===== SESSÃO ATUAL =====
async function loadSessionInfo() {
  try {
    const session = await getCurrentSession?.();
    const emailEl = document.getElementById("user-email");
    const idEl = document.getElementById("user-id");
    const orgEl = document.getElementById("user-org");
    const expEl = document.getElementById("session-expiry");

    if (session?.user) {
      emailEl.textContent = session.user.email || "--";
      idEl.textContent = session.user.id || "--";
      orgEl.textContent = session.user.user_metadata?.org_id || "N/A";
      expEl.textContent = session.expires_at
        ? new Date(session.expires_at).toLocaleString("pt-BR")
        : "N/A";
      logEvent(`Sessão ativa carregada: ${session.user.email}`, "success");
    } else {
      emailEl.textContent = "--";
      idEl.textContent = "--";
      orgEl.textContent = "--";
      expEl.textContent = "--";
      logEvent("Nenhuma sessão ativa detectada", "warning");
    }
  } catch (err) {
    logEvent("Erro ao carregar sessão: " + err.message, "error");
  }
}

// ===== GUARD =====
async function testSessionGuard() {
  try {
    const result = await SessionGuard?.();
    const guardStatus = document.getElementById("guard-status");
    guardStatus.textContent = result ? "✅ Sessão válida e rota permitida" : "❌ Acesso negado";
    guardStatus.className =
      "font-mono text-sm p-4 rounded-lg " + (result ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700");
    logEvent("Teste do Session Guard executado", result ? "success" : "error");
  } catch (e) {
    logEvent("Erro ao testar Session Guard: " + e.message, "error");
  }
}

// ===== TOKEN REFRESH =====
function startTokenRefresh() {
  TokenRefresh.start?.();
  document.getElementById("token-status").textContent = "🔄 Auto-refresh ativo";
  logEvent("Token Refresh iniciado", "info");
}
function stopTokenRefresh() {
  TokenRefresh.stop?.();
  document.getElementById("token-status").textContent = "🛑 Auto-refresh parado";
  logEvent("Token Refresh parado", "warning");
}

// ===== INVALIDAR SESSÃO =====
async function invalidateSession() {
  try {
    await signOut?.();
    await createAuditLog?.("SESSION_INVALIDATED", {
      timestamp: new Date().toISOString()
    });
    showToast("Sessão invalidada com sucesso", "success");
    logEvent("Sessão invalidada manualmente", "warning");
    setTimeout(() => (window.location.href = "/login.html"), 1200);
  } catch (err) {
    showToast("Erro ao invalidar sessão", "error");
    logEvent("Erro ao invalidar sessão: " + err.message, "error");
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  loadSessionInfo();

  document.getElementById("force-refresh").addEventListener("click", loadSessionInfo);
  document.getElementById("invalidate-session").addEventListener("click", invalidateSession);
  document.getElementById("test-guard").addEventListener("click", testSessionGuard);
  document.getElementById("start-refresh").addEventListener("click", startTokenRefresh);
  document.getElementById("stop-refresh").addEventListener("click", stopTokenRefresh);

  logEvent("Auth Dashboard inicializado", "info");
});

// ===== EXPORT =====
window.AuthDashboard = {
  refresh: loadSessionInfo,
  testGuard: testSessionGuard,
  startRefresh: startTokenRefresh,
  stopRefresh: stopTokenRefresh,
  invalidate: invalidateSession
};

console.log("🛡️ Auth Dashboard v5.2 pronto - ALSHAM 360° PRIMA");
