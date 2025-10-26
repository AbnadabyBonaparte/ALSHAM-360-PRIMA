/**
 * AUTH GUARD ROBUSTO — PREVINE LOOP DE REDIRECIONAMENTO
 * Retry, timeout, backup, logs detalhados
 */
function resolveSessionFetcher() {
  const runtime = typeof window !== 'undefined' ? window : {};
  const alsham = runtime.AlshamSupabase || {};

  if (typeof alsham.getCurrentSession === 'function') {
    return async () => {
      const sessionResult = await alsham.getCurrentSession();

      if (!sessionResult) {
        return { session: null };
      }

      if ('data' in sessionResult && sessionResult.data?.session) {
        return { session: sessionResult.data.session };
      }

      if ('session' in sessionResult) {
        return { session: sessionResult.session };
      }

      if ('user' in sessionResult) {
        return { session: { user: sessionResult.user } };
      }

      return { session: null };
    };
  }

  const authClient = alsham.auth || alsham.supabase?.auth || runtime.supabase?.auth;

  if (authClient?.getSession) {
    return async () => {
      const { data, error } = await authClient.getSession();
      if (error) {
        throw error;
      }
      return { session: data?.session ?? null };
    };
  }

  return null;
}

function readSessionBackup() {
  try {
    const raw = localStorage.getItem('alsham-session-backup');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const age = Date.now() - Number(parsed.timestamp);
    const expiresAt = Number(parsed.expires_at) * 1000;

    if (Number.isFinite(age) && age < 5 * 60 * 1000 && expiresAt > Date.now()) {
      return parsed;
    }
  } catch (err) {
    console.warn('⚠️ Falha ao ler backup da sessão:', err);
  }

  return null;
}

function persistSessionBackup(session) {
  if (!session?.user) return;

  try {
    localStorage.setItem(
      'alsham-session-backup',
      JSON.stringify({
        user: session.user,
        expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
        timestamp: Date.now()
      })
    );
  } catch (err) {
    console.warn('⚠️ Não foi possível salvar o backup da sessão:', err);
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

  const currentPath = window.location.pathname;
  const isPublicPage = allowedWithoutAuth.some((path) => currentPath.includes(path));

  if (isPublicPage) {
    console.log('🔓 Página pública detectada. Auth guard opcional.');
    return { success: true, public: true };
  }

  const fetchSession = resolveSessionFetcher();

  if (typeof fetchSession !== 'function') {
    console.warn('⚠️ Nenhum provedor de sessão disponível.');
    if (!skipRedirect && redirectOnFail) {
      window.location.href = redirectOnFail;
    }
    return { success: false, error: 'Supabase indisponível' };
  }

  console.log('🔐 Iniciando auth guard robusto...');
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt += 1;
    console.log(`🔄 Tentativa ${attempt}/${maxRetries}`);

    try {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Session timeout')), timeout);
      });

      const { session } = await Promise.race([fetchSession(), timeoutPromise]);
      clearTimeout(timeoutId);

      if (session?.user) {
        console.log('✅ Sessão válida:', session.user.email ?? session.user.id);
        persistSessionBackup(session);
        return { success: true, session, user: session.user };
      }

      const backup = readSessionBackup();
      if (backup?.user) {
        console.log('✅ Sessão válida recuperada do backup');
        return {
          success: true,
          session: { user: backup.user },
          user: backup.user,
          fromBackup: true
        };
      }

      if (attempt >= maxRetries) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    } catch (err) {
      console.error('❗ Erro ao validar sessão:', err);
      lastError = err;
      if (attempt >= maxRetries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  console.error('❌ Auth guard falhou após', maxRetries, 'tentativas');
  try {
    localStorage.removeItem('alsham-session-backup');
  } catch (storageError) {
    console.warn('⚠️ Falha ao limpar backup da sessão:', storageError);
  }

  if (!skipRedirect && redirectOnFail) {
    window.location.href = redirectOnFail;
  }

  return {
    success: false,
    error: lastError?.message || 'Auth failed'
  };
}
