/**
 * AUTH GUARD ROBUSTO — PREVINE LOOP DE REDIRECIONAMENTO
 * Retry, timeout, backup, logs detalhados
 */
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

  if (isPublicPage && !skipRedirect) {
    console.log('🔓 Página pública, pulando auth guard');
    return { success: true, public: true };
  }

  console.log('🔐 Iniciando auth guard robusto...');
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt += 1;
    console.log(`🔄 Tentativa ${attempt}/${maxRetries}`);

    try {
      if (!window.supabase?.auth) {
        console.warn('⚠️ Supabase não disponível');
        lastError = new Error('Supabase client indisponível');
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      const sessionPromise = window.supabase.auth.getSession();
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Session timeout')), timeout);
      });

      const result = await Promise.race([sessionPromise, timeoutPromise]);
      clearTimeout(timeoutId);

      const { data: { session } = { session: null }, error } = result || {};

      if (error) {
        console.error('❗ Erro ao obter sessão:', error);
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      if (session?.user) {
        console.log('✅ Sessão válida:', session.user.email);
        try {
          localStorage.setItem(
            'alsham-session-backup',
            JSON.stringify({
              user: session.user,
              expires_at: session.expires_at,
              timestamp: Date.now()
            })
          );
        } catch (storageError) {
          console.warn('⚠️ Não foi possível salvar o backup da sessão:', storageError);
        }
        return { success: true, session, user: session.user };
      }

      const backupRaw = localStorage.getItem('alsham-session-backup');
      if (backupRaw) {
        try {
          const parsed = JSON.parse(backupRaw);
          const age = Date.now() - Number(parsed.timestamp);
          const expiresAt = Number(parsed.expires_at) * 1000;
          if (Number.isFinite(age) && age < 5 * 60 * 1000 && expiresAt > Date.now()) {
            console.log('✅ Sessão válida no backup');
            return {
              success: true,
              session: { user: parsed.user },
              user: parsed.user,
              fromBackup: true
            };
          }
        } catch (parseError) {
          console.warn('⚠️ Falha ao ler backup da sessão:', parseError);
        }
      }

      if (attempt >= maxRetries) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    } catch (err) {
      console.error('❗ Erro inesperado no auth guard:', err);
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
    error: lastError?.message || 'Auth failed',
    public: isPublicPage
  };
}
