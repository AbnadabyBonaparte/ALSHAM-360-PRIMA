import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

// Configuração do Supabase
const supabaseUrl = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
const supabaseKey = 'SUA_CHAVE_PUBLICA_AQUI'; // ⚠️ Recomendo mover para .env

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

class AlshamSupabase {
    constructor() {
        this.client = supabase;
        this.currentUser = null;
        this.orgId = 'alsham-default-org-2024';
        this.init();
    }

    async init() {
        console.log('🏁 Iniciando sistema de automações...');
        try {
            const { data: { session } } = await this.client.auth.getSession();
            if (session?.user) {
                this.currentUser = session.user;
                console.log('✅ Usuário autenticado:', session.user.email);
            } else {
                console.log('👤 Usuário não autenticado - iniciando modo demo');
                await this.createMockUser();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar sistema de automações:', error);
            await this.createMockUser();
        }
    }

    async createMockUser() {
        this.currentUser = {
            id: 'demo-user-2024',
            email: 'demo@alsham360prima.com',
            user_metadata: { name: 'Usuário Demo' }
        };
    }

    async getCurrentSession() {
        try {
            const { data: { session }, error } = await this.client.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Erro ao obter sessão:', error);
            return null;
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.client.auth.getUser();
            if (error) throw error;
            return user || this.currentUser;
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return this.currentUser;
        }
    }

    async getDashboardKPIs() {
        try {
            const { data, error } = await this.client
                .from('dashboard_summary')
                .select('*')
                .eq('org_id', this.orgId)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (error) throw error;
            return data?.[0] || {};
        } catch (error) {
            console.error('Erro ao carregar KPIs:', error);
            return {};
        }
    }

    async getLeads(limit = 50) {
        try {
            const { data, error } = await this.client
                .from('leads_crm')
                .select('*')
                .eq('org_id', this.orgId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao carregar leads:', error);
            return [];
        }
    }

    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            this.currentUser = null;
            return true;
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            return false;
        }
    }

    // 🔹 Função extra: observar mudanças de autenticação
    onAuthStateChange(callback) {
        return this.client.auth.onAuthStateChange(callback);
    }

    // 🔹 Função extra: obter Org ID atual
    async getCurrentOrgId() {
        return this.orgId;
    }

    // 🔹 Função extra: formatar data
    formatDateBR(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // 🔹 Função extra: notificações simples
    showNotification(message, type = 'info') {
        console.log(`🔔 [${type.toUpperCase()}] ${message}`);
        alert(message); // simples, pode ser substituído por toast
    }
}

const alshamSupabase = new AlshamSupabase();

export {
    supabase,
    alshamSupabase,
    // Funções individuais
    supabase as client,
    () => alshamSupabase.getCurrentSession() as getCurrentSession,
    () => alshamSupabase.getCurrentUser() as getCurrentUser,
    () => alshamSupabase.getDashboardKPIs() as getDashboardKPIs,
    (limit) => alshamSupabase.getLeads(limit) as getLeads,
    () => alshamSupabase.signOut() as signOut,
    (cb) => alshamSupabase.onAuthStateChange(cb) as onAuthStateChange,
    () => alshamSupabase.getCurrentOrgId() as getCurrentOrgId,
    (date) => alshamSupabase.formatDateBR(date) as formatDateBR,
    (msg, type) => alshamSupabase.showNotification(msg, type) as showNotification
};
