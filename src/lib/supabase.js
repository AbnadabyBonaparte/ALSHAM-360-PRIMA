/**
 * ALSHAM 360° PRIMA — Supabase Client v2.0.0-secure
 * Compatível com Vercel Build + CSP Nonce
 * Autor: ALSHAM Global Commerce
 */

(async () => {
  const SUPABASE_URL = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTIzNjIsImV4cCI6MjA3MDQ4ODM2Mn0.CxKiXMiYLz2b-yux0JI-A37zu4Q_nxQUnRf_MzKw-VI';
  const DEFAULT_ORG_ID = 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe';

  // ✅ Importa Supabase dinamicamente (sem import estático)
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.2/+esm');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'alsham-360-prima@v2.0.0',
        'X-Environment': (typeof window !== 'undefined' && window.location.hostname) || 'server'
      }
    }
  });

  console.log('✅ Supabase Client ativo:', SUPABASE_URL);

  // 🔧 Helpers básicos (mesmo do src/lib/supabase.js)
  const handleError = (err, ctx = 'supabase') => {
    console.error('❌ Supabase Error:', ctx, err);
    return { success: false, message: err?.message || String(err) };
  };

  const getCurrentSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data?.session;
    } catch (err) {
      return handleError(err, 'getCurrentSession');
    }
  };

  const getCurrentOrgId = async () => {
    try {
      const session = await getCurrentSession();
      if (!session?.user) return DEFAULT_ORG_ID;
      const userId = session.user.id;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('org_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (error || !data?.org_id) return DEFAULT_ORG_ID;
      return data.org_id;
    } catch {
      return DEFAULT_ORG_ID;
    }
  };

  const genericSelect = async (table, filters = {}, options = {}) => {
    try {
      let q = supabase.from(table).select(options.select || '*');
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q = q.eq(k, v);
      });
      if (options.order)
        q = q.order(options.order.column, { ascending: !!options.order.ascending });
      if (options.limit) q = q.limit(options.limit);
      const { data, error } = await q;
      if (error) throw error;
      return { data };
    } catch (err) {
      return handleError(err, `select:${table}`);
    }
  };

  // 🌐 Expor no window
  window.AlshamSupabase = {
    supabase,
    getCurrentSession,
    getCurrentOrgId,
    genericSelect,
    handleError,
    DEFAULT_ORG_ID
  };

  console.log('%c⚡ window.AlshamSupabase v2.0.0 pronto.', 'color:#22c55e;font-weight:bold;');
})();
