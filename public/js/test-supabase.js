/**
 * ALSHAM 360° PRIMA - Supabase Test Panel v1.3
 * Diagnóstico completo de sessão, usuário, registro, reset, email e perfil.
 *
 * @version 1.3.0 - NASA 10/10 FINAL BUILD
 */

import {
  getCurrentSession,
  getCurrentUser,
  signUpWithEmail,
  resetPassword,
  checkEmailExists,
  createUserProfile
} from "/src/lib/supabase.js";

// ===== Helpers =====
function showResult(id, data) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = JSON.stringify(data, null, 2);
}

// ===== Sessão =====
document.getElementById("check-session")?.addEventListener("click", async () => {
  try {
    const session = await getCurrentSession();
    const user = await getCurrentUser();
    showResult("session-result", { session, user });
  } catch (err) {
    showResult("session-result", { error: err.message });
  }
});

// ===== Email / Registro =====
document.getElementById("check-email")?.addEventListener("click", async () => {
  const email = document.getElementById("test-email").value.trim();
  if (!email) return showResult("register-result", { error: "Digite um e-mail válido" });
  try {
    const exists = await checkEmailExists(email);
    showResult("register-result", { exists });
  } catch (err) {
    showResult("register-result", { error: err.message });
  }
});

document.getElementById("sign-up")?.addEventListener("click", async () => {
  const email = document.getElementById("test-email").value.trim();
  const pass = document.getElementById("test-password").value.trim();
  if (!email || !pass) return showResult("register-result", { error: "Informe e-mail e senha" });

  try {
    const result = await signUpWithEmail(email, pass);
    showResult("register-result", result);
  } catch (err) {
    showResult("register-result", { error: err.message });
  }
});

document.getElementById("reset-password")?.addEventListener("click", async () => {
  const email = document.getElementById("test-email").value.trim();
  if (!email) return showResult("register-result", { error: "Informe o e-mail" });

  try {
    const result = await resetPassword(email);
    showResult("register-result", result);
  } catch (err) {
    showResult("register-result", { error: err.message });
  }
});

// ===== Perfil =====
document.getElementById("create-profile")?.addEventListener("click", async () => {
  try {
    const demoProfile = {
      user_id: "demo-user-id",
      first_name: "Teste",
      last_name: "Demo",
      email: "demo@alsham.com"
    };
    const result = await createUserProfile(demoProfile);
    showResult("profile-result", result);
  } catch (err) {
    showResult("profile-result", { error: err.message });
  }
});

console.log("🧪 Test-Supabase.js v1.3 carregado - ALSHAM 360° PRIMA");
