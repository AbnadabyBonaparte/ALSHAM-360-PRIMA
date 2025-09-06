// ALSHAM 360° PRIMA - Dashboard OBRA-PRIMA COMPLETO v2.0

// Este arquivo foi movido para seu local correto: src/js/dashboard.js



// NOTA: Este código é uma obra de arte, mas depende de funções que ainda não implementamos 100%

// no supabase.js (getDashboardKPIs, etc). Ele servirá como nosso alvo final.

// Por enquanto, ele usará dados de demonstração.



import { 

    getCurrentUser,

    DEFAULT_ORG_ID 

} from '../lib/supabase.js';



// Estado global avançado

let appState = {

    user: null,

    profile: null,

    orgId: DEFAULT_ORG_ID,

    data: {

        kpis: null,

    },

    ui: {

        loading: false,

    }

};



document.addEventListener('DOMContentLoaded', async function() {

    console.log('🚀 ALSHAM 360° PRIMA - Iniciando Dashboard OBRA-PRIMA v2.0...');

    await initializeAdvancedApp();

});



// ===== INICIALIZAÇÃO AVANÇADA =====

async function initializeAdvancedApp() {

    try {

        showLoadingScreen();

        

        const authResult = await getCurrentUser();

        

        if (!authResult.user) {

            console.log('❌ Usuário não autenticado, carregando dados demo');

            await loadDemoData();

            hideLoadingScreen();

            return;

        }

        

        appState.user = authResult.user;

        appState.profile = authResult.profile;

        appState.orgId = authResult.profile?.org_id || DEFAULT_ORG_ID;

        

        console.log(`✅ Usuário autenticado: ${authResult.user.email}`);

        console.log(`🏢 Organização: ${appState.orgId}`);

        

        await loadAllDashboardData();

        

        hideLoadingScreen();

        

        console.log('✨ Dashboard OBRA-PRIMA totalmente carregado!');

        

    } catch (error) {

        console.error('❌ Erro na inicialização:', error);

        showErrorScreen('Erro ao carregar dashboard', error.message);

    }

}



async function loadAllDashboardData() {

    appState.ui.loading = true;

    try {

        console.log('📊 Carregando dados do dashboard (usando demo por enquanto)...');

        // Futuramente, chamaremos as funções reais aqui:

        // const kpisResult = await getDashboardKPIs(appState.orgId);

        // appState.data.kpis = kpisResult.data;

        await loadDemoData(); // Usando demo como fallback

        

        await renderAdvancedDashboard();



    } catch (error) {

        console.error('❌ Erro ao carregar dados:', error);

        await loadDemoData();

    } finally {

        appState.ui.loading = false;

    }

}



// ===== DADOS DEMO (FALLBACK) =====

async function loadDemoData() {

    console.log('📋 Carregando dados demo...');

    

    appState.data = {

        kpis: {

            total_leads: 1234,

            leads_quentes: 45,

            leads_mornos: 89,

            leads_frios: 1100,

            leads_convertidos: 67,

            taxa_conversao: 5.4,

            score_media_ia: 7.8,

            receita_total: 89000,

            receita_fechada: 67000,

            interacoes_semana: 234

        },

        gamificacao: {

            perfil: { level: 7, total_points: 2840 },

            progressao: { streak_atual: 12 },

        },

    };

    

    await renderAdvancedDashboard();

}



// ===== RENDERIZAÇÃO AVANÇADA =====

async function renderAdvancedDashboard() {

    try {

        await renderAdvancedHeroSection();

        await renderAdvancedKPIs();

    } catch (error) {

        console.error('❌ Erro na renderização:', error);

    }

}



// ===== HERO SECTION AVANÇADA =====

async function renderAdvancedHeroSection() {

    const heroContainer = document.querySelector('.bg-gradient-hero')?.parentElement;

    if (!heroContainer || !appState.data.kpis) return;

    

    const kpis = appState.data.kpis;

    const userName = appState.profile?.full_name || 'Usuário';

    const level = appState.data.gamificacao?.perfil?.level || 1;

    

    heroContainer.querySelector('.bg-gradient-hero').innerHTML = `

        <div class="relative z-10">

            <h2 class="text-3xl font-bold mb-2 text-white">

                ${getTimeBasedGreeting()}, ${userName}!

            </h2>

            <p class="text-xl mb-4 text-white">

                Você gerou <span class="font-bold text-yellow-300 animate-pulse">R$ ${formatCurrency(kpis.receita_fechada)}</span> este mês.

            </p>

             <div class="flex items-center space-x-6 text-sm text-white">

                <div class="flex items-center space-x-2">

                    <span class="text-yellow-300">🏆</span>

                    <span>Level ${level}: ${getLevelTitle(level)}</span>

                </div>

                <div class="flex items-center space-x-2">

                    <span class="text-blue-300">🔥</span>

                    <span>Streak: ${appState.data.gamificacao?.progressao?.streak_atual || 0} dias</span>

                </div>

            </div>

        </div>

    `;

}



// ===== KPIS SUPER AVANÇADOS =====

async function renderAdvancedKPIs() {

    const kpisContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');

    if (!kpisContainer || !appState.data.kpis) return;

    

    const kpis = appState.data.kpis;

    

    kpisContainer.innerHTML = `

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

            <h3 class="text-2xl font-bold text-gray-900">${formatNumber(kpis.total_leads || 0)}</h3>

            <p class="text-gray-600 font-medium">Leads Ativos</p>

        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

            <h3 class="text-2xl font-bold text-gray-900">${formatNumber(kpis.leads_convertidos || 0)}</h3>

            <p class="text-gray-600 font-medium">Conversões</p>

        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

            <h3 class="text-2xl font-bold text-gray-900">R$ ${formatCurrency(kpis.receita_total || 0)}</h3>

            <p class="text-gray-600 font-medium">Receita Total</p>

        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

             <h3 class="text-2xl font-bold text-gray-900">${kpis.score_media_ia || 0}/10</h3>

            <p class="text-gray-600 font-medium">Score IA Médio</p>

        </div>

    `;

}



// ===== FUNÇÕES AUXILIARES =====

function formatCurrency(value) {

    return new Intl.NumberFormat('pt-BR').format(value || 0);

}



function formatNumber(value) {

    return new Intl.NumberFormat('pt-BR').format(value || 0);

}



function getTimeBasedGreeting() {

    const hour = new Date().getHours();

    if (hour < 12) return 'Bom dia';

    if (hour < 18) return 'Boa tarde';

    return 'Boa noite';

}



function getLevelTitle(level) {

    const titles = { 1: 'Iniciante', 2: 'Vendedor Jr', 3: 'Vendedor', 4: 'Vendedor Sr', 5: 'Expert', 6: 'Master', 7: 'Legend' };

    return titles[level] || `Level ${level}`;

}



function showLoadingScreen() { console.log('🔄 Mostrando tela de carregamento...'); }

function hideLoadingScreen() { console.log('✅ Ocultando tela de carregamento...'); }

function showErrorScreen(title, message) { console.error(`❌ ${title}: ${message}`); }



console.log('✨ Dashboard OBRA-PRIMA v2.0 COMPLETO carregado!');
