import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configurações do Supabase
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


// ===== NOVO: LÓGICA DO DASHBOARD =====

/**
 * Busca os KPIs principais para o Dashboard.
 * Esta função é a chave para substituir os dados "mock".
 */
export async function getDashboardKPIs(orgId) {
    try {
        // Usamos Promise.all para buscar dados em paralelo, muito mais rápido!
        const [leadsResult, opportunitiesResult] = await Promise.all([
            supabase
                .from('leads_crm')
                .select('id, estagio, status, score_ia', { count: 'exact' })
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

        // --- Cálculos ---
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
            receita_total,
            score_media_ia,
            // Adicionamos alguns KPIs extras que seu dashboard "obra-prima" espera
            leads_quentes: leads.filter(l => l.temperatura === 'QUENTE').length, // Supondo que a coluna 'temperatura' exista
            receita_fechada: opportunities.filter(op => op.etapa === 'fechada_ganha').reduce((sum, op) => sum + (op.valor || 0), 0),
            interacoes_semana: 0, // Placeholder, pois ainda não buscamos interações
        };
        
        return { data: kpis, error: null };

    } catch (error) {
        console.error("Erro ao calcular KPIs do Dashboard:", error);
        return { data: null, error };
    }
}


// ===== GESTÃO DE AUTOMAÇÕES =====
export async function getAutomations(orgId) {
    // ... (código existente)
}
// ... (resto do seu supabase.js)

