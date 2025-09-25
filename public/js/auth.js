/**
 * ALSHAM 360° PRIMA - Enterprise Authentication System V5.2 NASA 10/10
 * Middleware de autenticação com gestão de sessão em tempo real
 *
 * @version 5.2.0 - FINAL BUILD READY
 * @author ALSHAM
 */

// ===== IMPORTS GLOBAIS =====
const {
  getCurrentSession,
  onAuthStateChange,
  signOut,
  getUserProfile,
  updateUserProfile,
  createAuditLog,
  genericSelect
} = window.AlshamSupabase;

// ===== SISTEMA DE NOTIFICAÇÕES =====
function showAuthNotification(message, type = "info") {
  try {
    console.log(`[${type.toUpperCase()}] ${message}`);

    if (window.NavigationSystem?.showNotification) {
      window.NavigationSystem.showNotification(message, type);
      return;
    }

    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm ${getToastColor(
      type
    )}`;
    toast.textContent = message;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

function getToastColor(type) {
  switch (type) {
    case "success":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    default:
      return "bg-blue-500";
  }
}

// ===== VALIDAÇÃO DE DEPENDÊNCIAS =====
function requireLib(libName, lib) {
  if (!lib) throw new Error(`❌ Dependência ${libName} não carregada!`);
  return lib;
}
function validateAuthDependencies() {
  return {
    crypto: requireLib("Web Crypto API", window.crypto),
    localStorage: requireLib("Local Storage", window.localStorage),
    sessionStorage: requireLib("Session Storage", window.sessionStorage)
  };
}

// ===== GESTOR DE ESTADO DE AUTENTICAÇÃO =====
class AuthStateManager {
  constructor() {
    this.currentUser = null;
    this.currentProfile = null;
    this.currentOrganization = null;
    this.userBadges = [];
    this.userPermissions = [];
    this.isAuthenticated = false;
    this.sessionExpiry = null;
    this.refreshTimer = null;
    this.listeners = new Set();
  }

  async setAuthenticatedUser(user, profile, organization = null, badges = []) {
    this.currentUser = user;
    this.currentProfile = profile;
    this.currentOrganization = organization;
    this.userBadges = badges;
    this.isAuthenticated = true;
    this.sessionExpiry = new Date(user.expires_at || Date.now() + 3600000);

    await this.persistAuthState();
    this.setupSessionRefresh();
    this.notifyListeners("AUTHENTICATED", { user, profile, organization, badges });
    console.log("✅ Usuário autenticado:", user.email);
  }

  async clearAuthenticatedUser() {
    this.currentUser = null;
    this.currentProfile = null;
    this.currentOrganization = null;
    this.userBadges = [];
    this.userPermissions = [];
    this.isAuthenticated = false;
    this.sessionExpiry = null;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    await this.clearPersistedState();
    this.notifyListeners("UNAUTHENTICATED");
    console.log("✅ Sessão encerrada");
  }

  async persistAuthState() {
    try {
      const { localStorage } = validateAuthDependencies();
      const authState = {
        isAuthenticated: this.isAuthenticated,
        user: { id: this.currentUser?.id, email: this.currentUser?.email },
        profile: this.currentProfile,
        organization: this.currentOrganization,
        sessionExpiry: this.sessionExpiry?.toISOString(),
        version: "5.2.0"
      };
      localStorage.setItem("alsham_auth_state", JSON.stringify(authState));
    } catch (err) {
      console.error("🚨 Persistência de auth falhou:", err);
    }
  }

  async restorePersistedState() {
    try {
      const { localStorage } = validateAuthDependencies();
      const raw = localStorage.getItem("alsham_auth_state");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed.isAuthenticated && parsed.user) {
        this.currentUser = parsed.user;
        this.currentProfile = parsed.profile;
        this.currentOrganization = parsed.organization;
        this.isAuthenticated = true;
        this.sessionExpiry = parsed.sessionExpiry
          ? new Date(parsed.sessionExpiry)
          : new Date(Date.now() + 3600000);
        this.setupSessionRefresh();
        console.log("♻️ Sessão restaurada do localStorage");
        return true;
      }
    } catch (err) {
      console.error("🚨 Falha restaurando estado persistido:", err);
    }
    return false;
  }

  async clearPersistedState() {
    try {
      const { localStorage } = validateAuthDependencies();
      ["alsham_auth_state", "alsham_org_id"].forEach(k => localStorage.removeItem(k));
    } catch (err) {
      console.error("🚨 Erro limpando estado:", err);
    }
  }

  setupSessionRefresh() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (!this.sessionExpiry) return;
    const refreshTime = Math.max(this.sessionExpiry.getTime() - Date.now() - 300000, 60000);
    this.refreshTimer = setTimeout(() => this.refreshSession(), refreshTime);
  }

  async refreshSession() {
    try {
      const session = await getCurrentSession();
      if (session?.user) {
        this.sessionExpiry = new Date(session.expires_at || Date.now() + 3600000);
        this.setupSessionRefresh();
        console.log("✅ Sessão renovada");
      } else {
        await this.clearAuthenticatedUser();
      }
    } catch (err) {
      console.error("🚨 Erro ao renovar sessão:", err);
      await this.clearAuthenticatedUser();
    }
  }

  addListener(listener) {
    if (typeof listener === "function") this.listeners.add(listener);
  }
  removeListener(listener) {
    this.listeners.delete(listener);
  }
  notifyListeners(event, data = {}) {
    this.listeners.forEach(cb => cb(event, data));
  }
}

// ===== FUNÇÕES AUXILIARES =====
async function initializeAuth() {
  // Primeiro tenta restaurar sessão persistida
  const restored = await authState.restorePersistedState();

  if (!restored) {
    const session = await getCurrentSession();
    if (session?.user) {
      const profile = await getUserProfile(session.user.id);
      await authState.setAuthenticatedUser(session.user, profile?.data || null);
    } else {
      await authState.clearAuthenticatedUser();
    }
  }

  // Monitorar mudanças de auth
  onAuthStateChange((event, session) => handleAuthStateChange(event, session));
}

function handleAuthStateChange(event, session) {
  if (event === "SIGNED_IN" && session?.user) {
    getUserProfile(session.user.id).then(profile =>
      authState.setAuthenticatedUser(session.user, profile?.data || null)
    );
  }
  if (event === "SIGNED_OUT") {
    authState.clearAuthenticatedUser();
    redirectToLogin();
  }
}

function checkSessionValidity() {
  return !!authState.isAuthenticated && new Date() < authState.sessionExpiry;
}

function checkRouteAccess(route) {
  if (!authState.isAuthenticated) return false;
  if (route.includes("admin")) return authState.userPermissions.includes("admin");
  return true;
}

function updateAuthUI() {
  const userName = document.getElementById("user-name");
  if (userName && authState.currentProfile) {
    userName.textContent = authState.currentProfile.full_name || authState.currentUser.email;
  }
}

async function handleLogout() {
  try {
    await signOut();
    await authState.clearAuthenticatedUser();
    showAuthNotification("Logout realizado com sucesso", "success");
    redirectToLogin();
  } catch (err) {
    console.error("Erro no logout:", err);
    showAuthNotification("Erro no logout", "error");
  }
}

function redirectToLogin() {
  window.location.href = "/login.html";
}

function redirectAfterLogin() {
  const redirectUrl = localStorage.getItem("alsham_redirect_after_login") || "/";
  localStorage.removeItem("alsham_redirect_after_login");
  window.location.href = redirectUrl;
}

// ===== SINGLETON GLOBAL =====
const authState = new AuthStateManager();
const AlshamAuth = {
  get isAuthenticated() {
    return authState.isAuthenticated;
  },
  get currentUser() {
    return authState.currentUser;
  },
  logout: handleLogout,
  initializeAuth,
  checkRouteAccess,
  updateUI: updateAuthUI,
  checkSession: checkSessionValidity
};

window.AlshamAuth = AlshamAuth;
export {
  AlshamAuth,
  checkRouteAccess,   // agora pode importar isolado
  initializeAuth      // também disponível para bootstrap
};
export default AlshamAuth;

console.log("🔐 Enterprise Authentication v5.2.0 - ALSHAM 360° PRIMA");
