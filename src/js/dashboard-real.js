# 📜 DIRETRIZES CIRÚRGICAS DE ATUAÇÃO - GUARDIÃO DE CÓDIGO ENTERPRISE

**SOBRE VOCÊ (IA):**
Você é um Arquiteto de Software Sênior e especialista em código de padrão "Enterprise Grade", seguindo a filosofia "NASA 10/10". Sua especialidade é realizar **intervenções cirúrgicas no código**. Sua missão é analisar o código que eu fornecer, identificar o problema específico que eu descrever e propor a **mínima alteração possível** para resolvê-lo, sempre respeitando e, se possível, elevando a arquitetura e a complexidade valiosa já existente.

**SEU OBJETIVO PRINCIPAL:**
Resolver o *problema exato* que eu descrever, fazendo a menor e mais precisa alteração para corrigir, sem refatorar ou otimizar o que não foi solicitado.

---

### 🚨 REGRAS OBRIGATÓRIAS E INQUEBRÁVEIS (SEM EXCEÇÕES):

1.  **🎯 FOCO CIRÚRGICO:** Sua única prioridade é resolver o problema que eu descrevi. Modificações que não estão diretamente relacionadas ao problema só devem ser sugeridas se corrigirem uma falha crítica de segurança ou performance que seja evidente.

2.  ** intervent minimalism MÍNIMA INTERVENÇÃO:** Faça a **menor alteração possível** para corrigir o problema. O objetivo é consertar, não refatorar.

3.  **🚫 PROIBIDO SIMPLIFICAR OU REESTRUTURAR:** A arquitetura, design patterns e a complexidade existente são INTENCIONAIS e de alto valor. Você está estritamente proibido de remover, reestruturar ou simplificar código apenas para torná-lo "menor" ou "mais simples". A remoção de qualquer linha só é permitida se ela for a causa *direta* do problema, um bug, uma vulnerabilidade de segurança ou código morto (inutilizado).

4.  **🔒 MANTER A ARQUITETURA E O CONTEXTO ORIGINAL:** A estrutura e as tecnologias utilizadas são intencionais. Mantenha as variáveis, funções e estruturas existentes. Não introduza novas abstrações, conceitos ou substitua tecnologias (ex: não troque `Supabase` por outra coisa) a menos que seja estritamente necessário para a correção.

5.  **📈 JUSTIFICATIVA TÉCNICA OBRIGATÓRIA:** Para cada linha alterada ou adicionada, você deve fornecer uma explicação clara e técnica, no formato "antes e depois", explicando **POR QUE** a sua sugestão é necessária e superior, e como ela se alinha com os padrões "Enterprise Grade", baseando-se em um ou mais dos seguintes pilares:
    * **Correção:** A mudança resolve diretamente o bug descrito.
    * **Segurança:** A mudança corrige uma vulnerabilidade.
    * **Performance:** A mudança otimiza um gargalo de performance relacionado ao problema.
    * **Escalabilidade:** A mudança prepara o código para suportar mais carga, resolvendo o problema atual.

---

**MINHA SOLICITAÇÃO:**

**1. Problema a ser resolvido:**
O método `getDashboardKPIs` na classe `DataManager` atualmente busca todos os leads e todas as oportunidades de venda para então calcular os KPIs no lado do cliente. Isso é ineficiente e não escala bem. Se uma das buscas falhar (`getLeads` ou `getSalesOpportunities`), a função inteira quebra e o dashboard não carrega.

**Preciso de uma correção que:**
1.  Torne o cálculo de KPIs mais resiliente a falhas parciais (se uma consulta falhar, as outras ainda devem funcionar).
2.  Otimize a performance transferindo o cálculo dos KPIs para o backend, utilizando uma única chamada a uma `Stored Procedure` ou `Function` do Supabase (RPC). A função deve ser projetada para receber o `org_id` como parâmetro e retornar diretamente o objeto de KPIs.

**Importante:** A estrutura da classe `DataManager` e o fluxo de chamada existente em `DashboardApp` devem ser mantidos. Apenas o *interior* do método `getDashboardKPIs` deve ser modificado para chamar a nova função RPC, e você deve fornecer o código SQL para criar essa função no Supabase.

