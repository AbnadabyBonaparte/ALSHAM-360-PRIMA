// public/js/login.js
/**
 * ALSHAM 360° PRIMA - Enterprise Login v5.3.0
 * Login robusto com Supabase + tratativas de erro alinhadas ao supabase.js
 */

const { genericSignIn, resetPassword, showNotification, createAuditLog } =
  window.AlshamSupabase || {};

const LoginSystem = {
  async login(event) {
    event.preventDefault();
    console.log("🚀 Tentando login...");

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const btn = document.getElementById("login-btn");
    const btnText = document.getElementById("login-btn-text");
    const spinner = document.getElementById("login-spinner");
    const errorBox = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");
    const successBox = document.getElementById("success-message");
    const successText = document.getElementById("success-text");

    errorBox.classList.add("hidden");
    successBox.classList.add("hidden");

    if (!email || !password) {
      errorText.textContent = "Preencha todos os campos.";
      errorBox.classList.remove("hidden");
      return;
    }

    // Loading state
    btn.disabled = true;
    btnText.textContent = "Entrando...";
    spinner.classList.remove("hidden");

    try {
      const result = await genericSignIn(email, password);

      if (!result.success) {
        console.warn("⚠️ Falha no login:", result.error);
        errorText.textContent =
          result.error?.message || "Credenciais inválidas ou erro inesperado.";
        errorBox.classList.remove("hidden");

        await createAuditLog?.("LOGIN_FAILURE", {
          email,
          reason: result.error?.message || "unknown"
        });

        return;
      }

      // Sucesso no login
      console.log("✅ Login bem-sucedido:", result.data);
      successText.textContent = "Login realizado com sucesso!";
      successBox.classList.remove("hidden");

      await createAuditLog?.("LOGIN_SUCCESS", {
        email,
        user_id: result.data.user?.id || null
      });

      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1200);
    } catch (err) {
      console.error("❌ Erro inesperado no login:", err);
      errorText.textContent = err.message || "Erro inesperado no login.";
      errorBox.classList.remove("hidden");

      await createAuditLog?.("LOGIN_JS_ERROR", {
        email,
        reason: err.message || "unknown"
      });
    } finally {
      // Reset botão
      btn.disabled = false;
      btnText.textContent = "Entrar";
      spinner.classList.add("hidden");
    }
  },

  async forgotPassword(email) {
    if (!email) {
      showNotification?.("Digite seu e-mail para redefinir a senha.", "warning");
      return;
    }
    const res = await resetPassword?.(email);
    if (res?.success) {
      showNotification?.("E-mail de redefinição enviado.", "success");
    } else {
      showNotification?.("Erro ao enviar redefinição de senha.", "error");
    }
  },

  oauthLogin(provider) {
    showNotification?.(`Login OAuth com ${provider} ainda não implementado.`, "info");
  },

  biometricLogin() {
    showNotification?.("Login biométrico em desenvolvimento.", "info");
  }
};

// Expor global
window.LoginSystem = LoginSystem;
console.log("✅ Enterprise Login v5.3.0 - ALSHAM 360° PRIMA READY");
