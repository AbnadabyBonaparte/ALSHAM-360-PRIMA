/**
 * AUTH GUARD ROBUSTO — PREVINE LOOP DE REDIRECIONAMENTO
 * Retry, timeout, backup, logs detalhados
 * 
 * 🔧 CORREÇÕES APLICADAS:
 * - Prevenir múltiplos redirecionamentos
 * - Adicionar flag de redirecionamento em progresso
 * - Melhorar logs de debug
 * - Evitar loop infinito
 */

// 🔧 FIX: Flag global para prevenir múltiplos redirecionamentos
let redirectInProgress = false;

function resolveSessionFetcher() {
  const runtime = typeof window !== 'undefined' ? window : {};
  const alsham = runtime.AlshamSupabase || {};

  console.log('🔍 [AUTH-GUARD] Resolvendo session fetcher...');
  console.log('📦 [AUTH-GUARD] AlshamSupabase disponível:', !!alsham);
  console.log('📦 [AUTH-GUARD] getCurrentSession disponível:', typeof alsham.getCurrentSession);

  if (typeof alsham.getCurrentSession === 'function') {
    console.log('✅ [AUTH-GUARD] Usando getCurrentSession');
    return async () => {
      const sessionResult = await alsham.getCurrentSession();

      if (!sessionResult) {
        console.log('ℹ️ [AUTH-GUARD] getCurrentSession retornou null');
        return { session: null };
      }

      if ('data' in sessionResult && sessionResult.data?.session) {
        console.log('✅ [AUTH-GUARD] Sessão encontrada em data.session');
        return { session: sessionResult.data.session };
      }

      if ('session' in sessionResult) {
        console.log('✅ [AUTH-GUARD] Sessão encontrada em session');
        return { session: sessionResult.session };
      }

      if ('user' in sessionResult) {
        console.log('✅ [AUTH-GUARD] Sessão encontrada em user');
        return { session: { user: sessionResult.user } };
      }

      console.log('ℹ️ [AUTH-GUARD] Nenhuma sessão encontrada em getCurrentSession');
      return { session: null };
    };
  }

  const authClient = alsham.auth || alsham.supabase?.auth || runtime.supabase?.auth;

  console.log('📦 [AUTH-GUARD] AuthClient disponível:', !!authClient);
  console.log('📦 [AUTH-GUARD] getSession disponível:', typeof authClient?.getSession);

  if (authClient?.getSession) {
    console.log('✅ [AUTH-GUARD] Usando authClient.getSession');
    return async () => {
      const { data, error } = await authClient.getSession();
      if (error) {
        console.error('❌ [AUTH-GUARD] Erro ao buscar sessão:', error);
        throw error;
      }
      if (data?.session) {
        console.log('✅ [AUTH-GUARD] Sessão encontrada:', data.session.user?.email);
      } else {
        console.log('ℹ️ [AUTH-GUARD] Nenhuma sessão encontrada');
      }
      return { session: data?.session ?? null };
    };
  }

  console.warn('⚠️ [AUTH-GUARD] Nenhum session fetcher disponível');
  return null;
}

function readSessionBackup() {
  try {
    const raw = localStorage.getItem('alsham-session-backup');
    if (!raw) {
      console.log('ℹ️ [AUTH-GUARD] Nenhum backup de sessão encontrado');
      return null;
    }
    
    const parsed = JSON.parse(raw);
    const age = Date.now() - Number(parsed.timestamp);
    const expiresAt = Number(parsed.expires_at) * 1000;

    console.log('📦 [AUTH-GUARD] Backup encontrado:', {
      user: parsed.user?.email,
      age: `${Math.floor(age / 1000)}s`,
      expiresAt: new Date(expiresAt).toISOString()
    });

    if (Number.isFinite(age) && age < 5 * 60 * 1000 && expiresAt > Date.now()) {
      console.log('✅ [AUTH-GUARD] Backup válido');
      return parsed;
    }
    
    console.log('⏰ [AUTH-GUARD] Backup expirado');
  } catch (err) {
    console.warn('⚠️ [AUTH-GUARD] Falha ao ler backup da sessão:', err);
  }

  return null;
}

function persistSessionBackup(session) {
  if (!session?.user) {
    console.log('⚠️ [AUTH-GUARD] Sessão inválida, não salvando backup');
    return;
  }

  try {
    const backup = {
      user: session.user,
      expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
      timestamp: Date.now()
    };
    
    localStorage.setItem('alsham-session-backup', JSON.stringify(backup));
    console.log('✅ [AUTH-GUARD] Backup salvo:', backup.user.email);
  } catch (err) {
    console.warn('⚠️ [AUTH-GUARD] Não foi possível salvar o backup da sessão:', err);
  }
}

