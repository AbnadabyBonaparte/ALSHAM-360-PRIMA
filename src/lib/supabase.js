import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

// Configuração do Supabase
const supabaseUrl = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwOTU3NDMsImV4cCI6MjA1MTY3MTc0M30.n5wpfCOpjVgB5tF5vSNOJYXCZ19eJ3peG4010z2d_sI';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Funções personalizadas do sistema
class AlshamSupabase {
    constructor() {
        this.client = supabase;
        this.currentUser = null;
        this.orgId = 'alsham-default-org-2024';
        
        // Inicializar sistema
        this.init();
    }

    async init() {
        console.log('🏁 Iniciando sistema de automações...');
        try {
            // Verificar sessão atual
            const { data: { session } } = await this.client.auth.getSession();
            
            if (session?.user) {
                this.currentUser = session.user;
                console.log('✅ Usuário autenticado:', session.user.email);
            } else {
                console.log('👤 Usuário não autenticado - iniciando modo demo');
                await this.createMockUser();
            }
            
            console.log('🎯 Sistema de automações carregado com sucesso!');
            
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
        console.log('🎭 Criando mock do AlshamSupabase');
    }

    // Função para obter usuário atual
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.client.auth.getUser();
            
            if (error) throw error;
            
            if (user) {
                this.currentUser = user;
                return {
                    success: true,
                    user: user,
                    message: 'Usuário autenticado'
                };
            }
            
            return {
                success: false,
                user: this.currentUser, // Retorna mock user
                message: 'Usuário não autenticado - usando modo demo'
            };
            
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return {
                success: false,
                user: this.currentUser,
                message: 'Erro ao buscar usuário: ' + error.message
            };
        }
    }

    // Função para obter KPIs do dashboard
    async getDashboardKPIs() {
        try {
            console.log('🔄 Carregando KPIs do Dashboard...');
            
            const { data, error } = await this.client
                .from('dashboard_summary')
                .select(`
                    total_leads,
                    leads_convertidos,
                    taxa_conversao,
                    receita_total,
                    automacoes_ativas,
                    updated_at
                `)
                .eq('org_id', this.orgId)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                console.log('✅ KPIs carregados do Supabase:', data[0]);
                return {
                    success: true,
                    data: data[0]
                };
            }

            // Retornar dados mock se não houver dados
            const mockData = {
                total_leads: 1250,
                leads_convertidos: 340,
                taxa_conversao: 27.2,
                receita_total: 125000.50,
                automacoes_ativas: 12,
                updated_at: new Date().toISOString()
            };

            console.log('🎭 Usando dados mock para KPIs:', mockData);
            return {
                success: true,
                data: mockData,
                mock: true
            };

        } catch (error) {
            console.error('Erro ao carregar KPIs:', error);
            
            // Dados de fallback
            return {
                success: false,
                error: error.message,
                data: {
                    total_leads: 0,
                    leads_convertidos: 0,
                    taxa_conversao: 0,
                    receita_total: 0,
                    automacoes_ativas: 0,
                    updated_at: new Date().toISOString()
                }
            };
        }
    }

    // Função para obter leads
    async getLeads(limit = 50) {
        try {
            console.log('🔄 Carregando leads...');
            
            const { data, error } = await this.client
                .from('leads_crm')
                .select(`
                    id,
                    nome,
                    email,
                    telefone,
                    status,
                    fonte,
                    valor_potencial,
                    created_at,
                    updated_at
                `)
                .eq('org_id', this.orgId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            console.log('✅ Leads carregados:', data?.length || 0);
            return {
                success: true,
                data: data || [],
                count: data?.length || 0
            };

        } catch (error) {
            console.error('Erro ao carregar leads:', error);
            return {
                success: false,
                error: error.message,
                data: [],
                count: 0
            };
        }
    }

    // Função para obter automações
    async getAutomations() {
        try {
            console.log('🔄 Carregando automações...');
            
            const { data, error } = await this.client
                .from('automation_rules')
                .select(`
                    id,
                    name,
                    description,
                    trigger_event,
                    conditions,
                    actions,
                    is_active,
                    execution_count,
                    last_execution,
                    created_at
                `)
                .eq('org_id', this.orgId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log('✅ Automações carregadas:', data?.length || 0);
            return {
                success: true,
                data: data || [],
                count: data?.length || 0
            };

        } catch (error) {
            console.error('Erro ao carregar automações:', error);
            return {
                success: false,
                error: error.message,
                data: [],
                count: 0
            };
        }
    }

    // Função para salvar configurações
    async saveSettings(settings) {
        try {
            console.log('💾 Salvando configurações...');
            
            const { data, error } = await this.client
                .from('organization_settings')
                .upsert({
                    org_id: this.orgId,
                    settings: settings,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;

            console.log('✅ Configurações salvas');
            return {
                success: true,
                message: 'Configurações salvas com sucesso'
            };

        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Expor cliente Supabase nativo para funções avançadas
    get supabase() {
        return this.client;
    }

    // Função de logout
    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            console.log('👋 Usuário deslogado');
            return { success: true };
            
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            return { success: false, error: error.message };
        }
    }
}

// Criar instância global
const alshamSupabase = new AlshamSupabase();

// Expor no window para compatibilidade
window.AlshamSupabase = alshamSupabase;

// Também expor funções individuais para facilidade de uso
window.getCurrentUser = () => alshamSupabase.getCurrentUser();
window.getDashboardKPIs = () => alshamSupabase.getDashboardKPIs();
window.getLeads = (limit) => alshamSupabase.getLeads(limit);
window.getAutomations = () => alshamSupabase.getAutomations();

// Log de inicialização
console.log('🚀 AlshamSupabase v9.3 disponível globalmente!');
console.log('📋 Funções disponíveis:', {
    'getCurrentUser()': 'Buscar usuário atual',
    'getDashboardKPIs()': 'Buscar KPIs do dashboard', 
    'getLeads()': 'Buscar leads',
    'getAutomations()': 'Buscar automações',
    'AlshamSupabase': 'Objeto principal com todas as funções'
});

export default alshamSupabase;
