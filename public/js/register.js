/**
 * ALSHAM 360° PRIMA - Enterprise Registration System V5.0
 * Advanced user registration with enterprise security + UX premium
 *
 * @version 5.0.1 - NASA 10/10 FINAL BUILD
 * @author ALSHAM
 */

// ===== SUPABASE GLOBAL IMPORT =====
const {
  signUpWithEmail,
  createUserProfile,
  checkEmailExists
} = window.AlshamSupabase || {};

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
    Notification: requireLib("Notification API", window.Notification),
    navigator: requireLib("Navigator API", window.navigator),
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
    EMAIL_VERIFICATION_REQUIRED: true
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

// ===== DOM =====
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

// ===== UI HELPERS =====
function showLoading(show, msg = "Carregando...") {
  const btn = dom.get("submitButton");
  if (!btn) return;
  btn.disabled = show;
  btn.textContent = show ? msg : "Criar conta";
}
function showNotification(message, type = "info") {
  console.log(`[${type}] ${message}`);
  const div = document.createElement("div");
  div.className = `fixed top-4 right-4 p-3 rounded shadow-lg text-white z-50 ${
    type === "error" ? "bg-red-600" :
    type === "success" ? "bg-green-600" :
    type === "warning" ? "bg-yellow-500" : "bg-blue-600"
  }`;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}
const showError   = (m) => showNotification(m, "error");
const showSuccess = (m) => showNotification(m, "success");
const showWarning = (m) => showNotification(m, "warning");

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
  if (["firstName", "lastName"].includes(name))
    return REGISTRATION_CONFIG.VALIDATION.NAME_REGEX.test(val);
  if (name === "email")
    return REGISTRATION_CONFIG.VALIDATION.EMAIL_REGEX.test(val);
  if (name === "password")
    return REGISTRATION_CONFIG.VALIDATION.PASSWORD_REGEX.test(val);
  if (name === "confirmPassword")
    return val === dom.get("password")?.value;
  if (name === "verificationCode")
    return /^\d{6}$/.test(val);
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
    console.log("📝 Registration ready");
  } catch (e) {
    showError("Erro ao inicializar registro");
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

    // Checa se email já existe
    if (await checkEmailExists?.(formData.email)) {
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

    showSuccess("Conta criada! Verifique seu email.");
    setTimeout(() => (window.location.href = "/login.html"), 2000);
  } catch (err) {
    showError("Erro ao registrar: " + err.message);
  } finally {
    showLoading(false);
  }
}

// ===== PUBLIC API =====
const RegistrationSystem = {
  nextStep: () =>
    registrationState.setState({ currentStep: registrationState.getState("currentStep") + 1 }),
  prevStep: () =>
    registrationState.setState({ currentStep: Math.max(0, registrationState.getState("currentStep") - 1) }),
  submit: submitRegistration,
  validateField,
  version: "5.0.1"
};
window.RegistrationSystem = RegistrationSystem;
export default RegistrationSystem;

console.log("✅ Registration System V5.0.1 pronto - ALSHAM 360° PRIMA");
