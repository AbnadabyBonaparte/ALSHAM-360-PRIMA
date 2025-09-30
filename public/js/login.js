/**
 * ALSHAM 360° PRIMA - Enterprise Login System V5.3 NASA 10/10
 * Corrigido para compatibilidade com Supabase v2 + Cypress
 */

const {
  supabase,
  resetPassword,
  getCurrentSession,
  onAuthStateChange,
  signOut,
  createAuditLog
} = window.AlshamSupabase;

// ===== DEPENDENCY VALIDATION =====
function requireLib(libName, lib) {
  if (!lib) throw new Error(`❌ Dependência ${libName} não carregada!`);
  return lib;
}
function validateDependencies() {
  return {
    localStorage: requireLib("localStorage", window.localStorage),
    sessionStorage: requireLib("sessionStorage", window.sessionStorage),
    crypto: requireLib("Web Crypto API", window.crypto),
    performance: requireLib("Performance API", window.performance),
    navigator: requireLib("Navigator API", window.navigator),
    history: requireLib("History API", window.history)
  };
}

// ===== LOGIN CONFIGURATION =====
const LOGIN_CONFIG = Object.freeze({
  SECURITY: { MAX_ATTEMPTS: 5, LOCKOUT_DURATION: 300000 },
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_STRENGTH_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  },
  OAUTH_PROVIDERS: [
    { id: "google", name: "Google", icon: "🔍", enabled: true },
    { id: "microsoft", name: "Microsoft", icon: "🪟", enabled: true }
  ]
});

// ===== STATE MANAGER =====
class LoginStateManager {
  constructor() {
    this.state = { isAuthenticated: false, attemptCount: 0, isLocked: false };
  }
  setState(updates) {
    Object.assign(this.state, updates);
  }
}
const loginState = new LoginStateManager();

// ===== DOM MANAGER =====
class DOMElementsManager {
  constructor() {
    this.elements = {};
  }
  initialize() {
    const selectors = {
      form: "#login-form",
      email: "#email",
      password: "#password",
      loginBtn: "#login-btn",
      loginBtnText: "#login-btn-text",
      loginSpinner: "#login-spinner",
      errorBox: "#error-message",
      errorText: "#error-text",
      successBox: "#success-message",
      successText: "#success-text"
    };
    for (const [k, s] of Object.entries(selectors)) {
      this.elements[k] = document.querySelector(s);
    }
  }
  get(key) {
    return this.elements[key] || null;
  }
}
const domElements = new DOMElementsManager();

// ===== UI HELPERS =====
function showLoading(show, text = "Carregando...") {
  const btn = domElements.get("loginBtn");
  const btnText = domElements.get("loginBtnText");
  const spinner = domElements.get("loginSpinner");
  if (!btn) return;
  btn.disabled = show;
  if (btnText) btnText.textContent = show ? text : "Entrar";
  if (spinner) spinner.style.display = show ? "inline-block" : "none";
}
function showError(msg) {
  const box = domElements.get("errorBox");
  const text = domElements.get("errorText");
  if (box && text) {
    text.textContent = msg;
    box.classList.remove("hidden");
  }
}
function showSuccess(msg) {
  const box = domElements.get("successBox");
  const text = domElements.get("successText");
  if (box && text) {
    text.textContent = msg;
    box.classList.remove("hidden");
  }
}

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  try {
    validateDependencies();
    domElements.initialize();
    console.log("🔐 Login page initialized");
    document.querySelector("#login-form")?.addEventListener("submit", handleFormSubmit);
    checkAuthStatus();
  } catch (err) {
    console.error("❌ Login init error:", err);
  }
});

// ===== AUTH CHECK =====
async function checkAuthStatus() {
  const session = await getCurrentSession();
  if (session?.user) {
    loginState.setState({ isAuthenticated: true, user: session.user });
    showSuccess("Sessão ativa detectada. Redirecionando...");
    await createAuditLog("LOGIN_SESSION_ACTIVE", { user_id: session.user.id });
    setTimeout(() => (window.location.href = "/dashboard.html"), 1000);
  }
}

// ===== FORM HANDLING =====
async function handleFormSubmit(e) {
  e.preventDefault();
  if (loginState.state.isLocked) return showError("Conta bloqueada, tente mais tarde.");

  showLoading(true, "Entrando...");
  try {
    const email = domElements.get("email")?.value.trim();
    const password = domElements.get("password")?.value;
    if (!LOGIN_CONFIG.VALIDATION.EMAIL_REGEX.test(email)) throw new Error("E-mail inválido");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    loginState.setState({ isAuthenticated: true, user: data.user, attemptCount: 0 });
    await createAuditLog("LOGIN_SUCCESS", { user_id: data.user.id, email });
    showSuccess("Login realizado com sucesso!");
    setTimeout(() => (window.location.href = "/dashboard.html"), 1000);
  } catch (err) {
    showError("Erro no login: " + err.message);
    loginState.state.attemptCount++;
    await createAuditLog("LOGIN_FAILURE", { email, reason: err.message });
  } finally {
    showLoading(false);
  }
}

// ===== OAUTH =====
async function handleOAuthLogin(providerId) {
  try {
    const { error } = await supabase.auth.signInWithOAuth({ provider: providerId });
    if (error) throw error;
    await createAuditLog("OAUTH_LOGIN", { provider: providerId });
    showSuccess("Login OAuth realizado!");
    setTimeout(() => (window.location.href = "/dashboard.html"), 1000);
  } catch (err) {
    showError("Erro OAuth: " + err.message);
    await createAuditLog("OAUTH_FAILURE", { provider: providerId, reason: err.message });
  }
}

// ===== PUBLIC API =====
window.LoginSystem = {
  login: handleFormSubmit,
  oauthLogin: handleOAuthLogin,
  version: "5.3"
};
export default window.LoginSystem;

console.log("✅ Enterprise Login v5.3 - ALSHAM 360° PRIMA READY");
