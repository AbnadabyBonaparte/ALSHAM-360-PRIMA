import { robustAuthGuard } from '../lib/auth-guard.js';
import { ensureSupabaseGlobal } from '../lib/attach-supabase.js';

ensureSupabaseGlobal();

// 🔧 FIX: Flag para prevenir múltiplas validações simultâneas
let validationInProgress = false;
let validationAttempts = 0;
const MAX_VALIDATION_ATTEMPTS = 3;

async function validateSession() {
  console.log('🔐 [DASHBOARD] Iniciando validação de sessão...');
  console.log('🔍 [DASHBOARD] Tentativa:', validationAttempts + 1);
  
  // 🔧 FIX: Prevenir validações simultâneas
  if (validationInProgress) {
    console.warn('⚠️ [DASHBOARD] Validação já em progresso, aguardando...');
    return true;
  }
  
  // 🔧 FIX: Limitar tentativas de validação
  if (validationAttempts >= MAX_VALIDATION_ATTEMPTS) {
    console.error('❌ [DASHBOARD] Máximo de tentativas de validação atingido');
    console.log('🔄 [DASHBOARD] Redirecionando para login...');
    
    validationAttempts = 0;
    window.location.href = '/login.html';
    return false;
  }
  
  validationInProgress = true;
  validationAttempts++;
  
  try {
    console.log('🔍 [DASHBOARD] Chamando robustAuthGuard...');
    
    const result = await robustAuthGuard({
      redirectOnFail: '/login.html',
      maxRetries: 2,
      retryDelay: 500,
      timeout: 8000,
      skipRedirect: true // 🔧 FIX: Não redirecionar automaticamente
    });

    console.log('📦 [DASHBOARD] Resultado do guard:', result);

    if (!result.success) {
      console.warn('⚠️ [DASHBOARD] Sessão inválida detectada');
      
      // 🔧 FIX: Tentar novamente com delay antes de redirecionar
      if (validationAttempts < MAX_VALIDATION_ATTEMPTS) {
        console.log(`⏳ [DASHBOARD] Aguardando 2s antes de tentar novamente...`);
        
        validationInProgress = false;
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔄 [DASHBOARD] Tentando validar novamente...');
        return validateSession();
      }
      
      console.log('🔄 [DASHBOARD] Redirecionando para login...');
      validationAttempts = 0;
      window.location.href = '/login.html';
      return false;
    }

    console.log('✅ [DASHBOARD] Sessão válida confirmada');
    console.log('👤 [DASHBOARD] Usuário:', result.user?.email || result.user?.id);
    
    // 🔧 FIX: Resetar contadores em caso de sucesso
    validationAttempts = 0;
    validationInProgress = false;
    
    return true;
  } catch (error) {
    console.error('❌ [DASHBOARD] Erro ao validar sessão:', error);
    
    // 🔧 FIX: Tentar novamente em caso de erro
    if (validationAttempts < MAX_VALIDATION_ATTEMPTS) {
      console.log(`⏳ [DASHBOARD] Aguardando 2s antes de tentar novamente...`);
      
      validationInProgress = false;
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🔄 [DASHBOARD] Tentando validar novamente após erro...');
      return validateSession();
    }
    
    console.log('🔄 [DASHBOARD] Redirecionando para login após erro...');
    validationAttempts = 0;
    window.location.href = '/login.html';
    return false;
  } finally {
    validationInProgress = false;
  }
}

async function loadDashboard() {
  console.log('🚀 [DASHBOARD] Iniciando carregamento do dashboard...');
  console.log('🌐 [DASHBOARD] URL:', window.location.href);
  console.log('📍 [DASHBOARD] Pathname:', window.location.pathname);
  
  const isValid = await validateSession();

  if (!isValid) {
    console.warn('⚠️ [DASHBOARD] Dashboard bloqueado: sessão inválida');
    return;
  }

  console.log('✅ [DASHBOARD] Sessão validada com sucesso');
  console.log('📊 [DASHBOARD] Carregando dados do dashboard...');

  const contentElement = document.getElementById('dashboard-content');
  if (contentElement) {
    contentElement.style.display = 'block';
    console.log('✅ [DASHBOARD] Conteúdo do dashboard exibido');
  }

  console.log('🎉 [DASHBOARD] Dashboard carregado com sucesso!');
}

// 🔧 FIX: Aguardar DOM carregar antes de validar sessão
if (document.readyState === 'loading') {
  console.log('⏳ [DASHBOARD] Aguardando DOM carregar...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ [DASHBOARD] DOM carregado');
    loadDashboard();
  }, { once: true });
} else {
  console.log('✅ [DASHBOARD] DOM já carregado');
  loadDashboard();
}

// 🔧 FIX: Resetar tentativas quando página fica visível
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('👁️ [DASHBOARD] Página ficou visível, resetando tentativas');
      validationAttempts = 0;
      validationInProgress = false;
    }
  });
}

// 🔧 FIX: Expor função de validação para debug
if (typeof window !== 'undefined') {
  window.DashboardDebug = {
    validateSession,
    resetValidation: () => {
      validationAttempts = 0;
      validationInProgress = false;
      console.log('🔄 [DASHBOARD] Validação resetada manualmente');
    },
    getStatus: () => ({
      validationInProgress,
      validationAttempts,
      maxAttempts: MAX_VALIDATION_ATTEMPTS
    })
  };
}

console.log('📦 [DASHBOARD] Módulo dashboard.js carregado');
