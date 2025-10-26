import { robustAuthGuard } from '../lib/auth-guard.js';
import { ensureSupabaseGlobal } from '../lib/attach-supabase.js';

const WAIT_INTERVAL = 120;
const MAX_ATTEMPTS = 80;

function getAuthServices() {
  if (typeof window === 'undefined') return {};
  ensureSupabaseGlobal();
  return window.AlshamSupabase || {};
}

async function waitForAuthServices(attempt = 0) {
  const services = getAuthServices();
  if (services.genericSignIn && services.createAuditLog) {
    return services;
  }

  if (attempt >= MAX_ATTEMPTS) {
    throw new Error('Serviços de autenticação indisponíveis');
  }

  await new Promise((resolve) => setTimeout(resolve, WAIT_INTERVAL));
  return waitForAuthServices(attempt + 1);
}

function setMessage(element, message) {
  if (!element) return;
  element.textContent = message;
  element.classList.add('visible');
}

function hideMessages(...elements) {
  elements.forEach((element) => {
    if (element) {
      element.classList.remove('visible');
      if (element.id === 'error-message') {
        element.textContent = '';
      }
    }
  });
}

async function checkExistingSession() {
  try {
    const services = getAuthServices();
    if (typeof services.getCurrentSession !== 'function') {
      return false;
    }

    const result = await services.getCurrentSession();
    const session = result?.session || result?.data?.session || null;

    if (session?.user) {
      window.location.href = '/dashboard.html';
      return true;
    }
  } catch (error) {
    console.warn('⚠️ Não foi possível validar sessão existente:', error);
  }

  return false;
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const emailInput = form.querySelector('#email');
  const passwordInput = form.querySelector('#password');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  hideMessages(successMessage, errorMessage);

  const email = emailInput?.value?.trim();
  const password = passwordInput?.value ?? '';

  if (!email || !password) {
    setMessage(errorMessage, 'Erro no login: informe e-mail e senha.');
    return;
  }

  try {
    const { genericSignIn, createAuditLog } = await waitForAuthServices();
    const response = await genericSignIn(email, password);

    const authError = response?.error || (response?.success === false ? new Error('Falha no login') : null);
    const user = response?.data?.user || response?.user || null;

    if (authError || !user) {
      const reason = authError?.message || 'Credenciais inválidas';
      setMessage(errorMessage, `Erro no login: ${reason}`);
      await createAuditLog?.('LOGIN_FAILURE', { email, reason });
      return;
    }

    setMessage(successMessage, 'Login realizado com sucesso');
    await createAuditLog?.('LOGIN_SUCCESS', { email, user_id: user.id });

    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1000);
  } catch (error) {
    console.error('❌ Erro ao realizar login:', error);
    setMessage(errorMessage, `Erro no login: ${error.message || 'Erro inesperado'}`);
  }
}

function autoSubmitIfRequested(form) {
  if (!form || form.dataset.autoSubmit !== 'true') {
    return;
  }

  requestAnimationFrame(() => {
    form.requestSubmit();
  });
}

async function bootstrapLogin() {
  const form = document.getElementById('login-form');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  hideMessages(successMessage, errorMessage);

  if (!form) {
    return;
  }

  form.addEventListener('submit', handleLoginSubmit, { once: false });

  try {
    const guardResult = await robustAuthGuard({ skipRedirect: true, maxRetries: 1, retryDelay: 300, timeout: 5000 });
    if (guardResult?.user) {
      setMessage(successMessage, 'Sessão ativa detectada. Redirecionando...');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1200);
      return;
    }
  } catch (error) {
    console.warn('⚠️ Guard não pôde validar sessão antes do login:', error);
  }

  await checkExistingSession();
  autoSubmitIfRequested(form);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapLogin, { once: true });
} else {
  bootstrapLogin();
}

window.LoginSystem = {
  login: (email, password) => waitForAuthServices().then(({ genericSignIn }) => genericSignIn(email, password)),
  guard: robustAuthGuard
};
