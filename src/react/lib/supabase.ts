// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA – SUPABASE REACT WRAPPER v1.0 (HARMONIZED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🜂 Autoridade: Citizen Supremo X.1
// 📅 Data: 01/11/2025
// 🎯 Missão: Conectar o dashboard React (App.tsx) ao backend Supabase v6.4-GRAAL
// 🧩 Este arquivo serve como ponte simplificada entre o frontend React e o supabase.js unificado
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { createClient } from "@supabase/supabase-js";

// ===============================================================
// 🔐 CONFIGURAÇÃO BÁSICA (Variáveis do ambiente Vite)
// ===============================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// ===============================================================
// 🧠 CLIENTE PRINCIPAL
// ===============================================================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ===============================================================
// ⚙️ FUNÇÕES CORE
// ===============================================================

/** Retorna o cliente Supabase instanciado */
export function getSupabaseClient() {
  return supabase;
}

/** Retorna a sessão atual (usuário logado) */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session ?? null;
}

/** Retorna o ID da organização ativa (usando tabela encrypted local) */
export async function getCurrentOrgId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;

    // Busca o primeiro registro de organização associada
    const { data, error } = await supabase
      .from("user_organizations")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (error) return null;
    return data?.organization_id ?? null;
  } catch (err) {
    console.warn("⚠️ Falha ao buscar organização:", err);
    return null;
  }
}

// ===============================================================
// 📊 CONSULTAS COMUNS (CRUD SIMPLIFICADOS)
// ===============================================================

/** Retorna todos os leads ativos */
export async function getLeads(filters: Record<string, any> = {}) {
  const query = supabase.from("leads_crm").select("*");

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.eq(key, value);
  });

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Retorna campanhas ativas */
export async function getCampaigns(filters: Record<string, any> = {}) {
  const query = supabase.from("marketing_campaigns").select("*");

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.eq(key, value);
  });

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Retorna negócios (deals) em andamento */
export async function getDeals(filters: Record<string, any> = {}) {
  const query = supabase.from("sales_pipeline").select("*");

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.eq(key, value);
  });

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Retorna pontuações de gamificação */
export async function getGamificationScores(limit = 5) {
  const { data, error } = await supabase
    .from("gamification_scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

// ===============================================================
// 🧾 AUDITORIA
// ===============================================================
/** Cria registro de log de auditoria */
export async function createAuditLog(action: string, details: any = {}) {
  try {
    const session = await getCurrentSession();
    const userId = session?.user?.id ?? null;
    const orgId = await getCurrentOrgId();

    const payload = {
      action,
      details,
      user_id: userId,
      org_id: orgId,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("audit_log").insert(payload);
    if (error) throw error;

    console.info(`🧾 Audit log criado: ${action}`);
  } catch (err) {
    console.warn("⚠️ Falha ao criar audit log:", err);
  }
}

// ===============================================================
// ⚡ TESTE DE CONEXÃO (opcional)
// ===============================================================
export async function testConnection() {
  try {
    const org = await getCurrentOrgId();
    console.info("✅ Supabase conectado! Org ativa:", org);
    return true;
  } catch (err) {
    console.error("❌ Falha Supabase:", err);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔚 FIM DO ARQUIVO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
