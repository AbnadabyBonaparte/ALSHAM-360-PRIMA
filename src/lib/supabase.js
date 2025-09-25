import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

// ⚠️ Recomendo mover esses valores para variáveis de ambiente (.env)
const supabaseUrl = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
const supabaseKey = 'SUA_CHAVE_PUBLICA_AQUI';

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

    async getAutomations() {
        try {
            const { data, error } = await this.client
                .from('automation_rules')
                .select('*')
                .eq('org_id', this.orgId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao carregar automações:', error);
            return [];
        }
    }

    async saveSettings(settings) {
        try {
            const { error } = await this.client
                .from('organization_settings')
                .upsert({
                    org_id: this.orgId,
                    settings,
                    updated_at: new Date().toISOString()
                });
            if (error) throw error;
            return { success: true, message: 'Configurações salvas com sucesso' };
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            return { success: false, error: error.message };
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

    // 🔹 Extra: observar mudanças de autenticação
    onAuthStateChange(callback) {
        return this.client.auth.onAuthStateChange(callback);
    }

    // 🔹 Extra: obter Org ID atual
    async getCurrentOrgId() {
        return this.orgId;
    }

    getDefaultOrgId() {
        return this.orgId;
    }

    // 🔹 Extra: consulta genérica
    async genericSelect(table, filters = {}) {
        try {
            let query = this.client.from(table).select('*');
            for (const [key, value] of Object.entries(filters)) {
                query = query.eq(key, value);
            }
            const { data, error } = await query;
            if (error) throw error;
            return { data };
        } catch (error) {
            console.error(`Erro no genericSelect (${table}):`, error);
            return { data: [] };
        }
    }

    // 🔹 Extra: formatar data
    formatDateBR(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // 🔹 Extra: sistema de notificação
    showNotification(message, type = 'info') {
        if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`🔔 [${type.toUpperCase()}] ${message}`);
            alert(message);
        }
    }
}

// Instância global
const alshamSupabase = new AlshamSupabase();

// Funções individuais
function getCurrentSession() { return alshamSupabase.getCurrentSession(); }
function getCurrentUser() { return alshamSupabase.getCurrentUser(); }
function getDashboardKPIs() { return alshamSupabase.getDashboardKPIs(); }
function getLeads(limit) { return alshamSupabase.getLeads(limit); }
function getAutomations() { return alshamSupabase.getAutomations(); }
function saveSettings(settings) { return alshamSupabase.saveSettings(settings); }
function signOut() { return alshamSupabase.signOut(); }
function onAuthStateChange(callback) { return alshamSupabase.onAuthStateChange(callback); }
function getCurrentOrgId() { return alshamSupabase.getCurrentOrgId(); }
function getDefaultOrgId() { return alshamSupabase.getDefaultOrgId(); }
function genericSelect(table, filters) { return alshamSupabase.genericSelect(table, filters); }
function formatDateBR(date) { return alshamSupabase.formatDateBR(date); }
function showNotification(message, type) { return alshamSupabase.showNotification(message, type); }

// ✅ Exportações finais
export {
  supabase,
  alshamSupabase,
  getCurrentSession,
  getCurrentUser,
  getDashboardKPIs,
  getLeads,
  getAutomations,
  saveSettings,
  signOut,
  onAuthStateChange,
  getCurrentOrgId,
  getDefaultOrgId,
  genericSelect,
  formatDateBR,
  showNotification
};
