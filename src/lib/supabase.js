// ALSHAM 360° PRIMA - SUPABASE LIB V4 (Definitivo, seguro, multi-tenant)
// Troque as duas linhas abaixo pelo seu projeto Supabase!
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co' // <-- SEU PROJETO!
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTIzNjIsImV4cCI6MjA3MDQ4ODM2Mn0.CxKiXMiYLz2b-yux0JI-A37zu4Q_nxQUnRf_MzKw-VI' // <-- SUA ANON KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const TABLE = 'leads_crm'

// ==== AUTENTICAÇÃO / PERFIL ====
export async function getCurrentUser() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { user: null, profile: null }
  // Busca perfil (com org_id e nome)
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, user_id, org_id, full_name, email')
    .eq('user_id', user.id)
    .single()
  if (profileError || !profile) return { user, profile: null }
  return { user, profile }
}

export async function signOut() {
  await supabase.auth.signOut()
}

// ==== CRUD DE LEADS (orgId SEMPRE OBRIGATÓRIO) ====
export async function getLeads(orgId) {
  if (!orgId) return { data: [], error: 'Org ID não informado.' }
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createLead(lead, orgId) {
  if (!orgId) return { data: null, error: 'Org ID não informado.' }
  const payload = { ...lead, org_id: orgId }
  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single()
  return { data, error }
}

export async function updateLead(leadId, lead, orgId) {
  if (!orgId) return { data: null, error: 'Org ID não informado.' }
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...lead })
    .eq('id', leadId)
    .eq('org_id', orgId)
    .select()
    .single()
  return { data, error }
}

export async function deleteLead(leadId, orgId) {
  if (!orgId) return { data: null, error: 'Org ID não informado.' }
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', leadId)
    .eq('org_id', orgId)
    .select()
    .single()
  return { data, error }
}

// ==== SUPORTE ORGANIZAÇÃO (caso queira usar localStorage) ====
export function getCurrentOrgId() {
  return localStorage.getItem('org_id')
}

// ==== OPCIONAL: Login, cadastro, social, reset senha ====
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error }
  return { user: data.user, error: null }
}
export async function signUpWithEmail(email, password, userData = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: userData }
  })
  if (error) return { user: null, error }
  return { user: data.user, error: null }
}
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/src/pages/login.html`
  })
  if (error) return { data: null, error }
  return { data, error: null }
}
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { user: null, error }
  return { user: data.user, error: null }
}
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/index.html` }
  })
  if (error) return { data: null, error }
  return { data, error: null }
}
export async function signInWithMicrosoft() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: { redirectTo: `${window.location.origin}/index.html` }
  })
  if (error) return { data: null, error }
  return { data, error: null }
}

// ==== OPCIONAL: Sessão, listener auth ====
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}
export function onAuthStateChange(callback) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    let profile = null
    if (session?.user) profile = await getUserProfile(session.user.id)
    callback(event, session, profile)
  })
}
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') return null
  return data
}

// ==== OPCIONAL: Exporte supabase para casos avançados ====
export default supabase