export async function robustAuthGuard(options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 10000,
    redirectOnFail = '/login.html',
    allowedWithoutAuth = ['/login.html', '/register.html', '/reset-password.html'],
    skipRedirect = false
  } = options;

  console.log('🔐 [AUTH-GUARD] Iniciando auth guard robusto...');
  console.log('📍 [AUTH-GUARD] URL atual:', window.location.pathname);
  console.log('⚙️ [AUTH-GUARD] Opções:', { maxRetries, timeout, skipRedirect });

  const currentPath = window.location.pathname;
  const isPublicPage = allowedWithoutAuth.some((path) => currentPath.includes(path));

  if (isPublicPage) {
    console.log('🔓 [AUTH-GUARD] Página pública detectada. Auth guard opcional.');
    return { success: true, public: true };
  }

  // 🔧 FIX: Prevenir múltiplos redirecionamentos simultâneos
  if (redirectInProgress) {
    console.warn('⚠️ [AUTH-GUARD] Redirecionamento já em progresso, abortando...');
    return { success: false, error: 'Redirect in progress' };
  }

  const fetchSession = resolveSessionFetcher();

  if (typeof fetchSession !== 'function') {
    console.error('❌ [AUTH-GUARD] Nenhum provedor de sessão disponível.');
    
    // 🔧 FIX: Só redirecionar se não estiver em página pública
    if (!skipRedirect && redirectOnFail && !isPublicPage) {
      console.log('🔄 [AUTH-GUARD] Redirecionando para:', redirectOnFail);
      redirectInProgress = true;
      setTimeout(() => {
        window.location.href = redirectOnFail;
      }, 100);
    }
    
    return { success: false, error: 'Supabase indisponível' };
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt += 1;
    console.log(`🔄 [AUTH-GUARD] Tentativa ${attempt}/${maxRetries}`);

    try {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Session timeout')), timeout);
      });

      const { session } = await Promise.race([fetchSession(), timeoutPromise]);
      clearTimeout(timeoutId);

      if (session?.user) {
        console.log('✅ [AUTH-GUARD] Sessão válida:', session.user.email ?? session.user.id);
        persistSessionBackup(session);
        
        // 🔧 FIX: Resetar flag de redirecionamento
        redirectInProgress = false;
        
        return { success: true, session, user: session.user };
      }

      console.log('⚠️ [AUTH-GUARD] Sessão não encontrada, verificando backup...');
      
      const backup = readSessionBackup();
      if (backup?.user) {
        console.log('✅ [AUTH-GUARD] Sessão válida recuperada do backup:', backup.user.email);
        
        // 🔧 FIX: Resetar flag de redirecionamento
        redirectInProgress = false;
        
        return {
          success: true,
          session: { user: backup.user },
          user: backup.user,
          fromBackup: true
        };
      }

      console.log('⚠️ [AUTH-GUARD] Nenhum backup válido encontrado');

      if (attempt >= maxRetries) {
        console.log('❌ [AUTH-GUARD] Máximo de tentativas atingido');
        break;
      }

      console.log(`⏳ [AUTH-GUARD] Aguardando ${retryDelay}ms antes da próxima tentativa...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    } catch (err) {
      console.error('❌ [AUTH-GUARD] Erro ao validar sessão:', err);
      lastError = err;
      
      if (attempt >= maxRetries) {
        console.log('❌ [AUTH-GUARD] Máximo de tentativas atingido após erro');
        break;
      }
      
      console.log(`⏳ [AUTH-GUARD] Aguardando ${retryDelay}ms antes da próxima tentativa...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  console.error('❌ [AUTH-GUARD] Auth guard falhou após', maxRetries, 'tentativas');
  console.error('❌ [AUTH-GUARD] Último erro:', lastError?.message);
  
  // 🔧 FIX: Limpar backup apenas se realmente não houver sessão
  try {
    console.log('🧹 [AUTH-GUARD] Limpando backup de sessão...');
    localStorage.removeItem('alsham-session-backup');
  } catch (storageError) {
    console.warn('⚠️ [AUTH-GUARD] Falha ao limpar backup da sessão:', storageError);
  }

  // 🔧 FIX: Prevenir loop de redirecionamento
  if (!skipRedirect && redirectOnFail && !isPublicPage) {
    if (redirectInProgress) {
      console.warn('⚠️ [AUTH-GUARD] Redirecionamento já em progresso, abortando...');
      return { success: false, error: 'Redirect already in progress' };
    }
    
    console.log('🔄 [AUTH-GUARD] Redirecionando para:', redirectOnFail);
    redirectInProgress = true;
    
    // 🔧 FIX: Adicionar delay antes do redirecionamento
    setTimeout(() => {
      console.log('🔄 [AUTH-GUARD] Executando redirecionamento...');
      window.location.href = redirectOnFail;
    }, 500);
  }

  return {
    success: false,
    error: lastError?.message || 'Auth failed'
  };
}

// 🔧 FIX: Resetar flag quando a página carrega
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    redirectInProgress = false;
    console.log('✅ [AUTH-GUARD] Flag de redirecionamento resetada');
  });
}

console.log('📦 [AUTH-GUARD] Módulo auth-guard.js carregado');
