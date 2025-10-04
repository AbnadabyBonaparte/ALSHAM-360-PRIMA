// public/js/supabase-umd.js
// ALSHAM 360° PRIMA - Supabase UMD Wrapper
// Universal Module Definition - funciona com import e <script>

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['@supabase/supabase-js'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('@supabase/supabase-js'));
  } else {
    // Browser globals - expõe no window
    root.AlshamSupabase = factory(root.supabase);
  }
}(typeof self !== 'undefined' ? self : this, function (supabaseModule) {
  'use strict';

  // Se for browser e supabase não foi carregado via CDN, importa dinamicamente
  if (typeof window !== 'undefined' && !supabaseModule) {
    console.error('Supabase client não encontrado. Carregue via CDN ou npm.');
    return null;
  }

  const { createClient } = supabaseModule || window.supabase || {};
  
  if (!createClient) {
    console.error('createClient não disponível');
    return null;
  }

  // Configuração
  const SUPABASE_URL = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4OTU2ODQsImV4cCI6MjA0MzQ3MTY4NH0.sb_publishable_4GXjFzIqbEtaLwAu-ZNFA_BxkNHSIGp';
  const DEFAULT_ORG_ID = 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe';

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  });

  // Funções principais (copie do seu src/lib/supabase.js)
  async function getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data?.session || null;
    } catch (err) {
      console.error('getCurrentSession error:', err);
      return null;
    }
  }

  async function genericSignIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  async function getCurrentOrgId() {
    try {
      const session = await getCurrentSession();
      if (!session?.user) return DEFAULT_ORG_ID;
      
      const { data } = await supabase
        .from('user_profiles')
        .select('org_id')
        .eq('user_id', session.user.id)
        .single();
      
      return data?.org_id || DEFAULT_ORG_ID;
    } catch {
      return DEFAULT_ORG_ID;
    }
  }

  // ... adicione as outras funções necessárias aqui

  // API pública
  const API = {
    supabase,
    getCurrentSession,
    genericSignIn,
    getCurrentOrgId,
    DEFAULT_ORG_ID
    // ... exponha as funções necessárias
  };

  // Se estiver no browser, expõe no window também
  if (typeof window !== 'undefined') {
    window.AlshamSupabase = API;
    console.log('AlshamSupabase carregado via UMD');
  }

  return API;
}));
