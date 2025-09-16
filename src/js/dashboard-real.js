/**
 * ALSHAM 360° PRIMA - Integração Real com Supabase
 * Versão corrigida para build sem erros
 * 
 * @version 6.1.0 - BUILD COMPATIBLE
 * @author ALSHAM Development Team
 */

// ===== CONFIGURAÇÃO REAL DO SUPABASE =====
const SUPABASE_CONFIG = {
    // SUBSTITUA pelas suas credenciais reais do Supabase
    url: 'https://your-project-ref.supabase.co',
    key: 'your-anon-key'
};

// Validação das credenciais
if (SUPABASE_CONFIG.url.includes('your-project') || SUPABASE_CONFIG.key.includes('your-anon')) {
    console.error('🚨 Configure suas credenciais reais do Supabase!');
}

// Inicializar cliente Supabase
let supabase = null;
try {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
    }
} catch (error) {
    console.error('Erro ao inicializar Supabase:', error);
}

// ===== SISTEMA DE AUTENTICAÇÃO REAL =====
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentProfile = null;
        this.isAuthenticated = false;
    }

    async checkAuth() {
        try {
            if (!supabase) {
                throw new Error('Supabase não inicializado');
            }

            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Erro ao verificar sessão:', error);
                return { authenticated: false, error };
            }

            if (!session || !session.user) {
                console.log('Usuário não autenticado');
                return { authenticated: false };
            }

            this.currentUser = session.user;
            this.isAuthenticated = true;

            // Buscar perfil do usuário
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Erro ao buscar perfil:', profileError);
                await this.createUserProfile(session.user);
            } else if (profile) {
                this.currentProfile = profile;
            }

            return { 
                authenticated: true, 
                user: this.currentUser, 
                profile: this.currentProfile 
            };

        } catch (error) {
            console.error('Erro crítico na autenticação:', error);
            return { authenticated: false, error: error.message };
        }
    }

    async createUserProfile(user) {
        try {
            const profileData = {
                user_id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url,
                org_id: 'default-org',
                role: 'user',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('user_profiles')
                .insert(profileData)
                .select()
                .single();

            if (error) throw error;

            this.currentProfile = data;
            console.log('✅ Perfil de usuário criado:', data);
            return data;

        } catch (error) {
            console.error('Erro ao criar perfil:', error);
            return null;
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.currentProfile = null;
            this.isAuthenticated = false;
            
            window.location.href = '/login.html';
            return { success: true };

        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            return { success: false, error: error.message };
        }
    }
}

// ===== SISTEMA DE DADOS REAIS =====
class DataManager {
    constructor(authManager) {
        this.auth = authManager;
    }

