// ALSHAM 360° PRIMA - O CÉREBRO DO SISTEMA
// Versão Definitiva: Contém TODAS as funções para interagir com o Supabase.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configurações do Supabase (ÚNICA VEZ, SÓ AQUI)
const supabaseUrl = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTIzNjIsImV4cCI6MjA3MDQ4ODM2Mn0.CxKiXMiYLz2b-yux0JI-A37zu4Q_nxQUnRf_MzKw-VI';
export const DEFAULT_ORG_ID = 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== AUTENTICAÇÃO E PERFIS =====

export async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    } catch (error) {
        console.error('Erro ao buscar perfil:', error.message);
        return null;
    }
}

export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
            const profile = await getUserProfile(user.id);
            return { user, profile };
        }
        return { user: null, profile: null };
    } catch (error) {
        console.error('Erro ao obter usuário:', error.message);
        return { user: null, profile: null };
    }
}


// ===== LÓGICA DO DASHBOARD =====

export async function getDashboardKPIs(orgId) {
    try {
        const [leadsResult, opportunitiesResult] = await Promise.all([
            supabase
                .from('leads_crm')
                .select('id, estagio, status, score_ia, temperatura', { count: 'exact' })
                .eq('org_id', orgId),
            supabase
                .from('sales_opportunities')
                .select('valor, etapa')
                .eq('org_id', orgId)
        ]);

        if (leadsResult.error) throw leadsResult.error;
        if (opportunitiesResult.error) throw opportunitiesResult.error;

        const leads = leadsResult.data || [];
        const opportunities = opportunitiesResult.data || [];

        const total_leads = leadsResult.count;
        const leads_convertidos = leads.filter(l => l.status === 'converted' || l.estagio === 'convertido').length;
        const receita_total = opportunities.reduce((sum, op) => sum + (op.valor || 0), 0);
        const leadsComScore = leads.filter(l => l.score_ia != null);
        const score_media_ia = leadsComScore.length > 0
            ? (leadsComScore.reduce((sum, l) => sum + l.score_ia, 0) / leadsComScore.length).toFixed(1)
            : 0;

        const kpis = {
            total_leads,
            leads_convertidos,
            receita_total: parseFloat(receita_total),
            score_media_ia: parseFloat(score_media_ia),
            receita_fechada: opportunities.filter(op => op.etapa === 'fechada_ganha').reduce((sum, op) => sum + (op.valor || 0), 0),
        };
        
        return { data: kpis, error: null };
    } catch (error) {
        console.error("Erro ao calcular KPIs do Dashboard:", error);
        return { data: null, error };
    }
}


// ===== GESTÃO DE LEADS =====

export async function getLeadsAvancados(orgId = DEFAULT_ORG_ID, filtros = {}) {
    try {
        let query = supabase
            .from('leads_crm')
            .select(`*, lead_interactions(*), sales_opportunities(*)`)
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        if (filtros.busca) {
            query = query.or(`nome.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%,empresa.ilike.%${filtros.busca}%`);
        }
        if (filtros.estagio && filtros.estagio !== '') {
            query = query.eq('estagio', filtros.estagio);
        }

        const { data, error } = await query.limit(filtros.limit || 50);
        if (error) throw error;
        
        return { data, error: null };
    } catch (error) {
        console.error('Erro ao buscar leads:', error);
        return { data: null, error: error.message };
    }
}

export async function createLeadAvancado(leadData, orgId = DEFAULT_ORG_ID) {
    try {
        const { data, error } = await supabase
            .from('leads_crm')
            .insert([{ ...leadData, org_id: orgId }])
            .select()
            .single();
        if (error) throw error;
        console.log(`✅ Lead criado com sucesso: ${data.nome}`);
        return { data, error: null };
    } catch (error) {
        console.error('Erro ao criar lead:', error);
        return { data: null, error: error.message };
    }
}