**2. Meu Código:**
```javascript
/**
 * ALSHAM 360° PRIMA - Integração Real com Supabase
 * Correção completa para dados reais e navegação funcional
 * * @version 6.0.0 - REAL DATA INTEGRATION
 * @author ALSHAM Development Team
 */

// ===== CONFIGURAÇÃO REAL DO SUPABASE =====
import { createClient } from '@supabase/supabase-js';

// IMPORTANTE: Substitua pelas suas credenciais reais do Supabase
const supabaseUrl = '[https://your-project-ref.supabase.co](https://your-project-ref.supabase.co)'; // Sua URL do Supabase
const supabaseKey = 'your-anon-key'; // Sua chave anônima do Supabase

// Verificação de segurança das credenciais
if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon')) {
    console.error('🚨 ERRO: Configure suas credenciais reais do Supabase!');
    console.error('1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)');
    console.error('2. Vá para Settings > API');
    console.error('3. Copie Project URL e anon/public key');
    console.error('4. Substitua as constantes supabaseUrl e supabaseKey');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// ===== SISTEMA DE AUTENTICAÇÃO REAL =====
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentProfile = null;
        this.isAuthenticated = false;
    }

    async checkAuth() {
        try {
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

            if (profileError) {
                console.error('Erro ao buscar perfil:', profileError);
                // Criar perfil se não existir
                await this.createUserProfile(session.user);
            } else {
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
                org_id: 'default-org', // Ou lógica para determinar organização
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
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    async getLeads(limit = 100) {
        try {
            if (!this.auth.isAuthenticated) {
                throw new Error('Usuário não autenticado');
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

            console.log(`✅ ${data.length} leads carregados da tabela 'leads'`);
            return { success: true, data: data || [] };

        } catch (error) {
            console.error('❌ Erro ao carregar leads:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    async getSalesOpportunities() {
        try {
            if (!this.auth.isAuthenticated) {
                throw new Error('Usuário não autenticado');
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

            console.log(`✅ ${data.length} oportunidades carregadas da tabela 'sales_opportunities'`);
            return { success: true, data: data || [] };

        } catch (error) {
            console.error('❌ Erro ao carregar oportunidades:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    async getDashboardKPIs() {
        try {
            if (!this.auth.isAuthenticated) {
                throw new Error('Usuário não autenticado');
            }

            const orgId = this.auth.currentProfile?.org_id;
            
            // Buscar KPIs calculados ou usar dados das tabelas principais
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

    async createLead(leadData) {
        try {
            if (!this.auth.isAuthenticated) {
                throw new Error('Usuário não autenticado');
            }

            const dataToInsert = {
                ...leadData,
                org_id: this.auth.currentProfile?.org_id,
                assigned_to: this.auth.currentUser.id,
                created_at: new Date().toISOString(),
                status: leadData.status || 'new'
            };

            const { data, error } = await supabase
                .from('leads')
                .insert(dataToInsert)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Lead criado:', data);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Erro ao criar lead:', error);
            return { success: false, error: error.message };
        }
    }

    async updateLead(leadId, updates) {
        try {
            if (!this.auth.isAuthenticated) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await supabase
                .from('leads')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', leadId)
                .eq('org_id', this.auth.currentProfile?.org_id)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Lead atualizado:', data);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Erro ao atualizar lead:', error);
            return { success: false, error: error.message };
        }
    }
}

// ===== SISTEMA DE NAVEGAÇÃO REAL =====
class NavigationManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Interceptar cliques em links de navegação
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            }
        });

        // Interceptar navegação do navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
        });
    }

    navigateTo(page, pushState = true) {
        try {
            console.log(`🔄 Navegando para: ${page}`);
            
            // Validar página
            const validPages = ['dashboard', 'leads', 'automacoes', 'relatorios', 'gamificacao', 'configuracoes'];
            if (!validPages.includes(page)) {
                console.warn(`⚠️ Página inválida: ${page}`);
                return;
            }

            // Atualizar URL do navegador
            if (pushState) {
                const newUrl = page === 'dashboard' ? '/' : `/${page}.html`;
                window.history.pushState({ page }, '', newUrl);
            }

            // Carregar página
            this.loadPage(page);
            
        } catch (error) {
            console.error('❌ Erro na navegação:', error);
        }
    }

    async loadPage(page, updateHistory = true) {
        try {
            this.currentPage = page;
            
            // Atualizar navegação ativa
            this.updateActiveNavigation(page);
            
            // Carregar conteúdo da página
            switch (page) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'leads':
                    await this.loadLeads();
                    break;
                case 'automacoes':
                    await this.loadAutomacoes();
                    break;
                case 'relatorios':
                    await this.loadRelatorios();
                    break;
                case 'gamificacao':
                    await this.loadGamificacao();
                    break;
                case 'configuracoes':
                    await this.loadConfiguracoes();
                    break;
                default:
                    console.warn(`Página não implementada: ${page}`);
            }
            
        } catch (error) {
            console.error(`❌ Erro ao carregar página ${page}:`, error);
            this.showError(`Erro ao carregar ${page}`);
        }
    }

    updateActiveNavigation(activePage) {
        // Remover classe ativa de todos os links
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.remove('text-primary', 'font-semibold');
            link.classList.add('text-gray-600');
        });

        // Adicionar classe ativa ao link atual
        const activeLink = document.querySelector(`[data-page="${activePage}"]`);
        if (activeLink) {
            activeLink.classList.remove('text-gray-600');
            activeLink.classList.add('text-primary', 'font-semibold');
        }
    }

    async loadDashboard() {
        try {
            // Já estamos no dashboard, apenas atualizar dados
            if (window.dashboardApp) {
                await window.dashboardApp.refresh();
            }
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    }

    async loadLeads() {
        try {
            // Redirecionar para página de leads real
            window.location.href = '/leads.html';
        } catch (error) {
            console.error('Erro ao carregar leads:', error);
        }
    }

    async loadAutomacoes() {
        window.location.href = '/automacoes.html';
    }

    async loadRelatorios() {
        window.location.href = '/relatorios.html';
    }

    async loadGamificacao() {
        window.location.href = '/gamificacao.html';
    }

    async loadConfiguracoes() {
        window.location.href = '/configuracoes.html';
    }

    showError(message) {
        // Implementar notificação de erro
        console.error(message);
        alert(message);
    }
}

// ===== DASHBOARD REAL INTEGRADO =====
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
            console.log('🚀 Inicializando ALSHAM 360° PRIMA com dados reais...');
            
            this.showLoading(true, 'Verificando autenticação...');
            
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
            this.setupRealTimeUpdates();
            this.setupAutoRefresh();
            
            this.showLoading(false);
            this.showNotification('Dashboard carregado com dados reais do Supabase!', 'success');
            
            console.log('✅ ALSHAM 360° PRIMA inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro crítico na inicialização:', error);
            this.showLoading(false);
            this.showNotification('Erro ao carregar dashboard: ' + error.message, 'error');
        }
    }

    async loadRealData() {
        try {
            this.state.isLoading = true;
            console.log('📊 Carregando dados reais do Supabase...');
            
            // Carregar dados em paralelo
            const [kpisResult, leadsResult, opportunitiesResult] = await Promise.all([
                this.data.getDashboardKPIs(),
                this.data.getLeads(),
                this.data.getSalesOpportunities()
            ]);

            // Atualizar state
            this.state.kpis = kpisResult.success ? kpisResult.data : {};
            this.state.leads = leadsResult.success ? leadsResult.data : [];
            this.state.opportunities = opportunitiesResult.success ? opportunitiesResult.data : [];
            this.state.lastUpdate = new Date();

            console.log('✅ Dados reais carregados:', {
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
            console.log('🎨 Renderizando dashboard com dados reais...');
            
            // Renderizar KPIs
            this.renderKPIs();
            
            // Renderizar leads recentes
            this.renderRecentLeads();
            
            // Renderizar hero section
            this.renderHeroSection();
            
            // Renderizar funil
            this.renderSalesFunnel();
            
            console.log('✅ Dashboard renderizado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao renderizar dashboard:', error);
        }
    }

    renderKPIs() {
        try {
            const kpisContainer = document.getElementById('dashboard-kpis');
            if (!kpisContainer) return;

            const { kpis } = this.state;
            
            kpisContainer.innerHTML = `
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <span class="text-blue-600 text-xl">👥</span>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-gray-900">${kpis.totalLeads || 0}</div>
                            <div class="text-sm text-gray-500">Total de Leads</div>
                        </div>
                    </div>
                    <div class="text-sm">
                        <span class="text-green-600">+${kpis.newLeadsToday || 0}</span> novos hoje
                    </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                            <span class="text-green-600 text-xl">💰</span>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-gray-900">R$ ${(kpis.totalRevenue || 0).toLocaleString('pt-BR')}</div>
                            <div class="text-sm text-gray-500">Receita Total</div>
                        </div>
                    </div>
                    <div class="text-sm">
                        Ticket médio: <strong>R$ ${parseFloat(kpis.avgDealSize || 0).toLocaleString('pt-BR')}</strong>
                    </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                            <span class="text-purple-600 text-xl">📈</span>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-gray-900">${kpis.conversionRate || 0}%</div>
                            <div class="text-sm text-gray-500">Taxa de Conversão</div>
                        </div>
                    </div>
                    <div class="text-sm">
                        ${kpis.activeOpportunities || 0} oportunidades ativas
                    </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                            <span class="text-orange-600 text-xl">📅</span>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-gray-900">${kpis.leadsThisMonth || 0}</div>
                            <div class="text-sm text-gray-500">Leads Este Mês</div>
                        </div>
                    </div>
                    <div class="text-sm">
                        Meta mensal em andamento
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('❌ Erro ao renderizar KPIs:', error);
        }
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

            const leadsHTML = recentLeads.map(lead => `
                <div class="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span class="text-gray-600 font-semibold text-sm">${this.getInitials(lead.name)}</span>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${lead.name}</div>
                            <div class="text-sm text-gray-500">${lead.email}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getStatusColor(lead.status)}">
                            ${this.getStatusLabel(lead.status)}
                        </div>
                        <div class="text-xs text-gray-500 mt-1">${this.formatDate(lead.created_at)}</div>
                    </div>
                </div>
            `).join('');

            leadsContainer.innerHTML = leadsHTML;

        } catch (error) {
            console.error('❌ Erro ao renderizar leads:', error);
        }
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
            console.error('❌ Erro ao renderizar hero section:', error);
        }
    }

    renderSalesFunnel() {
        try {
            // Implementar renderização do funil baseado nos dados reais
            console.log('Renderizando funil de vendas com dados reais...');
        } catch (error) {
            console.error('❌ Erro ao renderizar funil:', error);
        }
    }

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

    setupRealTimeUpdates() {
        try {
            // Configurar subscriptions para atualizações em tempo real
            const orgId = this.auth.currentProfile?.org_id;
            
            if (!orgId) return;

            // Subscribe to leads changes
            const leadsSubscription = supabase
                .channel('leads_changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'leads',
                    filter: `org_id=eq.${orgId}`
                }, (payload) => {
                    console.log('🔄 Atualização real-time de leads:', payload);
                    this.handleLeadsUpdate(payload);
                })
                .subscribe();

            console.log('✅ Real-time subscriptions configuradas');

        } catch (error) {
            console.error('❌ Erro ao configurar real-time updates:', error);
        }
    }

    async handleLeadsUpdate(payload) {
        try {
            // Recarregar dados quando houver alterações
            await this.loadRealData();
            await this.renderDashboard();
            
            this.showNotification('Dados atualizados em tempo real!', 'info');
            
        } catch (error) {
            console.error('Erro ao processar atualização real-time:', error);
        }
    }

    setupAutoRefresh() {
        try {
            // Atualizar dados a cada 5 minutos
            setInterval(async () => {
                if (!document.hidden) { // Só atualizar se a página estiver visível
                    await this.refresh();
                }
            }, 5 * 60 * 1000); // 5 minutos

            console.log('Atualização automática configurada (5min)');

        } catch (error) {
            console.error('Erro ao configurar atualização automática:', error);
        }
    }

    async refresh() {
        try {
            console.log('Atualizando dashboard...');
            await this.loadRealData();
            await this.renderDashboard();
            console.log('Dashboard atualizado');
        } catch (error) {
            console.error('Erro ao atualizar dashboard:', error);
        }
    }

    // Métodos de notificação
    showLoading(show, message = 'Carregando...') {
        let loadingElement = document.getElementById('loading-indicator');
        
        if (show) {
            if (!loadingElement) {
                loadingElement = document.createElement('div');
                loadingElement.id = 'loading-indicator';
                loadingElement.className = 'fixed top-0 left-0 w-full h-1 bg-blue-600 z-50';
                loadingElement.innerHTML = '<div class="h-full bg-blue-600 animate-pulse"></div>';
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
        // Remove notificações existentes
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300 ${this.getNotificationClasses(type)}`;
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    ${this.getNotificationIcon(type)}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="flex-shrink-0 text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remover
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
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

    getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return '<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
            case 'error':
                return '<svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
            case 'warning':
                return '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
            default:
                return '<svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
        }
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let dashboardApp = null;

document.addEventListener('DOMContentLoaded', async function() {
    try {
        dashboardApp = new DashboardApp();
        window.dashboardApp = dashboardApp; // Para acesso global
        
        await dashboardApp.init();
        
    } catch (error) {
        console.error('❌ Erro fatal na inicialização:', error);
    }
});
```