    async getLeads(limit = 100) {
        try {
            if (!this.auth.isAuthenticated || !supabase) {
                throw new Error('Usuário não autenticado ou Supabase não disponível');
            }

            const orgId = this.auth.currentProfile?.org_id;
            if (!orgId) {
                throw new Error('Organização não identificada');
            }

            const { data, error } = await supabase
                .from('leads')
                .select(`
                    id,
                    name,
                    email,
                    phone,
                    status,
                    source,
                    created_at,
                    updated_at,
                    org_id,
                    assigned_to
                `)
                .eq('org_id', orgId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            console.log(`✅ ${(data || []).length} leads carregados`);
            return { success: true, data: data || [] };

        } catch (error) {
            console.error('❌ Erro ao carregar leads:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    async getSalesOpportunities() {
        try {
            if (!this.auth.isAuthenticated || !supabase) {
                throw new Error('Usuário não autenticado ou Supabase não disponível');
            }

            const orgId = this.auth.currentProfile?.org_id;
            
            const { data, error } = await supabase
                .from('sales_opportunities')
                .select(`
                    id,
                    title,
                    value,
                    stage,
                    probability,
                    expected_close_date,
                    created_at,
                    org_id,
                    lead_id
                `)
                .eq('org_id', orgId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log(`✅ ${(data || []).length} oportunidades carregadas`);
            return { success: true, data: data || [] };

        } catch (error) {
            console.error('❌ Erro ao carregar oportunidades:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    async getDashboardKPIs() {
        try {
            const [leadsResult, opportunitiesResult] = await Promise.all([
                this.getLeads(1000),
                this.getSalesOpportunities()
            ]);

            const leads = leadsResult.data || [];
            const opportunities = opportunitiesResult.data || [];

            // Calcular KPIs reais
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const kpis = {
                totalLeads: leads.length,
                newLeadsToday: leads.filter(lead => new Date(lead.created_at) >= today).length,
                leadsThisMonth: leads.filter(lead => new Date(lead.created_at) >= thisMonth).length,
                activeOpportunities: opportunities.filter(opp => 
                    ['prospecting', 'qualification', 'proposal', 'negotiation'].includes(opp.stage)
                ).length,
                totalRevenue: opportunities
                    .filter(opp => opp.stage === 'closed_won')
                    .reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0),
                conversionRate: this.calculateConversionRate(leads),
                avgDealSize: this.calculateAvgDealSize(opportunities)
            };

            console.log('✅ KPIs calculados:', kpis);
            return { success: true, data: kpis };

        } catch (error) {
            console.error('❌ Erro ao calcular KPIs:', error);
            return { success: false, error: error.message, data: {} };
        }
    }

    calculateConversionRate(leads) {
        if (!leads || leads.length === 0) return 0;
        
        const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
        const qualifiedLeads = leads.filter(lead => 
            ['qualified', 'proposal', 'negotiation', 'converted', 'lost'].includes(lead.status)
        ).length;
        
        return qualifiedLeads > 0 ? ((convertedLeads / qualifiedLeads) * 100).toFixed(1) : 0;
    }

    calculateAvgDealSize(opportunities) {
        if (!opportunities || opportunities.length === 0) return 0;
        
        const closedWon = opportunities.filter(opp => opp.stage === 'closed_won');
        if (closedWon.length === 0) return 0;
        
        const totalRevenue = closedWon.reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0);
        return (totalRevenue / closedWon.length).toFixed(2);
    }
}

// ===== SISTEMA DE NAVEGAÇÃO =====
class NavigationManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            }
        });
    }

    navigateTo(page) {
        try {
            console.log(`🔄 Navegando para: ${page}`);
            
            const validPages = ['dashboard', 'leads', 'automacoes', 'relatorios', 'gamificacao', 'configuracoes'];
            if (!validPages.includes(page)) {
                console.warn(`⚠️ Página inválida: ${page}`);
                return;
            }

            if (page === 'dashboard') {
                window.location.href = '/';
            } else {
                window.location.href = `/${page}.html`;
            }
            
        } catch (error) {
            console.error('❌ Erro na navegação:', error);
        }
    }
}

// ===== DASHBOARD PRINCIPAL =====
class DashboardApp {
    constructor() {
        this.auth = new AuthManager();
        this.data = new DataManager(this.auth);
        this.navigation = new NavigationManager();
        this.state = {
            isLoading: false,
            kpis: {},
            leads: [],
            opportunities: [],
            lastUpdate: null
        };
    }

    async init() {
        try {
            console.log('🚀 Inicializando ALSHAM 360° PRIMA...');
            
            this.showLoading(true, 'Verificando autenticação...');
            
            // Verificar se Supabase está disponível
            if (!supabase) {
                throw new Error('Supabase não configurado. Configure suas credenciais.');
            }
            
            // Verificar autenticação
            const authResult = await this.auth.checkAuth();
            if (!authResult.authenticated) {
                console.log('❌ Usuário não autenticado, redirecionando...');
                window.location.href = '/login.html';
                return;
            }

            console.log('✅ Usuário autenticado:', authResult.user.email);
            this.updateUserInfo(authResult.user, authResult.profile);

            // Carregar dados reais
            await this.loadRealData();
            
            // Renderizar dashboard
            await this.renderDashboard();
            
            // Configurar atualizações
            this.setupAutoRefresh();
            
            this.showLoading(false);
            this.showNotification('Dashboard carregado com dados reais!', 'success');
            
            console.log('✅ ALSHAM 360° PRIMA inicializado');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.showLoading(false);
            this.showNotification('Erro: ' + error.message, 'error');
            this.loadDemoData();
        }
    }

