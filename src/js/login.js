import { robustAuthGuard } from '../lib/auth-guard.js';
import { ensureSupabaseGlobal } from '../lib/attach-supabase.js';

const WAIT_INTERVAL = 120;
const MAX_ATTEMPTS = 80;

function getAuthServices() {
  if (typeof window === 'undefined') return {};
  ensureSupabaseGlobal();
  return window.AlshamSupabase || {};
}

function resolveSupabaseAuth(services) {
  if (!services) return null;
  if (services.supabase?.auth) return services.supabase.auth;
  if (services.auth?.signInWithPassword) return services.auth;
  if (typeof services.signInWithPassword === 'function') {
    return {
      signInWithPassword: services.signInWithPassword,
      getSession: services.getSession || services.getCurrentSession,
      signOut: services.signOut
    };
  }
  return null;
}

async function waitForAuthServices(attempt = 0) {
  const services = getAuthServices();
  const supabaseAuth = resolveSupabaseAuth(services);

  if (supabaseAuth?.signInWithPassword) {
    return { supabaseAuth, createAuditLog: services.createAuditLog };
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

// 🔧 FIX: Remover verificação duplicada de sessão
// Comentado para evitar loop de redirecionamento
/*
async function checkExistingSession() {
  try {
    const services = getAuthServices();
    const supabaseAuth = resolveSupabaseAuth(services);
    const sessionFetcher =
      supabaseAuth?.getSession || services.getSession || services.getCurrentSession;

    if (typeof sessionFetcher !== 'function') {
      return false;
    }

    const result = await sessionFetcher();
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
*/

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
    const { supabaseAuth, createAuditLog } = await waitForAuthServices();
    
    console.log('🔐 Tentando login com:', email);
    
    const { data, error } = await supabaseAuth.signInWithPassword({ email, password });

    const authError = error || null;
    const user = data?.user || null;

    if (authError || !user) {
      const reason = authError?.message || 'Credenciais inválidas';
      console.error('❌ Erro de autenticação:', reason);
      setMessage(errorMessage, `Erro no login: ${reason}`);
      await createAuditLog?.('LOGIN_FAILURE', { email, reason });
      return;
    }

    console.log('✅ Login bem-sucedido:', user.email);
    setMessage(successMessage, 'Login realizado com sucesso! Redirecionando...');
    await createAuditLog?.('LOGIN_SUCCESS', { email, user_id: user.id });

    // 🔧 FIX: Aumentar tempo de espera para garantir que a sessão foi salva
    setTimeout(() => {
      console.log('🔄 Redirecionando para dashboard...');
      window.location.href = '/dashboard.html';
    }, 1500);
  } catch (error) {
    console.error('❌ Erro ao realizar login:', error);
    setMessage(errorMessage, `Erro no login: ${error.message || 'Erro inesperado'}`);
  }
}

// 🔧 FIX: Remover auto-submit automático
// O auto-submit pode causar problemas de sincronização
function autoSubmitIfRequested(form) {
  // Desabilitado para evitar problemas de loop
  return;
  
  /*
  if (!form || form.dataset.autoSubmit !== 'true') {
    return;
  }

  requestAnimationFrame(() => {
    form.requestSubmit();
  });
  */
}

async function bootstrapLogin() {
  console.log('🚀 Iniciando sistema de login...');
  
  const form = document.getElementById('login-form');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  hideMessages(successMessage, errorMessage);

  if (!form) {
    console.error('❌ Formulário de login não encontrado!');
    return;
  }

  form.addEventListener('submit', handleLoginSubmit, { once: false });

  // 🔧 FIX: Simplificar verificação de sessão
  // Apenas uma verificação, sem redirecionamento automático
  try {
    console.log('🔍 Verificando sessão existente...');
    const services = getAuthServices();
    const supabaseAuth = resolveSupabaseAuth(services);
    
    if (supabaseAuth?.getSession) {
      const { data } = await supabaseAuth.getSession();
      
      if (data?.session?.user) {
        console.log('✅ Sessão ativa encontrada:', data.session.user.email);
        setMessage(successMessage, 'Sessão ativa detectada. Redirecionando...');
        
        setTimeout(() => {
          console.log('🔄 Redirecionando para dashboard...');
          window.location.href = '/dashboard.html';
        }, 1000);
        return;
      }
    }
    
    console.log('ℹ️ Nenhuma sessão ativa encontrada');
  } catch (error) {
    console.warn('⚠️ Erro ao verificar sessão:', error);
  }

  // 🔧 FIX: Desabilitar auto-submit
  // autoSubmitIfRequested(form);
  
  console.log('✅ Sistema de login pronto');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapLogin, { once: true });
} else {
  bootstrapLogin();
}

window.LoginSystem = {
  login: (email, password) =>
    waitForAuthServices().then(({ supabaseAuth }) =>
      supabaseAuth.signInWithPassword({ email, password })
    ),
  guard: robustAuthGuard
};
