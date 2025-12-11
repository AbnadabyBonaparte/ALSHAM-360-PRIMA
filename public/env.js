// /public/env.js
// Valores devem ser injetados via variáveis de ambiente no deploy (sem segredos no repositório)
window.__VITE_SUPABASE_URL__ = window.__VITE_SUPABASE_URL__ || "<set VITE_SUPABASE_URL at deploy>";
window.__VITE_SUPABASE_ANON_KEY__ = window.__VITE_SUPABASE_ANON_KEY__ || "<set VITE_SUPABASE_ANON_KEY at deploy>";