    async loadRealData() {
        try {
            this.state.isLoading = true;
            console.log('📊 Carregando dados reais...');
            
            const [kpisResult, leadsResult, opportunitiesResult] = await Promise.all([
                this.data.getDashboardKPIs(),
                this.data.getLeads(),
                this.data.getSalesOpportunities()
            ]);

            this.state.kpis = kpisResult.success ? kpisResult.data : {};
            this.state.leads = leadsResult.success ? leadsResult.data : [];
            this.state.opportunities = opportunitiesResult.success ? opportunitiesResult.data : [];
            this.state.lastUpdate = new Date();

            console.log('✅ Dados carregados:', {
                kpis: Object.keys(this.state.kpis).length,
                leads: this.state.leads.length,
                opportunities: this.state.opportunities.length
            });

        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    async renderDashboard() {
        try {
            console.log('🎨 Renderizando dashboard...');
            
            this.renderKPIs();
            this.renderRecentLeads();
            this.renderHeroSection();
            
            console.log('✅ Dashboard renderizado');
            
        } catch (error) {
            console.error('❌ Erro ao renderizar:', error);
        }
    }

    renderKPIs() {
        try {
            const kpisContainer = document.getElementById('dashboard-kpis');
            if (!kpisContainer) return;

            const kpis = this.state.kpis;
            
            // Criar HTML usando createElement para evitar erros de parsing
            kpisContainer.innerHTML = '';
            
            const kpiData = [
                { icon: '👥', title: 'Total de Leads', value: kpis.totalLeads || 0, color: 'blue', extra: `+${kpis.newLeadsToday || 0} novos hoje` },
                { icon: '💰', title: 'Receita Total', value: `R$ ${(kpis.totalRevenue || 0).toLocaleString('pt-BR')}`, color: 'green', extra: `Ticket médio: R$ ${parseFloat(kpis.avgDealSize || 0).toLocaleString('pt-BR')}` },
                { icon: '📈', title: 'Taxa de Conversão', value: `${kpis.conversionRate || 0}%`, color: 'purple', extra: `${kpis.activeOpportunities || 0} oportunidades ativas` },
                { icon: '📅', title: 'Leads Este Mês', value: kpis.leadsThisMonth || 0, color: 'orange', extra: 'Meta mensal em andamento' }
            ];

            kpiData.forEach(kpi => {
                const kpiElement = this.createKPIElement(kpi);
                kpisContainer.appendChild(kpiElement);
            });

        } catch (error) {
            console.error('❌ Erro ao renderizar KPIs:', error);
        }
    }

    createKPIElement(kpi) {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-xl p-6 shadow-sm border border-gray-100';
        
        const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600'
        };
        
        div.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 ${colorClasses[kpi.color]} rounded-xl flex items-center justify-center">
                    <span class="text-xl">${kpi.icon}</span>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-gray-900">${kpi.value}</div>
                    <div class="text-sm text-gray-500">${kpi.title}</div>
                </div>
            </div>
            <div class="text-sm text-gray-600">${kpi.extra}</div>
        `;
        
        return div;
    }

    renderRecentLeads() {
        try {
            const leadsContainer = document.getElementById('leads-table');
            if (!leadsContainer) return;

            const recentLeads = this.state.leads.slice(0, 5);

            if (recentLeads.length === 0) {
                leadsContainer.innerHTML = `
                    <div class="text-center py-8">
                        <div class="text-gray-400 text-4xl mb-4">👥</div>
                        <p class="text-gray-500">Nenhum lead encontrado</p>
                        <button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" onclick="window.navigateTo('leads')">
                            Adicionar Primeiro Lead
                        </button>
                    </div>
                `;
                return;
            }

            leadsContainer.innerHTML = '';
            
            recentLeads.forEach(lead => {
                const leadElement = this.createLeadElement(lead);
                leadsContainer.appendChild(leadElement);
            });

        } catch (error) {
            console.error('❌ Erro ao renderizar leads:', error);
        }
    }

    createLeadElement(lead) {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors';
        
        const statusColor = this.getStatusColor(lead.status);
        const statusLabel = this.getStatusLabel(lead.status);
        const initials = this.getInitials(lead.name);
        const formattedDate = this.formatDate(lead.created_at);
        
        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span class="text-gray-600 font-semibold text-sm">${initials}</span>
                </div>
                <div>
                    <div class="font-medium text-gray-900">${lead.name}</div>
                    <div class="text-sm text-gray-500">${lead.email}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                    ${statusLabel}
                </div>
                <div class="text-xs text-gray-500 mt-1">${formattedDate}</div>
            </div>
        `;
        
        return div;
    }

    renderHeroSection() {
        try {
            const heroGreeting = document.getElementById('hero-greeting');
            const heroRevenue = document.getElementById('hero-revenue');
            
            if (heroGreeting) {
                const userName = this.auth.currentProfile?.full_name?.split(' ')[0] || 'Usuário';
                heroGreeting.textContent = `Parabéns, ${userName}!`;
            }
            
            if (heroRevenue) {
                const revenue = this.state.kpis.totalRevenue || 0;
                heroRevenue.textContent = `R$ ${revenue.toLocaleString('pt-BR')}`;
            }

        } catch (error) {
            console.error('❌ Erro ao renderizar hero:', error);
        }
    }

    updateUserInfo(user, profile) {
        try {
            const userInitials = document.getElementById('user-initials');
            const userName = document.getElementById('user-name');

            if (userInitials && profile?.full_name) {
                userInitials.textContent = this.getInitials(profile.full_name);
            }

            if (userName && profile?.full_name) {
                userName.textContent = profile.full_name;
            }

        } catch (error) {
            console.error('❌ Erro ao atualizar info do usuário:', error);
        }
    }

    setupAutoRefresh() {
        try {
            setInterval(async () => {
                if (!document.hidden) {
                    await this.refresh();
                }
            }, 5 * 60 * 1000); // 5 minutos

            console.log('⏰ Auto refresh configurado');

        } catch (error) {
            console.error('❌ Erro no auto refresh:', error);
        }
    }

    async refresh() {
        try {
            console.log('🔄 Atualizando dashboard...');
            await this.loadRealData();
            await this.renderDashboard();
            console.log('✅ Dashboard atualizado');
        } catch (error) {
            console.error('❌ Erro ao atualizar:', error);
        }
    }

    // Métodos auxiliares
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getStatusColor(status) {
        const colors = {
            new: 'bg-blue-100 text-blue-800',
            contacted: 'bg-yellow-100 text-yellow-800',
            qualified: 'bg-purple-100 text-purple-800',
            proposal: 'bg-orange-100 text-orange-800',
            converted: 'bg-green-100 text-green-800',
            lost: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusLabel(status) {
        const labels = {
            new: 'Novo',
            contacted: 'Contatado',
            qualified: 'Qualificado',
            proposal: 'Proposta',
            converted: 'Convertido',
            lost: 'Perdido'
        };
        return labels[status] || status;
    }

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return '-';
        }
    }

    // Sistema de notificações
    showLoading(show, message = 'Carregando...') {
        let loadingElement = document.getElementById('loading-indicator');
        
        if (show) {
            if (!loadingElement) {
                loadingElement = document.createElement('div');
                loadingElement.id = 'loading-indicator';
                loadingElement.className = 'fixed top-0 left-0 w-full h-1 bg-blue-600 z-50';
                document.body.appendChild(loadingElement);
            }
            loadingElement.classList.remove('hidden');
        } else {
            if (loadingElement) {
                loadingElement.classList.add('hidden');
            }
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${this.getNotificationClasses(type)}`;
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                    ✕
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    getNotificationClasses(type) {
        switch (type) {
            case 'success':
                return 'bg-green-50 border border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border border-yellow-200 text-yellow-800';
            default:
                return 'bg-blue-50 border border-blue-200 text-blue-800';
        }
    }

    // Dados demo como fallback
    loadDemoData() {
        console.log('📋 Carregando dados demo...');
        
        this.state.kpis = {
            totalLeads: 50,
            newLeadsToday: 3,
            conversionRate: 15.5,
            totalRevenue: 25000,
            activeOpportunities: 12,
            avgDealSize: 2500,
            leadsThisMonth: 18
        };
        
        this.state.leads = [
            {
                id: 1,
                name: 'João Silva',
                email: 'joao@email.com',
                status: 'new',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Maria Santos',
                email: 'maria@email.com',
                status: 'qualified',
                created_at: new Date().toISOString()
            }
        ];
        
        this.renderDashboard();
        this.showNotification('Sistema em modo demo - Configure o Supabase', 'warning');
    }
}

// ===== INICIALIZAÇÃO =====
let dashboardApp = null;

window.navigateTo = function(page) {
    if (dashboardApp && dashboardApp.navigation) {
        dashboardApp.navigation.navigateTo(page);
    } else {
        const baseUrl = window.location.origin;
        if (page === 'dashboard') {
            window.location.href = baseUrl + '/';
        } else {
            window.location.href = baseUrl + '/' + page + '.html';
        }
    }
};

window.logout = async function() {
    try {
        if (dashboardApp && dashboardApp.auth) {
            await dashboardApp.auth.signOut();
        } else {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Erro no logout:', error);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login.html';
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('🚀 Iniciando ALSHAM 360° PRIMA...');
        
        dashboardApp = new DashboardApp();
        window.dashboardApp = dashboardApp;
        
        await dashboardApp.init();
        
    } catch (error) {
        console.error('❌ Erro fatal:', error);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-red-50 flex items-center justify-center z-50';
        errorDiv.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                <div class="text-red-500 text-4xl mb-4">⚠️</div>
                <h2 class="text-xl font-bold text-gray-900 mb-4">Erro de Configuração</h2>
                <p class="text-gray-600 mb-6">${error.message}</p>
                <button onclick="window.location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Tentar Novamente
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});

console.log('📊 Dashboard System v6.1.0 - Build Compatible carregado!');
