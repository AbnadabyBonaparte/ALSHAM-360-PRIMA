/**
 * ALSHAM 360° PRIMA - Enterprise Login v5.5.0
 * ✅ CORRIGIDO: Verifica sessão antes de mostrar login
 */

// Aguarda window.AlshamSupabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.genericSignIn) {
    console.log("✅ Supabase carregado após", attempt, "tentativas");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou após 10 segundos");
    document.getElementById("error-message")?.classList.remove("hidden");
    document.getElementById("error-text").textContent = 
      "Erro ao carregar sistema. Recarregue a página.";
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

// ✅ VERIFICA SE JÁ ESTÁ LOGADO
async function checkExistingSession() {
  try {
    const { getCurrentSession } = window.AlshamSupabase || {};
    if (!getCurrentSession) return false;

    const session = await getCurrentSession();
    
    if (session?.user) {
      console.log("✅ Sessão ativa detectada, redirecionando...");
      window.location.href = "/dashboard.html";
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("❌ Erro ao verificar sessão:", error);
    return false;
  }
}

const LoginSystem = {
  async login(event) {
    event.preventDefault();
    console.log("🚀 Tentando login...");
    
    const { genericSignIn, createAuditLog } = window.AlshamSupabase || {};

    if (!genericSignIn) {
      console.error("❌ genericSignIn não disponível");
      document.getElementById("error-text").textContent = 
        "Sistema ainda carregando. Aguarde...";
      document.getElementById("error-message").classList.remove("hidden");
      return;
    }

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

    btn.disabled = true;
    btnText.textContent = "Entrando...";
    spinner.classList.remove("hidden");

    try {
      const result = await genericSignIn(email, password);
      
      if (!result.success) {
        console.warn("⚠️ Falha no login:", result.error);
        errorText.textContent =
          result.error?.message || "Credenciais inválidas.";
        errorBox.classList.remove("hidden");
        await createAuditLog?.("LOGIN_FAILURE", { email, reason: result.error?.message });
        return;
      }

      console.log("✅ Login bem-sucedido");
      successText.textContent = "Login realizado com sucesso!";
      successBox.classList.remove("hidden");
      
      await createAuditLog?.("LOGIN_SUCCESS", { email, user_id: result.data.user?.id });

      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1200);
    } catch (err) {
      console.error("❌ Erro no login:", err);
      errorText.textContent = err.message || "Erro inesperado.";
      errorBox.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btnText.textContent = "Entrar";
      spinner.classList.add("hidden");
    }
  },

  async forgotPassword(email) {
    const { resetPassword, showNotification } = window.AlshamSupabase || {};
    if (!email) {
      alert("Digite seu e-mail.");
      return;
    }
    const res = await resetPassword?.(email);
    if (res?.success) {
      alert("E-mail de redefinição enviado.");
    } else {
      alert("Erro ao enviar.");
    }
  },

  oauthLogin(provider) {
    alert(`Login com ${provider} em desenvolvimento.`);
  },

  biometricLogin() {
    alert("Login biométrico em desenvolvimento.");
  }
};

if (typeof window !== "undefined") {
  window.LoginSystem = LoginSystem;
}

const loginForm = document.getElementById("login-form");
if (loginForm && !loginForm.dataset.listenerAttached) {
  loginForm.addEventListener("submit", event => LoginSystem.login(event));
  loginForm.dataset.listenerAttached = "true";
}

// Aguarda Supabase e verifica sessão existente
waitForSupabase(async () => {
  console.log("✅ LoginSystem READY v5.5.0");

  // ✅ VERIFICA SE JÁ ESTÁ LOGADO
  await checkExistingSession();
});
