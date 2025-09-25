/**
 * ALSHAM 360° PRIMA - Enterprise Session Guard V5.0 NASA 10/10 OPTIMIZED
 * Middleware de proteção de rotas com verificação em tempo real
 *
 * @version 5.0.0 - NASA 10/10 FINAL BUILD
 * @license MIT
 */

// ===== IMPORTS GLOBAIS =====
const { getCurrentSession, onAuthStateChange } = window.AlshamSupabase;
const { checkRouteAccess } = window.AlshamAuth || {};

// ===== CONFIGURAÇÃO =====
const SESSION_GUARD_CONFIG = {
  loginPage: "/login.html",
  publicRoutes: ["/login.html", "/register.html", "/index.html"],
  redirectDelay: 1000,
  debug: true
};

// ===== UI HELPERS =====
function showGuardNotification(message, type = "info") {
  if (SESSION_GUARD_CONFIG.debug) console.log(`[GUARD][${type}] ${message}`);
  const div = document.createElement("div");
  div.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
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

// ===== VERIFICAÇÃO DE ROTA =====
async function enforceSessionGuard() {
  try {
    const path = window.location.pathname;
    if (SESSION_GUARD_CONFIG.publicRoutes.includes(path)) {
      if (SESSION_GUARD_CONFIG.debug) console.log("🌍 Public route, guard not enforced.");
      return;
    }

    const session = await getCurrentSession();
    const isAuthenticated = !!session?.user;

    // Verificação de permissões adicionais
    const routeAllowed =
      typeof checkRouteAccess === "function"
        ? checkRouteAccess(path)
        : isAuthenticated;

    if (!isAuthenticated || !routeAllowed) {
      showGuardNotification("⚠️ Acesso negado. Redirecionando para login...", "error");
      setTimeout(() => {
        window.location.replace(SESSION_GUARD_CONFIG.loginPage);
      }, SESSION_GUARD_CONFIG.redirectDelay);
      throw new Error("Sessão inválida ou rota não autorizada");
    }

    showGuardNotification("🔒 Sessão válida. Acesso permitido.", "success");
    if (SESSION_GUARD_CONFIG.debug) console.log("✅ Session guard passed:", session.user.email);
  } catch (err) {
    console.error("❌ Session guard error:", err);
  }
}

// ===== EVENTOS DE ESTADO =====
document.addEventListener("DOMContentLoaded", () => {
  enforceSessionGuard();
  onAuthStateChange((event, session) => {
    if (SESSION_GUARD_CONFIG.debug) console.log("🔄 Auth event:", event);
    if (event === "SIGNED_OUT" || !session?.user) {
      enforceSessionGuard();
    }
  });
});

// ===== EXPORT =====
export default enforceSessionGuard;
window.AlshamSessionGuard = enforceSessionGuard;

console.log("🛡️ Session Guard v5.0 NASA 10/10 carregado - ALSHAM 360° PRIMA");
