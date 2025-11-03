// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA – SUPABASE REACT WRAPPER v1.1 (COMPLETO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🜂 Autoridade: Citizen Supremo X.1
// 📅 Data: 01/11/2025
// 🎯 Missão: Conectar o dashboard React (App.tsx) ao backend Supabase
// 🧩 Wrapper simplificado com TODAS as 26 funções necessárias
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { createClient } from "@supabase/supabase-js";

// ===============================================================
// 🔐 CONFIGURAÇÃO BÁSICA
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

/** Retorna o ID da organização ativa */
export async function getCurrentOrgId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_organizations")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (error) return null;
    return data?.org_id ?? null;
  } catch (err) {
    console.warn("⚠️ Falha ao buscar organização:", err);
    return null;
  }
}

// ===============================================================
// 📊 LEADS
// ===============================================================

/** Retorna leads */
export async function getLeads(filters: Record<string, any> = {}) {
  const query = supabase.from("leads_crm").select("*");
  
  if (filters.status) {
    query.eq("status", filters.status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao buscar leads:", error);
    return [];
  }
  return data ?? [];
}

/** Cria um lead */
export async function createLead(leadData: any) {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase
    .from("leads_crm")
    .insert({ ...leadData, organization_id: orgId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Atualiza um lead */
export async function updateLead(id: string, updates: any) {
  const { data, error } = await supabase
    .from("leads_crm")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Deleta um lead */
export async function deleteLead(id: string) {
  const { error } = await supabase
    .from("leads_crm")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// ===============================================================
// 👥 CONTACTS
// ===============================================================

/** Retorna contatos */
export async function getContacts(filters: Record<string, any> = {}) {
  const query = supabase.from("contacts").select("*");

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.eq(key, value);
  });

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao buscar contatos:", error);
    return [];
  }
  return data ?? [];
}

/** Cria um contato */
export async function createContact(contactData: any) {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...contactData, organization_id: orgId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ===============================================================
// 🏢 ACCOUNTS
// ===============================================================

/** Retorna contas/empresas */
export async function getAccounts(filters: Record<string, any> = {}) {
  const query = supabase.from("accounts").select("*");

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.eq(key, value);
  });

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao buscar contas:", error);
    return [];
  }
  return data ?? [];
}

/** Cria uma conta */
export async function createAccount(accountData: any) {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase
    .from("accounts")
    .insert({ ...accountData, organization_id: orgId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ===============================================================
// 🚀 CAMPAIGNS
// ===============================================================

/** Retorna campanhas */
export async function getCampaigns(filters: Record<string, any> = {}) {
  const query = supabase.from("campaigns").select("*");

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.eq(key, value);
  });

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao buscar campanhas:", error);
    return [];
  }
  return data ?? [];
}

/** Cria uma campanha */
export async function createCampaign(campaignData: any) {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ ...campaignData, organization_id: orgId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Atualiza uma campanha */
export async function updateCampaign(id: string, updates: any) {
  const { data, error } = await supabase
    .from("campaigns")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ===============================================================
// 💼 DEALS (Sales Pipeline)
// ===============================================================

/** Retorna negócios/deals */
export async function getDeals(filters: Record<string, any> = {}) {
  const query = supabase.from("sales_opportunities").select("*");

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.eq(key, value);
  });

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao buscar deals:", error);
    return [];
  }
  return data ?? [];
}

/** Cria um deal */
export async function createDeal(dealData: any) {
  const orgId = await getCurrentOrgId();
  const { data, error } = await supabase
    .from("sales_opportunities")
    .insert({ ...dealData, organization_id: orgId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Atualiza um deal */
export async function updateDeal(id: string, updates: any) {
  const { data, error } = await supabase
    .from("sales_opportunities")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ===============================================================
// 🏆 GAMIFICATION
// ===============================================================

/** Retorna pontuações de gamificação agregadas por usuário */
export async function getGamificationScores(limit = 5) {
  try {
    const orgId = await getCurrentOrgId();
    
    // Buscar pontos agregados por usuário
    const { data, error } = await supabase
      .from("gamification_points")
      .select("user_id, points_awarded")
      .eq("org_id", orgId || "");

    if (error) {
      console.error("Erro ao buscar gamificação:", error);
      return [];
    }

    // Agregar pontos por usuário
    const userScores = (data || []).reduce((acc: any, item: any) => {
      const userId = item.user_id;
      if (!acc[userId]) {
        acc[userId] = { user_id: userId, total_points: 0 };
      }
      acc[userId].total_points += item.points_awarded || 0;
      return acc;
    }, {});

    // Converter para array e ordenar
    const sortedScores = Object.values(userScores)
      .sort((a: any, b: any) => b.total_points - a.total_points)
      .slice(0, limit);

    // Buscar informações dos usuários
    const userIds = sortedScores.map((s: any) => s.user_id);
    
    if (userIds.length === 0) {
      return [];
    }
    
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", userIds);

    // Combinar dados
    return sortedScores.map((score: any, index: number) => {
      const profile = profiles?.find((p: any) => p.user_id === score.user_id);
      
      return {
        user_id: score.user_id,
        score: score.total_points,
        level: Math.floor(score.total_points / 100) + 1, // 1 level a cada 100 pontos
        user_name: profile?.full_name || `Usuário ${index + 1}`,
        avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${score.user_id}`,
      };
    });
  } catch (err) {
    console.error("Erro ao buscar gamificação:", err);
    return [];
  }
}

// ===============================================================
// 🔧 GENERIC CRUD
// ===============================================================
/** Select genérico */
export async function genericSelect(table: string, filters: any[] = [], options: any = {}) {
  let query = supabase.from(table).select(options.select || "*");

  filters.forEach((filter) => {
    if (filter.operator === "eq") {
      query = query.eq(filter.field, filter.value);
    } else if (filter.operator === "in") {
      query = query.in(filter.field, filter.value);
    }
  });

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Insert genérico */
export async function genericInsert(table: string, payload: any, orgId?: string) {
  const finalOrgId = orgId ?? await getCurrentOrgId();
  const { data, error } = await supabase
    .from(table)
    .insert({ ...payload, organization_id: finalOrgId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update genérico */
export async function genericUpdate(table: string, filters: any[] = [], updates: any) {
  let query = supabase.from(table).update(updates);

  filters.forEach((filter) => {
    if (filter.operator === "eq") {
      query = query.eq(filter.field, filter.value);
    }
  });

  const { data, error } = await query.select();
  if (error) throw error;
  return data;
}

// ===============================================================
// 🔔 SUBSCRIPTIONS (Real-time)
// ===============================================================

/** Subscribe para mudanças em contatos */
export function subscribeContacts(callback: (payload: any) => void) {
  return supabase
    .channel("contacts_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, callback)
    .subscribe();
}

/** Subscribe para mudanças em campanhas */
export function subscribeCampaigns(callback: (payload: any) => void) {
  return supabase
    .channel("campaigns_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "campaigns" }, callback)
    .subscribe();
}

/** Subscribe para mudanças em leads */
export function subscribeLeads(callback: (payload: any) => void) {
  return supabase
    .channel("leads_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "leads_crm" }, callback)
    .subscribe();
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
      organization_id: orgId,
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
// ⚡ TESTE DE CONEXÃO
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
