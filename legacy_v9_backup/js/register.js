/**
 * ALSHAM 360° PRIMA - Enterprise Registration System v5.2.3
 * 🔧 Corrigido e Unificado com Sistema Login/Index
 * - CSP compatível com Supabase + Google OAuth
 * - Adicionado controle visual e UX refinado
 * - Adicionado tratamento de erros granulado e logging estruturado
 */

// Aguarda Supabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.signUpWithEmail) {
    console.log("✅ Supabase carregado para Registro após", attempt, "tentativas");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou após 10 segundos");
    showNotification("Erro ao carregar sistema. Recarregue a página.", "error");
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

// ======= UI Helpers =======
function showNotification(message, type = "info") {
  console.log(`[${type.toUpperCase()}] ${message}`);
  const div = document.createElement("div");
  div.className = `fixed top-4 right-4 p-3 rounded-lg shadow-lg text-white z-50 
    transition-opacity duration-300 opacity-0
    ${
      type === "error" ? "bg-red-600" :
      type === "success" ? "bg-green-600" :
      type === "warning" ? "bg-yellow-500" : "bg-blue-600"
    }`;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => (div.style.opacity = "1"), 50);
  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 300);
  }, 4000);
}

const showError = (m) => showNotification(m, "error");
const showSuccess = (m) => showNotification(m, "success");
const showWarning = (m) => showNotification(m, "warning");

// ======= Execução Principal =======
waitForSupabase(() => {
  const {
    signUpWithEmail,
    createUserProfile,
    checkEmailExists,
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
      Notification: requireLib("Notification API", window.Notification),
      fetch: requireLib("Fetch API", window.fetch)
    };
  }

  // ===== CONFIG =====
  const REGISTRATION_CONFIG = Object.freeze({
    SECURITY: {
      PASSWORD_MIN_LENGTH: 8,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SYMBOLS: true,
      EMAIL_VERIFICATION_REQUIRED: true,
      AUDIT_ENABLED: true
    },
    VALIDATION: {
      EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      NAME_REGEX: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
      PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
    },
    STEPS: [
      { id: "personal", required: ["firstName", "lastName", "email"] },
      { id: "security", required: ["password", "confirmPassword"] },
      { id: "organization", required: [] },
      { id: "verification", required: ["verificationCode"] }
    ]
  });

  // ===== STATE =====
  class RegistrationState {
    constructor() {
      this.state = {
        currentStep: 0,
        totalSteps: REGISTRATION_CONFIG.STEPS.length,
        formData: {},
        errors: []
      };
    }
    setState(upd) { Object.assign(this.state, upd); }
    getState(key) { return key ? this.state[key] : this.state; }
  }
  const registrationState = new RegistrationState();

  // ===== DOM MANAGER =====
  class DOMManager {
    constructor() { this.elements = {}; }
    initialize() {
      const selectors = {
        form: "#registration-form",
        email: "#email",
        password: "#password",
        confirmPassword: "#confirm-password",
        firstName: "#first-name",
        lastName: "#last-name",
        verificationCode: "#verification-code",
        submitButton: "#submit-button"
      };
      Object.entries(selectors).forEach(([k, s]) => {
        this.elements[k] = document.querySelector(s);
      });
    }
    get(key) { return this.elements[key]; }
  }
  const dom = new DOMManager();

  // ===== UI =====
  function showLoading(show, msg = "Carregando...") {
    const btn = dom.get("submitButton");
    if (!btn) return;
    btn.disabled = show;
    btn.innerHTML = show
      ? `<span class="animate-pulse">${msg}</span>`
      : "Criar conta";
  }

  function announceToScreenReader(msg) {
    let el = document.getElementById("sr-announcer");
    if (!el) {
      el = document.createElement("div");
      el.id = "sr-announcer";
      el.className = "sr-only";
      document.body.appendChild(el);
    }
    el.textContent = msg;
  }

  // ===== VALIDATION =====
  function validateField(name) {
    const val = dom.get(name)?.value?.trim() || "";
    const v = REGISTRATION_CONFIG.VALIDATION;
    if (["firstName", "lastName"].includes(name)) return v.NAME_REGEX.test(val);
    if (name === "email") return v.EMAIL_REGEX.test(val);
    if (name === "password") return v.PASSWORD_REGEX.test(val);
    if (name === "confirmPassword") return val === dom.get("password")?.value;
    if (name === "verificationCode") return /^\d{6}$/.test(val);
    return true;
  }

  async function validateStep(stepIndex) {
    const step = REGISTRATION_CONFIG.STEPS[stepIndex];
    return step.required.every((f) => validateField(f));
  }

  // ===== CORE FLOW =====
  document.addEventListener("DOMContentLoaded", initializeRegistration);

  async function initializeRegistration() {
    try {
      validateDependencies();
      dom.initialize();

      const form = dom.get("form");
      if (form) form.addEventListener("submit", handleFormSubmit);

      console.log("📝 Registration System READY v5.2.3");
    } catch (e) {
      showError("Erro ao inicializar registro");
      console.error("Init error:", e);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const stepIndex = registrationState.getState("currentStep");
    const valid = await validateStep(stepIndex);

    if (!valid) return showError("Por favor, corrija os campos obrigatórios.");

    if (stepIndex < REGISTRATION_CONFIG.STEPS.length - 1) {
      registrationState.setState({ currentStep: stepIndex + 1 });
      announceToScreenReader(`Avançou para etapa ${stepIndex + 2}`);
      document.querySelectorAll(".step").forEach((el, i) => {
        el.classList.toggle("hidden", i !== stepIndex + 1);
      });
    } else {
      await submitRegistration();
    }
  }

  async function submitRegistration() {
    try {
      showLoading(true, "Criando conta...");

      const formData = {
        email: dom.get("email")?.value,
        password: dom.get("password")?.value,
        firstName: dom.get("firstName")?.value,
        lastName: dom.get("lastName")?.value
      };

      if (await checkEmailExists(formData.email)) {
        showWarning("E-mail já cadastrado");
        showLoading(false);
        return;
      }

      const { data, error } = await signUpWithEmail(formData.email, formData.password);
      if (error) throw error;

      await createUserProfile({
        user_id: data.user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email
      });

      if (REGISTRATION_CONFIG.SECURITY.AUDIT_ENABLED) {
        await createAuditLog("USER_REGISTERED", {
          user_id: data.user.id,
          email: formData.email,
          timestamp: new Date().toISOString()
        });
      }

      showSuccess("Conta criada com sucesso! Verifique seu e-mail.");
      setTimeout(() => (window.location.href = "/login.html"), 2000);
    } catch (err) {
      console.error("Erro no registro:", err);
      showError("Erro ao registrar: " + (err.message || "Erro desconhecido"));
    } finally {
      showLoading(false);
    }
  }

  // ===== PUBLIC API =====
  window.RegistrationSystem = {
    nextStep: () => registrationState.setState({
      currentStep: registrationState.getState("currentStep") + 1
    }),
    prevStep: () => registrationState.setState({
      currentStep: Math.max(0, registrationState.getState("currentStep") - 1)
    }),
    submit: submitRegistration,
    validateField,
    version: "5.2.3"
  };

  console.log("✅ Registration System V5.2.3 pronto");
});
