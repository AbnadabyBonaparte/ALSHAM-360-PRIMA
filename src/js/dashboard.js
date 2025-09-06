// ALSHAM 360° PRIMA - O Rosto e Corpo do Dashboard
// Este arquivo controla a interface, pedindo os dados ao "cérebro" (supabase.js)

import { 
    getCurrentUser,
    DEFAULT_ORG_ID,
    getDashboardKPIs
} from '../lib/supabase.js';

// Estado da aplicação (apenas o que a tela precisa saber)
let appState = {
    user: null,
    profile: null,
    orgId: DEFAULT_ORG_ID,
    data: {
        kpis: null,
    }
};

document.addEventListener('DOMContentLoaded', initializeAdvancedApp);

async function initializeAdvancedApp() {
    try {
        console.log('🚀 Iniciando Dashboard...');
        
        const authResult = await getCurrentUser();
        if (!authResult.user) {
            console.log('❌ Usuário não autenticado. Redirecionando para login.');
            window.location.href = '/src/pages/login.html';
            return;
        }
        
        appState.user = authResult.user;
        appState.profile = authResult.profile;
        appState.orgId = authResult.profile?.org_id || DEFAULT_ORG_ID;
        
        console.log(`✅ Usuário autenticado: ${appState.user.email}`);
        
        await loadAllDashboardData();
        
        console.log('✨ Dashboard carregado com dados reais!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização do Dashboard:', error);
        // Se a carga real falhar, mostramos dados de emergência (demo)
        await loadDemoData();
    }
}

async function loadAllDashboardData() {
    console.log('📊 Carregando dados REAIS do dashboard...');
    const { data: kpisData, error } = await getDashboardKPIs(appState.orgId);
    
    if (error) {
        console.error("Falha ao carregar KPIs reais, usando fallback.", error);
        await loadDemoData();
        return;
    }

    appState.data.kpis = kpisData;
    
    // Simples fallback para dados de gamificação
    appState.data.gamificacao = {
        perfil: { level: appState.profile?.level || 1 },
        progressao: { streak_atual: appState.profile?.streak || 0 }
    };
    
    renderAdvancedDashboard();
}

async function loadDemoData() {
    console.log('📋 Usando dados de demonstração como fallback.');
    appState.data = {
        kpis: {
            total_leads: 0,
            leads_convertidos: 0,
            receita_total: 0,
            score_media_ia: 0,
            receita_fechada: 0,
        },
        gamificacao: { perfil: { level: 1 }, progressao: { streak_atual: 0 } },
    };
    renderAdvancedDashboard();
}

function renderAdvancedDashboard() {
    renderAdvancedHeroSection();
    renderAdvancedKPIs();
}

function renderAdvancedHeroSection() {
    const heroContainer = document.querySelector('.bg-gradient-hero')?.parentElement;
    if (!heroContainer || !appState.data.kpis) return;
    
    const kpis = appState.data.kpis;
    const userName = appState.profile?.full_name || 'Usuário';
    const level = appState.data.gamificacao?.perfil?.level;
    
    heroContainer.querySelector('.bg-gradient-hero').innerHTML = `
        <div class="relative z-10">
            <h2 class="text-3xl font-bold mb-2 text-white">${getTimeBasedGreeting()}, ${userName}!</h2>
            <p class="text-xl mb-4 text-white">Você gerou <span class="font-bold text-yellow-300">R$ ${formatCurrency(kpis.receita_fechada)}</span> este mês.</p>
            <div class="flex items-center space-x-6 text-sm text-white">
                <div class="flex items-center space-x-2"><span>🏆</span><span>Level ${level}: ${getLevelTitle(level)}</span></div>
                <div class="flex items-center space-x-2"><span>🔥</span><span>Streak: ${appState.data.gamificacao?.progressao?.streak_atual || 0} dias</span></div>
            </div>
        </div>`;
}

function renderAdvancedKPIs() {
    const kpisContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    if (!kpisContainer || !appState.data.kpis) return;
    
    const kpis = appState.data.kpis;
    
    kpisContainer.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-2xl font-bold text-gray-900">${formatNumber(kpis.total_leads)}</h3>
            <p class="text-gray-600 font-medium">Leads Ativos</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-2xl font-bold text-gray-900">${formatNumber(kpis.leads_convertidos)}</h3>
            <p class="text-gray-600 font-medium">Conversões</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-2xl font-bold text-gray-900">${formatCurrency(kpis.receita_total)}</h3>
            <p class="text-gray-600 font-medium">Receita Total</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-2xl font-bold text-gray-900">${kpis.score_media_ia}/10</h3>
            <p class="text-gray-600 font-medium">Score IA Médio</p>
        </div>`;
}

// Funções Auxiliares
function formatCurrency(value) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0); }
function formatNumber(value) { return new Intl.NumberFormat('pt-BR').format(value || 0); }
function getTimeBasedGreeting() { const h = new Date().getHours(); if (h < 12) return 'Bom dia'; if (h < 18) return 'Boa tarde'; return 'Boa noite'; }
function getLevelTitle(level) { const t = { 1: 'Iniciante', 7: 'Legend' }; return t[level] || `Level ${level}`; }

