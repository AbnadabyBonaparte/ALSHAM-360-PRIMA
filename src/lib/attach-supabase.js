import * as SupabaseLib from './supabase.js';

function mergeInto(target, source) {
  Object.entries(source).forEach(([key, value]) => {
    if (!(key in target)) {
      target[key] = value;
    }
  });
}

export function ensureSupabaseGlobal() {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = window.AlshamSupabase ? { ...window.AlshamSupabase } : {};
  mergeInto(existing, SupabaseLib);

  if (!existing.supabase && SupabaseLib?.supabase) {
    existing.supabase = SupabaseLib.supabase;
  }

  if (!existing.auth && SupabaseLib?.supabase?.auth) {
    existing.auth = SupabaseLib.supabase.auth;
  }

  if (typeof existing.getCurrentSession !== 'function' && typeof SupabaseLib.getCurrentSession === 'function') {
    existing.getCurrentSession = SupabaseLib.getCurrentSession;
  }

  existing.__alshamAttached = true;
  window.AlshamSupabase = existing;
  return existing;
}

export default ensureSupabaseGlobal;
