/**
 * ALSHAM 360° PRIMA - Enterprise Registration System V5.2 NASA 10/10
 * Corrigido para compatibilidade com Supabase v2 + Cypress
 */

const {
  supabase,
  createUserProfile,
  createAuditLog
} = window.AlshamSupabase || {};

// ===== CONFIG =====
const REGISTRATION_CONFIG = Object.freeze({
  SECURITY: {
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_VERIFICATION_REQUIRED: true,
    AUDIT_ENABLED: true
  },
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    NAME_REGEX: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
    PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
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
    this.state = { currentStep: 0, totalSteps: REGISTRATION_CONFIG.STEPS.length };
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
      submitButton: "#submit-button",
      errorBox: "#error-message",
      errorText: "#error-text",
      successBox: "#success-message",
      successText: "#success-text"
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
function showError(msg) {
  const box = dom.get("errorBox");
  const text = dom.get("errorText");
  if (box && text) {
    text.textContent = msg;
    box.classList.remove("hidden");
  }
}
function showSuccess(msg) {
  const box = dom.get("successBox");
  const text = dom.get("successText");
  if (box && text) {
    text.textContent = msg;
    box.classList.remove("hidden");
  }
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
document.addEventListener("DOMContentLoaded", () => {
  dom.initialize();
  console.log("📝 Registration ready v5.2");
  document.querySelector("#registration-form")?.addEventListener("submit", handleFormSubmit);
});

async function handleFormSubmit(e) {
  e.preventDefault();
  const stepIndex = registrationState.getState("currentStep");
  const valid = await validateStep(stepIndex);
  if (!valid) return showError("Por favor, corrija os campos obrigatórios.");
  if (stepIndex < REGISTRATION_CONFIG.STEPS.length - 1) {
    registrationState.setState({ currentStep: stepIndex + 1 });
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

    // Checa duplicidade (fallback user_profiles)
    let emailExists = false;
    try {
      const { data } = await supabase.from("user_profiles").select("id").eq("email", formData.email).maybeSingle();
      emailExists = !!data;
    } catch { /* ignore */ }

    if (emailExists) {
      showError("E-mail já cadastrado");
      showLoading(false);
      return;
    }

    // Registro no Supabase
    const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
    if (error) throw error;

    // Cria perfil
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

    showSuccess("Conta criada! Verifique seu email.");
    setTimeout(() => (window.location.href = "/login.html"), 2000);
  } catch (err) {
    showError("Erro ao registrar: " + err.message);
  } finally {
    showLoading(false);
  }
}

// ===== PUBLIC API =====
window.RegistrationSystem = {
  nextStep: () => registrationState.setState({ currentStep: registrationState.getState("currentStep") + 1 }),
  prevStep: () => registrationState.setState({ currentStep: Math.max(0, registrationState.getState("currentStep") - 1) }),
  submit: submitRegistration,
  validateField,
  version: "5.2"
};
export default window.RegistrationSystem;

console.log("✅ Registration System V5.2 - ALSHAM 360° PRIMA READY");
