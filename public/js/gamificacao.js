/**
 * ALSHAM 360° PRIMA - Sistema de Gamificação Simplificado V2.0
 * Versão otimizada compatível com fix-imports e navegação atual
 *
 * @version 2.0.0 - SIMPLIFICADO E FUNCIONAL
 * @author ALSHAM Development Team
 *
 * ✅ FUNCIONALIDADES:
 * - Sistema de pontos e níveis
 * - Badges e conquistas
 * - Leaderboard da equipe
 * - Atividades recentes
 * - Dados reais do Supabase
 * - Interface responsiva
 */
// ===== AGUARDAR DEPENDÊNCIAS =====
function initializeGamificationSystem() {
    // Aguardar fix-imports estar pronto
    if (typeof window.waitFor !== 'function') {
        console.log('⏳ Aguardando dependências...');
        setTimeout(initializeGamificationSystem, 500);
        return;
    }
    window.waitFor(
        () => window.AlshamSupabase && window.showAuthNotification,
        initializeGamification,
        { description: 'AlshamSupabase e fix-imports', timeout: 10000 }
    );
}
// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGamificationSystem);
} else {
    initializeGamificationSystem();
}
// ===== CONFIGURAÇÕES =====
const GAMIFICATION_CONFIG = {
    LEVELS: [
        { level: 1, name: 'Iniciante', minPoints: 0, maxPoints: 499, color: 'gray', icon: '🥚', multiplier: 1.0 },
        { level: 2, name: 'Aprendiz', minPoints: 500, maxPoints: 999, color: 'blue', icon: '🐣', multiplier: 1.1 },
        { level: 3, name: 'Vendedor', minPoints: 1000, maxPoints: 1999, color: 'green', icon: '🦅', multiplier: 1.2 },
        { level: 4, name: 'Especialista', minPoints: 2000, maxPoints: 3499, color: 'purple', icon: '🦉', multiplier: 1.3 },
        { level: 5, name: 'Expert', minPoints: 3500, maxPoints: 4999, color: 'orange', icon: '🔥', multiplier: 1.4 },
        { level: 6, name: 'Mestre', minPoints: 5000, maxPoints: 7499, color: 'red', icon: '⚡', multiplier: 1.5 },
        { level: 7, name: 'Lenda', minPoints: 7500, maxPoints: 9999, color: 'gold', icon: '👑', multiplier: 1.6 },
        { level: 8, name: 'Mítico', minPoints: 10000, maxPoints: 14999, color: 'diamond', icon: '💎', multiplier: 1.7 },
        { level: 9, name: 'Épico', minPoints: 15000, maxPoints: 24999, color: 'rainbow', icon: '🌟', multiplier: 1.8 },
        { level: 10, name: 'Lendário', minPoints: 25000, maxPoints: 999999, color: 'cosmic', icon: '🚀', multiplier: 2.0 }
    ],
    POINT_ACTIONS: {
        lead_created: { points: 10, description: 'Lead criado', category: 'sales' },
        lead_qualified: { points: 25, description: 'Lead qualificado', category: 'sales' },
        call_made: { points: 5, description: 'Ligação realizada', category: 'activity' },
        email_sent: { points: 3, description: 'Email enviado', category: 'communication' },
        deal_closed: { points: 100, description: 'Negócio fechado', category: 'sales' },
        meeting_scheduled: { points: 15, description: 'Reunião agendada', category: 'activity' },
        proposal_sent: { points: 20, description: 'Proposta enviada', category: 'sales' },
        follow_up_completed: { points: 8, description: 'Follow-up realizado', category: 'activity' },
        goal_achieved: { points: 50, description: 'Meta alcançada', category: 'achievement' },
        daily_login: { points: 2, description: 'Login diário', category: 'engagement' }
    },
    BADGE_TIERS: {
        bronze: { color: 'amber-600', multiplier: 1.0, icon: '🥉' },
        silver: { color: 'gray-400', multiplier: 1.2, icon: '🥈' },
        gold: { color: 'yellow-500', multiplier: 1.5, icon: '🥇' },
        platinum: { color: 'purple-500', multiplier: 2.0, icon: '💎' },
        legendary: { color: 'red-500', multiplier: 3.0, icon: '🏆' }
    }
};
// ===== ESTADO GLOBAL =====
const gamificationState = {
    user: null,
    orgId: null,
    userPoints: 0,
    userLevel: GAMIFICATION_CONFIG.LEVELS[0],
    userBadges: [],
    availableBadges: [],
    leaderboard: [],
    recentActivities: [],
    isLoading: false,
    lastUpdate: null
};
// ===== INICIALIZAÇÃO PRINCIPAL =====
async function initializeGamification() {
    try {
        console.log('🎮 Inicializando sistema de gamificação...');
       
        showLoading(true);
       
        // Verificar autenticação
        const authResult = await checkAuthentication();
        if (!authResult.success) {
            showError('Usuário não autenticado');
            redirectToLogin();
            return;
        }
        // Configurar estado inicial
        gamificationState.user = authResult.user;
        gamificationState.orgId = authResult.orgId;
        // Carregar dados de gamificação
        await loadGamificationData();
        // Renderizar interface
        renderGamificationInterface();
        // Configurar atualizações automáticas
        setupAutoRefresh();
        showLoading(false);
        console.log('✅ Sistema de gamificação inicializado com sucesso');
        window.showToast?.('Sistema de gamificação carregado!', 'success');
    } catch (error) {
        console.error('❌ Erro ao inicializar gamificação:', error);
        showLoading(false);
        handleError(error);
    }
}
// ===== AUTENTICAÇÃO =====
async function checkAuthentication() {
    try {
        if (!window.getCurrentSession) {
            throw new Error('Função getCurrentSession não encontrada');
        }
        const session = await window.getCurrentSession();
        if (!session || !session.user) {
            return { success: false };
        }
        const orgId = window.getDefaultOrgId ? window.getDefaultOrgId() : 'default-org-id';
        return {
            success: true,
            user: session.user,
            orgId: orgId
        };
    } catch (error) {
        console.warn('⚠️ Erro na autenticação:', error);
        return { success: false, error };
    }
}
function redirectToLogin() {
    setTimeout(() => {
        window.navigateTo?.('login') || (window.location.href = '/login.html');
    }, 2000);
}
// ===== CARREGAMENTO DE DADOS =====
async function loadGamificationData() {
    try {
        gamificationState.isLoading = true;
        // Verificar se as funções necessárias estão disponíveis
        if (!window.genericSelect) {
            console.warn('⚠️ Função genericSelect não encontrada, carregando dados demo');
            loadDemoData();
            return;
        }
        const orgId = gamificationState.orgId;
        const userId = gamificationState.user?.id;
        if (!userId || !orgId) {
            throw new Error('Usuário ou organização não definidos');
        }
        // Carregar dados em paralelo
        const [pointsResult, badgesResult, availableBadgesResult, leaderboardResult] = await Promise.allSettled([
            window.genericSelect('gamification_points', { user_id: userId }),
            window.genericSelect('user_badges', { user_id: userId }),
            window.genericSelect('gamification_badges', {}),
            window.genericSelect('team_leaderboards', {})
        ]);
        // Processar resultados
        const pointsData = pointsResult.status === 'fulfilled' ? pointsResult.value : { data: [] };
        const badgesData = badgesResult.status === 'fulfilled' ? badgesResult.value : { data: [] };
        const availableBadgesData = availableBadgesResult.status === 'fulfilled' ? availableBadgesResult.value : { data: [] };
        const leaderboardData = leaderboardResult.status === 'fulfilled' ? leaderboardResult.value : { data: [] };
        // Calcular pontos totais
        const totalPoints = pointsData.data?.reduce((sum, point) => sum + (point.points_awarded || 0), 0) || 0;
        // Atualizar estado
        gamificationState.userPoints = totalPoints;
        gamificationState.userLevel = calculateUserLevel(totalPoints);
        gamificationState.userBadges = badgesData.data || [];
        gamificationState.availableBadges = availableBadgesData.data || [];
        gamificationState.leaderboard = processLeaderboard(leaderboardData.data || []);
        gamificationState.recentActivities = processRecentActivities(pointsData.data || []);
        gamificationState.lastUpdate = new Date();
        console.log('✅ Dados de gamificação carregados do Supabase');
    } catch (error) {
        console.error('❌ Erro ao carregar dados de gamificação:', error);
        console.log('🔄 Carregando dados demo como fallback...');
        loadDemoData();
    } finally {
        gamificationState.isLoading = false;
    }
}
function calculateUserLevel(points) {
    for (const level of GAMIFICATION_CONFIG.LEVELS) {
        if (points >= level.minPoints && points <= level.maxPoints) {
            return level;
        }
    }
    return GAMIFICATION_CONFIG.LEVELS[GAMIFICATION_CONFIG.LEVELS.length - 1];
}
function processLeaderboard(data) {
    return data.map(entry => ({
        ...entry,
        user_name: entry.user_name || entry.name || 'Usuário',
        total_points: entry.total_points || entry.points || 0
    })).sort((a, b) => b.total_points - a.total_points);
}
function processRecentActivities(data) {
    return data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(activity => ({
            ...activity,
            actionConfig: GAMIFICATION_CONFIG.POINT_ACTIONS[activity.action] || {
                points: activity.points_awarded || 0,
                description: 'Atividade',
                category: 'other'
            },
            timeAgo: formatTimeAgo(activity.created_at)
        }));
}
function formatTimeAgo(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'agora mesmo';
        if (diffMins < 60) return `${diffMins}m atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        return 'data inválida';
    }
}
function loadDemoData() {
    console.log('📋 Carregando dados demo de gamificação...');
    // Dados demo realistas
    gamificationState.userPoints = 1250;
    gamificationState.userLevel = calculateUserLevel(1250);
    gamificationState.userBadges = [
        { id: 1, badge_id: 1, earned_at: new Date().toISOString() }
    ];
    gamificationState.availableBadges = [
        { id: 1, name: 'Primeiro Lead', description: 'Criou seu primeiro lead', tier: 'bronze', points_required: 10 },
        { id: 2, name: 'Vendedor Ativo', description: 'Fez 10 ligações', tier: 'silver', points_required: 50 },
        { id: 3, name: 'Expert em Vendas', description: 'Fechou 5 negócios', tier: 'gold', points_required: 500 }
    ];
    gamificationState.leaderboard = [
        { user_id: 'demo1', user_name: 'João Silva', total_points: 2500 },
        { user_id: 'demo2', user_name: 'Maria Santos', total_points: 1800 },
        { user_id: 'current', user_name: 'Você', total_points: 1250 },
        { user_id: 'demo3', user_name: 'Pedro Costa', total_points: 980 },
        { user_id: 'demo4', user_name: 'Ana Oliveira', total_points: 750 }
    ];
    gamificationState.recentActivities = [
        {
            id: 1,
            action: 'lead_created',
            points_awarded: 10,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            actionConfig: GAMIFICATION_CONFIG.POINT_ACTIONS.lead_created,
            timeAgo: '1h atrás'
        },
        {
            id: 2,
            action: 'call_made',
            points_awarded: 5,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            actionConfig: GAMIFICATION_CONFIG.POINT_ACTIONS.call_made,
            timeAgo: '2h atrás'
        }
    ];
    console.log('✅ Dados demo de gamificação carregados');
    window.showToast?.('Usando dados demo - verifique conexão com Supabase', 'warning');
}
// ===== RENDERIZAÇÃO DA INTERFACE =====
function renderGamificationInterface() {
    try {
        renderHeader();
        renderStats();
        renderProgress();
        renderBadges();
        renderLeaderboard();
        renderRecentActivities();
        console.log('🎨 Interface de gamificação renderizada');
    } catch (error) {
        console.error('❌ Erro ao renderizar interface:', error);
        showError('Erro ao renderizar interface de gamificação');
    }
}
function renderHeader() {
    const container = document.getElementById('gamification-header');
    if (!container) return;
    const { userLevel, userPoints, userBadges } = gamificationState;
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div class="mb-4 lg:mb-0">
                    <h1 class="text-3xl font-bold text-gray-900">Sistema de Gamificação</h1>
                    <p class="text-gray-600 mt-2">Acompanhe seu progresso e conquistas</p>
                </div>
               
                <div class="flex items-center space-x-6">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${formatNumber(userPoints)}</div>
                        <div class="text-sm text-gray-500">Pontos Totais</div>
                    </div>
                   
                    <div class="text-center">
                        <div class="flex items-center justify-center space-x-2">
                            <span class="text-2xl">${userLevel.icon}</span>
                            <span class="text-lg font-semibold text-${userLevel.color}-600">${userLevel.name}</span>
                        </div>
                        <div class="text-sm text-gray-500">Nível ${userLevel.level}</div>
                    </div>
                   
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${userBadges.length}</div>
                        <div class="text-sm text-gray-500">Badges</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
function renderStats() {
    const container = document.getElementById('user-stats');
    if (!container) return;
    const { userLevel, userPoints, recentActivities, leaderboard, user } = gamificationState;
    // Calcular estatísticas
    const userRank = leaderboard.findIndex(entry => entry.user_id === user?.id) + 1 || leaderboard.length + 1;
    const pointsToNext = userLevel.level < 10 ? GAMIFICATION_CONFIG.LEVELS[userLevel.level].minPoints - userPoints : 0;
    const todayActivities = recentActivities.filter(activity => {
        const activityDate = new Date(activity.created_at);
        const today = new Date();
        return activityDate.toDateString() === today.toDateString();
    }).length;
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                            <span class="text-lg">🏆</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Ranking</p>
                        <p class="text-2xl font-semibold text-blue-600">#${userRank}</p>
                    </div>
                </div>
            </div>
           
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                            <span class="text-lg">⚡</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Atividades Hoje</p>
                        <p class="text-2xl font-semibold text-green-600">${todayActivities}</p>
                    </div>
                </div>
            </div>
           
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                            <span class="text-lg">🎯</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Para Próximo Nível</p>
                        <p class="text-2xl font-semibold text-purple-600">${pointsToNext > 0 ? formatNumber(pointsToNext) : 'MAX'}</p>
                    </div>
                </div>
            </div>
           
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                            <span class="text-lg">✨</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Multiplicador</p>
                        <p class="text-2xl font-semibold text-orange-600">${userLevel.multiplier}x</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
function renderProgress() {
    const container = document.getElementById('progress-section');
    if (!container) return;
    const { userLevel, userPoints } = gamificationState;
    // Calcular progresso
    const currentLevelMin = userLevel.minPoints;
    const nextLevelMin = userLevel.level < 10 ? GAMIFICATION_CONFIG.LEVELS[userLevel.level].minPoints : userLevel.maxPoints;
    const progressInLevel = userPoints - currentLevelMin;
    const totalLevelPoints = nextLevelMin - currentLevelMin;
    const progressPercentage = userLevel.level < 10 ? Math.min((progressInLevel / totalLevelPoints) * 100, 100) : 100;
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Progresso do Nível</h3>
           
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                    <span class="text-2xl">${userLevel.icon}</span>
                    <span class="font-semibold text-${userLevel.color}-600">${userLevel.name}</span>
                    <span class="text-sm text-gray-500">(Nível ${userLevel.level})</span>
                </div>
                <div class="text-sm text-gray-500">
                    ${formatNumber(userPoints)} / ${userLevel.level < 10 ? formatNumber(nextLevelMin) : 'MAX'} pontos
                </div>
            </div>
           
            <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div class="h-3 rounded-full bg-blue-600 transition-all duration-500"
                     style="width: ${progressPercentage}%"></div>
            </div>
           
            ${userLevel.level < 10 ? `
                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        Faltam <span class="font-semibold text-blue-600">${formatNumber(nextLevelMin - userPoints)}</span> pontos para o próximo nível
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                        Próximo: ${GAMIFICATION_CONFIG.LEVELS[userLevel.level].icon} ${GAMIFICATION_CONFIG.LEVELS[userLevel.level].name}
                    </p>
                </div>
            ` : `
                <div class="text-center">
                    <p class="text-sm font-semibold text-yellow-600">🎉 Nível Máximo Alcançado! 🎉</p>
                    <p class="text-xs text-gray-500 mt-1">Você é uma lenda!</p>
                </div>
            `}
        </div>
    `;
}
function renderBadges() {
    const container = document.getElementById('badges-section');
    if (!container) return;
    const { userBadges, availableBadges } = gamificationState;
    // Separar badges conquistados e disponíveis
    const earnedBadgeIds = userBadges.map(badge => badge.badge_id);
    const unearnedBadges = availableBadges.filter(badge => !earnedBadgeIds.includes(badge.id));
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Badges e Conquistas</h3>
           
            <div class="mb-6">
                <h4 class="text-md font-medium text-gray-700 mb-3">Badges Conquistados (${userBadges.length})</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    ${userBadges.map(userBadge => {
                        const badge = availableBadges.find(b => b.id === userBadge.badge_id);
                        if (!badge) return '';
                       
                        const tierConfig = GAMIFICATION_CONFIG.BADGE_TIERS[badge.tier] || GAMIFICATION_CONFIG.BADGE_TIERS.bronze;
                       
                        return `
                            <div class="text-center p-3 rounded-lg bg-${badge.tier === 'gold' ? 'yellow' : badge.tier === 'silver' ? 'gray' : 'amber'}-50 border border-${badge.tier === 'gold' ? 'yellow' : badge.tier === 'silver' ? 'gray' : 'amber'}-200">
                                <div class="text-3xl mb-2">${tierConfig.icon}</div>
                                <div class="text-sm font-medium text-gray-800">${badge.name}</div>
                                <div class="text-xs text-gray-500 mt-1">${badge.description}</div>
                            </div>
                        `;
                    }).join('')}
                   
                    ${userBadges.length === 0 ? `
                        <div class="col-span-full text-center py-8 text-gray-500">
                            <div class="text-4xl mb-2">🏆</div>
                            <p>Nenhum badge conquistado ainda</p>
                            <p class="text-sm">Complete atividades para ganhar seus primeiros badges!</p>
                        </div>
                    ` : ''}
                </div>
            </div>
           
            <div>
                <h4 class="text-md font-medium text-gray-700 mb-3">Badges Disponíveis (${unearnedBadges.length})</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    ${unearnedBadges.slice(0, 12).map(badge => {
                        const tierConfig = GAMIFICATION_CONFIG.BADGE_TIERS[badge.tier] || GAMIFICATION_CONFIG.BADGE_TIERS.bronze;
                       
                        return `
                            <div class="text-center p-3 rounded-lg bg-gray-50 border border-gray-200 opacity-60">
                                <div class="text-3xl mb-2 grayscale">${tierConfig.icon}</div>
                                <div class="text-sm font-medium text-gray-600">${badge.name}</div>
                                <div class="text-xs text-gray-500 mt-1">${badge.description}</div>
                                <div class="text-xs text-blue-600 mt-1">${badge.points_required} pontos</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}
function renderLeaderboard() {
    const container = document.getElementById('leaderboard-section');
    if (!container) return;
    const { leaderboard, user } = gamificationState;
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Leaderboard da Equipe</h3>
           
            <div class="space-y-3">
                ${leaderboard.slice(0, 10).map((entry, index) => {
                    const isCurrentUser = entry.user_id === user?.id || entry.user_name === 'Você';
                    const userLevel = calculateUserLevel(entry.total_points);
                   
                    let rankIcon = '🏅';
                    if (index === 0) rankIcon = '🥇';
                    else if (index === 1) rankIcon = '🥈';
                    else if (index === 2) rankIcon = '🥉';
                   
                    return `
                        <div class="flex items-center justify-between p-3 rounded-lg ${isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}">
                            <div class="flex items-center space-x-3">
                                <div class="text-lg">${rankIcon}</div>
                                <div class="text-lg font-semibold text-gray-600">#${index + 1}</div>
                                <div class="flex items-center space-x-2">
                                    <span class="text-lg">${userLevel.icon}</span>
                                    <div>
                                        <div class="font-medium ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}">
                                            ${entry.user_name}
                                            ${isCurrentUser ? ' (Você)' : ''}
                                        </div>
                                        <div class="text-sm text-${userLevel.color}-600">${userLevel.name}</div>
                                    </div>
                                </div>
                            </div>
                           
                            <div class="text-right">
                                <div class="font-semibold text-gray-900">${formatNumber(entry.total_points)}</div>
                                <div class="text-sm text-gray-500">pontos</div>
                            </div>
                        </div>
                    `;
                }).join('')}
               
                ${leaderboard.length === 0 ? `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">🏆</div>
                        <p>Leaderboard vazio</p>
                        <p class="text-sm">Seja o primeiro a pontuar!</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}
function renderRecentActivities() {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    const { recentActivities } = gamificationState;
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Atividades Recentes</h3>
           
            <div class="space-y-3">
                ${recentActivities.map(activity => {
                    const actionConfig = activity.actionConfig;
                    const categoryColors = {
                        sales: 'text-green-600 bg-green-100',
                        activity: 'text-blue-600 bg-blue-100',
                        communication: 'text-purple-600 bg-purple-100',
                        achievement: 'text-yellow-600 bg-yellow-100',
                        engagement: 'text-indigo-600 bg-indigo-100',
                        setup: 'text-gray-600 bg-gray-100',
                        other: 'text-gray-600 bg-gray-100'
                    };
                   
                    const categoryStyle = categoryColors[actionConfig.category] || categoryColors.other;
                   
                    return `
                        <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 rounded-full ${categoryStyle} flex items-center justify-center">
                                    <span class="text-xs font-semibold">+${actionConfig.points}</span>
                                </div>
                                <div>
                                    <div class="font-medium text-gray-900">${actionConfig.description}</div>
                                    <div class="text-sm text-gray-500">${activity.timeAgo}</div>
                                </div>
                            </div>
                           
                            <div class="text-right">
                                <div class="font-semibold text-green-600">+${actionConfig.points}</div>
                                <div class="text-xs text-gray-500">${actionConfig.category}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
               
                ${recentActivities.length === 0 ? `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">📋</div>
                        <p>Nenhuma atividade recente</p>
                        <p class="text-sm">Comece a usar o sistema para ver suas atividades aqui!</p>
                    </div>
                ` : ''}
            </div>
           
            ${recentActivities.length > 0 ? `
                <div class="mt-4 text-center">
                    <button onclick="refreshGamificationData()" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Atualizar atividades
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}
// ===== FUNÇÕES DE UTILIDADE =====
function formatNumber(num) {
    try {
        if (num === null || num === undefined || isNaN(num)) {
            return '0';
        }
        return new Intl.NumberFormat('pt-BR').format(num);
    } catch (error) {
        return String(num);
    }
}
function formatDate(dateString) {
    try {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        return '-';
    }
}
// ===== FUNÇÕES DE UI =====
function showLoading(show, message = 'Carregando...') {
    try {
        let loadingElement = document.getElementById('gamification-loading');
       
        if (show) {
            if (!loadingElement) {
                loadingElement = document.createElement('div');
                loadingElement.id = 'gamification-loading';
                loadingElement.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                loadingElement.innerHTML = `
                    <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span class="text-gray-700">${message}</span>
                    </div>
                `;
                document.body.appendChild(loadingElement);
            } else {
                loadingElement.querySelector('span').textContent = message;
                loadingElement.classList.remove('hidden');
            }
        } else {
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    } catch (error) {
        console.error('Erro ao mostrar loading:', error);
    }
}
function showError(message) {
    window.showToast?.(message, 'error') || alert(`Erro: ${message}`);
}
function showSuccess(message) {
    window.showToast?.(message, 'success') || console.log(`Sucesso: ${message}`);
}
// ===== AUTO-REFRESH =====
function setupAutoRefresh() {
    // Atualizar a cada 5 minutos
    setInterval(() => {
        if (!document.hidden && !gamificationState.isLoading) {
            refreshGamificationData();
        }
    }, 300000);
   
    // Atualizar quando a página voltar ao foco
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            refreshGamificationData();
        }
    });
}
// ===== FUNÇÕES PÚBLICAS =====
async function refreshGamificationData() {
    try {
        console.log('🔄 Atualizando dados de gamificação...');
        await loadGamificationData();
        renderGamificationInterface();
        showSuccess('Dados de gamificação atualizados!');
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        showError('Erro ao atualizar dados de gamificação');
    }
}
function handleError(error) {
    console.error('Erro no sistema de gamificação:', error);
   
    // Tentar carregar dados demo como fallback
    try {
        loadDemoData();
        renderGamificationInterface();
        showError('Erro no sistema principal. Carregando dados demo.');
    } catch (fallbackError) {
        showError('Sistema temporariamente indisponível');
    }
}
// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.GamificationSystem = {
    refresh: refreshGamificationData,
    getState: () => ({ ...gamificationState }),
    version: '2.0.0'
};
window.refreshGamificationData = refreshGamificationData;
console.log('🎮 Sistema de Gamificação V2.0 carregado - Compatível com fix-imports!');
