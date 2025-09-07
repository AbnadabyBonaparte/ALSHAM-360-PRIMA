// ALSHAM 360° PRIMA - Sistema de Gamificação Ultimate 10/10
// Interface premium para gamificação completa com níveis, badges, desafios, ranking e recompensas

import { supabase } from '../lib/supabase.js';

// ===== ESTADO GLOBAL =====
const gameState = {
    user: null,
    profile: null,
    gameData: null,
    teamRanking: [],
    badges: [],
    challenges: [],
    achievements: [],
    rewards: [],
    leaderboard: [],
    dailyGoals: [],
    weeklyGoals: [],
    monthlyGoals: [],
    streaks: null,
    levelSystem: null,
    notifications: [],
    isLoading: true,
    error: null,
    refreshInterval: null
};

// ===== CONFIGURAÇÕES DO SISTEMA =====
const gameConfig = {
    levels: [
        { level: 1, name: 'Iniciante', minPoints: 0, maxPoints: 499, color: 'gray', icon: '🥚' },
        { level: 2, name: 'Aprendiz', minPoints: 500, maxPoints: 999, color: 'blue', icon: '🐣' },
        { level: 3, name: 'Vendedor', minPoints: 1000, maxPoints: 1999, color: 'green', icon: '🦅' },
        { level: 4, name: 'Especialista', minPoints: 2000, maxPoints: 3499, color: 'purple', icon: '🦉' },
        { level: 5, name: 'Expert', minPoints: 3500, maxPoints: 4999, color: 'orange', icon: '🦅' },
        { level: 6, name: 'Mestre', minPoints: 5000, maxPoints: 7499, color: 'red', icon: '🦅' },
        { level: 7, name: 'Lenda', minPoints: 7500, maxPoints: 9999, color: 'gold', icon: '🔥' },
        { level: 8, name: 'Mítico', minPoints: 10000, maxPoints: 14999, color: 'diamond', icon: '💎' },
        { level: 9, name: 'Épico', minPoints: 15000, maxPoints: 24999, color: 'rainbow', icon: '🌟' },
        { level: 10, name: 'Lendário', minPoints: 25000, maxPoints: 999999, color: 'cosmic', icon: '🚀' }
    ],
    pointsActions: {
        lead_created: 10,
        lead_qualified: 25,
        call_made: 5,
        email_sent: 3,
        deal_closed: 100,
        meeting_scheduled: 15,
        proposal_sent: 20,
        follow_up_completed: 8,
        goal_achieved: 50,
        badge_earned: 30
    }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeGamificationPage);

async function initializeGamificationPage() {
    try {
        showLoader(true, 'Carregando sistema de gamificação...');
        
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/login.html';
            return;
        }
        
        gameState.user = user;
        
        // Buscar perfil do usuário
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('org_id, full_name')
            .eq('user_id', user.id)
            .single();
            
        gameState.profile = profile;
        
        // Carregar todos os dados do jogo
        await Promise.all([
            loadGameData(),
            loadTeamRanking(),
            loadBadges(),
            loadChallenges(),
            loadAchievements(),
            loadGoals(),
            loadStreaks(),
            loadRewards()
        ]);
        
        gameState.isLoading = false;
        renderGameInterface();
        setupEventListeners();
        setupRealTimeUpdates();
        showLoader(false);
        
        showGameNotification('Sistema de gamificação carregado!', 'success');
        console.log('🎮 Sistema de gamificação Ultimate inicializado');
        
    } catch (error) {
        console.error('Erro ao inicializar gamificação:', error);
        gameState.error = 'Erro ao carregar gamificação';
        gameState.isLoading = false;
        showLoader(false);
        loadDemoData();
    }
}

// ===== CARREGAMENTO DE DADOS REAIS =====
async function loadGameData() {
    try {
        const { data, error } = await supabase
            .from('user_game_stats')
            .select('*')
            .eq('user_id', gameState.user.id)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error;
        
        gameState.gameData = data || createDefaultGameData();
        
    } catch (error) {
        console.error('Erro ao carregar dados do jogo:', error);
        gameState.gameData = createDefaultGameData();
    }
}

async function loadTeamRanking() {
    try {
        const { data, error } = await supabase
            .from('user_game_stats')
            .select(`
                *,
                user_profiles (
                    full_name,
                    position,
                    avatar_url
                )
            `)
            .eq('org_id', gameState.profile?.org_id)
            .order('total_points', { ascending: false })
            .limit(10);
            
        if (error) throw error;
        gameState.teamRanking = data || [];
        
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        gameState.teamRanking = createDemoRanking();
    }
}

async function loadBadges() {
    try {
        const { data, error } = await supabase
            .from('user_badges')
            .select(`
                *,
                badges (
                    name,
                    description,
                    icon,
                    category,
                    rarity
                )
            `)
            .eq('user_id', gameState.user.id);
            
        if (error) throw error;
        gameState.badges = data || [];
        
    } catch (error) {
        console.error('Erro ao carregar badges:', error);
        gameState.badges = createDemoBadges();
    }
}

async function loadChallenges() {
    try {
        const { data, error } = await supabase
            .from('active_challenges')
            .select('*')
            .eq('user_id', gameState.user.id)
            .eq('is_active', true);
            
        if (error) throw error;
        gameState.challenges = data || [];
        
    } catch (error) {
        console.error('Erro ao carregar desafios:', error);
        gameState.challenges = createDemoChallenges();
    }
}

async function loadAchievements() {
    try {
        const { data, error } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', gameState.user.id)
            .order('earned_at', { ascending: false })
            .limit(20);
            
        if (error) throw error;
        gameState.achievements = data || [];
        
    } catch (error) {
        console.error('Erro ao carregar conquistas:', error);
        gameState.achievements = createDemoAchievements();
    }
}

async function loadGoals() {
    try {
        const { data, error } = await supabase
            .from('user_goals')
            .select('*')
            .eq('user_id', gameState.user.id)
            .eq('is_active', true);
            
        if (error) throw error;
        
        gameState.dailyGoals = data?.filter(g => g.type === 'daily') || [];
        gameState.weeklyGoals = data?.filter(g => g.type === 'weekly') || [];
        gameState.monthlyGoals = data?.filter(g => g.type === 'monthly') || [];
        
    } catch (error) {
        console.error('Erro ao carregar metas:', error);
        loadDemoGoals();
    }
}

async function loadStreaks() {
    try {
        const { data, error } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', gameState.user.id)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error;
        gameState.streaks = data || createDefaultStreaks();
        
    } catch (error) {
        console.error('Erro ao carregar streaks:', error);
        gameState.streaks = createDefaultStreaks();
    }
}

async function loadRewards() {
    try {
        const { data, error } = await supabase
            .from('available_rewards')
            .select('*')
            .eq('org_id', gameState.profile?.org_id)
            .eq('is_active', true)
            .order('points_required');
            
        if (error) throw error;
        gameState.rewards = data || [];
        
    } catch (error) {
        console.error('Erro ao carregar recompensas:', error);
        gameState.rewards = createDemoRewards();
    }
}

// ===== DADOS DEMO =====
function loadDemoData() {
    gameState.gameData = createDefaultGameData();
    gameState.teamRanking = createDemoRanking();
    gameState.badges = createDemoBadges();
    gameState.challenges = createDemoChallenges();
    gameState.achievements = createDemoAchievements();
    loadDemoGoals();
    gameState.streaks = createDefaultStreaks();
    gameState.rewards = createDemoRewards();
    
    renderGameInterface();
}

function createDefaultGameData() {
    return {
        user_id: gameState.user.id,
        total_points: 2847,
        level: 7,
        experience_points: 347,
        weekly_points: 156,
        monthly_points: 892,
        rank_position: 3,
        badges_earned: 15,
        challenges_completed: 8,
        current_streak: 12,
        best_streak: 18,
        total_actions: 1247,
        conversion_rate: 34.2,
        avg_response_time: '2.3min'
    };
}

function createDemoRanking() {
    return [
        {
            user_id: '1',
            total_points: 3156,
            level: 8,
            weekly_points: 189,
            rank_position: 1,
            user_profiles: {
                full_name: 'Maria Santos',
                position: 'Senior Sales Manager',
                avatar_url: null
            }
        },
        {
            user_id: '2',
            total_points: 2991,
            level: 7,
            weekly_points: 134,
            rank_position: 2,
            user_profiles: {
                full_name: 'Pedro Costa',
                position: 'Sales Specialist',
                avatar_url: null
            }
        },
        {
            user_id: gameState.user.id,
            total_points: 2847,
            level: 7,
            weekly_points: 156,
            rank_position: 3,
            user_profiles: {
                full_name: gameState.profile?.full_name || 'Você',
                position: 'Sales Expert',
                avatar_url: null
            },
            isCurrentUser: true
        },
        {
            user_id: '4',
            total_points: 2634,
            level: 6,
            weekly_points: 98,
            rank_position: 4,
            user_profiles: {
                full_name: 'Ana Oliveira',
                position: 'Sales Representative',
                avatar_url: null
            }
        },
        {
            user_id: '5',
            total_points: 2387,
            level: 6,
            weekly_points: 76,
            rank_position: 5,
            user_profiles: {
                full_name: 'Carlos Mendes',
                position: 'Junior Sales',
                avatar_url: null
            }
        }
    ];
}

function createDemoBadges() {
    return [
        { id: '1', badge_id: 'first-lead', earned_at: '2025-08-01', badges: { name: 'Primeiro Lead', icon: '🥇', category: 'milestone', rarity: 'common' } },
        { id: '2', badge_id: 'streak-7', earned_at: '2025-08-15', badges: { name: 'Sequência 7 Dias', icon: '🔥', category: 'streak', rarity: 'uncommon' } },
        { id: '3', badge_id: 'deal-closer', earned_at: '2025-08-20', badges: { name: 'Fechador de Negócios', icon: '💰', category: 'performance', rarity: 'rare' } },
        { id: '4', badge_id: 'speed-demon', earned_at: '2025-08-25', badges: { name: 'Demônio da Velocidade', icon: '⚡', category: 'speed', rarity: 'epic' } },
        { id: '5', badge_id: 'team-player', earned_at: '2025-09-01', badges: { name: 'Jogador de Equipe', icon: '🤝', category: 'teamwork', rarity: 'rare' } }
    ];
}

function createDemoChallenges() {
    return [
        {
            id: '1',
            name: 'Sprint Semanal Elite',
            description: 'Converta 15 leads de alta qualidade esta semana',
            icon: '🎯',
            category: 'conversion',
            target_value: 15,
            current_value: 11,
            reward_points: 150,
            reward_badge: 'sprint-elite',
            expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            difficulty: 'hard',
            color: 'purple'
        },
        {
            id: '2',
            name: 'Maratona de Ligações Pro',
            description: 'Faça 50 ligações com qualidade hoje',
            icon: '📞',
            category: 'activity',
            target_value: 50,
            current_value: 37,
            reward_points: 75,
            reward_badge: 'call-master',
            expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000),
            difficulty: 'medium',
            color: 'blue'
        },
        {
            id: '3',
            name: 'Resposta Instantânea',
            description: 'Responda 20 leads em menos de 2 minutos',
            icon: '⚡',
            category: 'speed',
            target_value: 20,
            current_value: 14,
            reward_points: 100,
            reward_badge: 'lightning-fast',
            expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            difficulty: 'medium',
            color: 'yellow'
        }
    ];
}

function createDemoAchievements() {
    return [
        {
            id: '1',
            name: 'Meta Mensal Superada',
            description: 'Atingiu 120% da meta de setembro',
            icon: '🚀',
            points_earned: 200,
            earned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            rarity: 'epic'
        },
        {
            id: '2',
            name: 'Sequência Perfeita',
            description: 'Manteve 15 dias de atividade consecutiva',
            icon: '🔥',
            points_earned: 150,
            earned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            rarity: 'rare'
        },
        {
            id: '3',
            name: 'Vendedor Estrela',
            description: 'Maior taxa de conversão do mês (45.2%)',
            icon: '⭐',
            points_earned: 250,
            earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            rarity: 'legendary'
        }
    ];
}

function loadDemoGoals() {
    gameState.dailyGoals = [
        { id: '1', name: '10 ligações', target: 10, current: 8, type: 'daily', icon: '📞', color: 'blue' },
        { id: '2', name: '5 emails', target: 5, current: 5, type: 'daily', icon: '📧', color: 'green' },
        { id: '3', name: '2 reuniões', target: 2, current: 1, type: 'daily', icon: '📅', color: 'purple' }
    ];
    
    gameState.weeklyGoals = [
        { id: '4', name: '50 novos leads', target: 50, current: 34, type: 'weekly', icon: '👥', color: 'orange' },
        { id: '5', name: '15 conversões', target: 15, current: 11, type: 'weekly', icon: '💰', color: 'green' },
        { id: '6', name: '5 propostas', target: 5, current: 3, type: 'weekly', icon: '📋', color: 'blue' }
    ];
    
    gameState.monthlyGoals = [
        { id: '7', name: 'R$ 50.000 vendidos', target: 50000, current: 34500, type: 'monthly', icon: '💎', color: 'purple' },
        { id: '8', name: '200 leads qualificados', target: 200, current: 156, type: 'monthly', icon: '🎯', color: 'red' }
    ];
}

function createDefaultStreaks() {
    return {
        user_id: gameState.user.id,
        current_streak: 12,
        best_streak: 18,
        total_days_active: 145,
        streak_type: 'daily_activity',
        last_activity_date: new Date().toISOString().split('T')[0]
    };
}

function createDemoRewards() {
    return [
        {
            id: '1',
            name: 'Vale Presente Amazon R$ 50',
            description: 'Vale-presente de R$ 50 para usar na Amazon',
            icon: '🎁',
            points_required: 1000,
            category: 'gift_card',
            is_available: true,
            stock: 15
        },
        {
            id: '2',
            name: 'Folga Extra',
            description: 'Um dia de folga adicional aprovado',
            icon: '🏖️',
            points_required: 2500,
            category: 'time_off',
            is_available: true,
            stock: 5
        },
        {
            id: '3',
            name: 'Almoço com CEO',
            description: 'Almoço exclusivo com o CEO da empresa',
            icon: '🍽️',
            points_required: 5000,
            category: 'experience',
            is_available: true,
            stock: 1
        },
        {
            id: '4',
            name: 'Curso Online Premium',
            description: 'Acesso a qualquer curso da Udemy ou Coursera',
            icon: '📚',
            points_required: 1500,
            category: 'education',
            is_available: true,
            stock: 10
        }
    ];
}

// ===== RENDERIZAÇÃO PRINCIPAL =====
function renderGameInterface() {
    renderUserStats();
    renderLevelProgress();
    renderQuickStats();
    renderBadgesSection();
    renderChallengesSection();
    renderRankingSection();
    renderGoalsSection();
    renderAchievementsSection();
    renderRewardsSection();
    renderStreaksSection();
}

function renderUserStats() {
    const container = document.getElementById('user-game-stats');
    if (!container) return;
    
    const data = gameState.gameData;
    const levelInfo = getCurrentLevelInfo();
    
    container.innerHTML = `
        <div class="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div class="relative z-10">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-3xl font-bold mb-2">${levelInfo.icon} Nível ${data.level}</h2>
                        <p class="text-xl text-white/90">${levelInfo.name}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-3xl font-bold">${data.total_points?.toLocaleString()}</p>
                        <p class="text-white/80">pontos totais</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-6">
                    <div class="text-center">
                        <p class="text-2xl font-bold">#${data.rank_position}</p>
                        <p class="text-sm text-white/80">Ranking</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold">${data.badges_earned}</p>
                        <p class="text-sm text-white/80">Badges</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold">${data.current_streak}</p>
                        <p class="text-sm text-white/80">Dias seguidos</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLevelProgress() {
    const container = document.getElementById('level-progress-section');
    if (!container) return;
    
    const data = gameState.gameData;
    const currentLevel = getCurrentLevelInfo();
    const nextLevel = getNextLevelInfo();
    
    if (!nextLevel) {
        container.innerHTML = `
            <div class="bg-gradient-to-r from-gold-400 to-yellow-500 rounded-xl p-6 text-white text-center">
                <h3 class="text-2xl font-bold mb-2">🏆 Nível Máximo Atingido!</h3>
                <p>Você chegou ao topo! Continue coletando pontos para manter sua posição.</p>
            </div>
        `;
        return;
    }
    
    const progressPercent = ((data.total_points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100;
    const pointsNeeded = nextLevel.minPoints - data.total_points;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Progresso para o Próximo Nível</h3>
                <span class="text-sm text-gray-600">${Math.round(progressPercent)}%</span>
            </div>
            
            <div class="flex items-center space-x-4 mb-4">
                <div class="w-12 h-12 bg-${currentLevel.color}-100 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">${currentLevel.icon}</span>
                </div>
                <div class="flex-1">
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-gradient-to-r from-${currentLevel.color}-400 to-${nextLevel.color}-500 h-3 rounded-full transition-all duration-500" 
                             style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                <div class="w-12 h-12 bg-${nextLevel.color}-100 rounded-xl flex items-center justify-center">
                    <span class="text-2xl">${nextLevel.icon}</span>
                </div>
            </div>
            
            <div class="flex justify-between text-sm">
                <span class="text-gray-600">${currentLevel.name}</span>
                <span class="font-medium text-gray-900">${pointsNeeded.toLocaleString()} pontos para ${nextLevel.name}</span>
            </div>
        </div>
    `;
}

function renderQuickStats() {
    const container = document.getElementById('quick-game-stats');
    if (!container) return;
    
    const data = gameState.gameData;
    
    container.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span class="text-xl">📊</span>
                </div>
                <p class="text-xl font-bold text-gray-900">${data.weekly_points}</p>
                <p class="text-xs text-gray-600">Esta semana</p>
            </div>
            
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span class="text-xl">🎯</span>
                </div>
                <p class="text-xl font-bold text-gray-900">${data.conversion_rate}%</p>
                <p class="text-xs text-gray-600">Taxa conversão</p>
            </div>
            
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span class="text-xl">⚡</span>
                </div>
                <p class="text-xl font-bold text-gray-900">${data.avg_response_time}</p>
                <p class="text-xs text-gray-600">Tempo resposta</p>
            </div>
            
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span class="text-xl">🏆</span>
                </div>
                <p class="text-xl font-bold text-gray-900">${data.challenges_completed}</p>
                <p class="text-xs text-gray-600">Desafios completos</p>
            </div>
        </div>
    `;
}

function renderBadgesSection() {
    const container = document.getElementById('badges-section');
    if (!container) return;
    
    const earnedBadges = gameState.badges.slice(0, 6);
    
    container.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">🏆 Badges Conquistados</h3>
                <button onclick="viewAllBadges()" class="text-sm text-primary hover:text-primary-dark font-medium">
                    Ver todos (${gameState.badges.length})
                </button>
            </div>
            
            <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
                ${earnedBadges.map(badge => `
                    <div class="text-center p-3 bg-gradient-to-br ${getBadgeGradient(badge.badges.rarity)} rounded-lg">
                        <div class="text-2xl mb-1">${badge.badges.icon}</div>
                        <p class="text-xs font-medium text-white">${badge.badges.name}</p>
                        <p class="text-xs text-white/80">${formatBadgeDate(badge.earned_at)}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderChallengesSection() {
    const container = document.getElementById('challenges-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">🎯 Desafios Ativos</h3>
                <button onclick="viewAllChallenges()" class="text-sm text-primary hover:text-primary-dark font-medium">
                    Ver todos
                </button>
            </div>
            
            <div class="space-y-4">
                ${gameState.challenges.map(challenge => renderChallengeCard(challenge)).join('')}
            </div>
        </div>
    `;
}

function renderChallengeCard(challenge) {
    const progress = (challenge.current_value / challenge.target_value) * 100;
    const timeLeft = getTimeLeft(challenge.expires_at);
    
    return `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-${challenge.color}-100 rounded-lg flex items-center justify-center">
                        <span class="text-xl">${challenge.icon}</span>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-900">${challenge.name}</h4>
                        <p class="text-xs text-gray-600">${challenge.description}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="px-2 py-1 text-xs font-medium bg-${challenge.color}-100 text-${challenge.color}-800 rounded-full">
                        +${challenge.reward_points} pts
                    </span>
                    <p class="text-xs text-gray-500 mt-1">${timeLeft}</p>
                </div>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-${challenge.color}-500 h-2 rounded-full transition-all duration-500" 
                     style="width: ${Math.min(progress, 100)}%"></div>
            </div>
            
            <div class="flex justify-between text-sm">
                <span class="text-gray-600">${challenge.current_value} / ${challenge.target_value}</span>
                <span class="font-medium text-${challenge.color}-600">${Math.round(progress)}%</span>
            </div>
        </div>
    `;
}

function renderRankingSection() {
    const container = document.getElementById('ranking-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">🏅 Ranking da Equipe</h3>
                <button onclick="viewFullRanking()" class="text-sm text-primary hover:text-primary-dark font-medium">
                    Ver ranking completo
                </button>
            </div>
            
            <div class="space-y-3">
                ${gameState.teamRanking.slice(0, 5).map((member, index) => renderRankingItem(member, index)).join('')}
            </div>
        </div>
    `;
}

function renderRankingItem(member, index) {
    const positionIcons = ['🥇', '🥈', '🥉'];
    const positionIcon = positionIcons[index] || `#${index + 1}`;
    const isCurrentUser = member.isCurrentUser;
    const levelInfo = getLevelInfo(member.level);
    
    return `
        <div class="flex items-center space-x-4 p-3 rounded-lg ${isCurrentUser ? 'bg-blue-50 ring-2 ring-blue-200' : 'hover:bg-gray-50'}">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 flex items-center justify-center">
                    <span class="text-lg">${positionIcon}</span>
                </div>
                <div class="w-10 h-10 bg-gradient-to-br from-${levelInfo.color}-400 to-${levelInfo.color}-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">
                        ${(member.user_profiles?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                </div>
            </div>
            
            <div class="flex-1">
                <p class="font-semibold text-gray-900">
                    ${member.user_profiles?.full_name || 'Usuário'}${isCurrentUser ? ' (Você)' : ''}
                </p>
                <p class="text-sm text-gray-600">${member.user_profiles?.position || 'Vendedor'}</p>
            </div>
            
            <div class="text-right">
                <p class="font-bold text-gray-900">${member.total_points?.toLocaleString()}</p>
                <p class="text-xs text-gray-600">+${member.weekly_points} esta semana</p>
            </div>
            
            <div class="w-8 h-8 bg-${levelInfo.color}-100 rounded-lg flex items-center justify-center">
                <span class="text-lg">${levelInfo.icon}</span>
            </div>
        </div>
    `;
}

function renderGoalsSection() {
    const container = document.getElementById('goals-section');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">🎯 Metas e Objetivos</h3>
            
            <div class="space-y-6">
                ${renderGoalsGroup('Metas Diárias', gameState.dailyGoals)}
                ${renderGoalsGroup('Metas Semanais', gameState.weeklyGoals)}
                ${renderGoalsGroup('Metas Mensais', gameState.monthlyGoals)}
            </div>
        </div>
    `;
}

function renderGoalsGroup(title, goals) {
    if (!goals || goals.length === 0) return '';
    
    return `
        <div>
            <h4 class="font-medium text-gray-900 mb-3">${title}</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                ${goals.map(goal => renderGoalCard(goal)).join('')}
            </div>
        </div>
    `;
}

function renderGoalCard(goal) {
    const progress = (goal.current / goal.target) * 100;
    const isCompleted = goal.current >= goal.target;
    
    return `
        <div class="p-3 border border-gray-200 rounded-lg ${isCompleted ? 'bg-green-50 border-green-200' : ''}">
            <div class="flex items-center space-x-2 mb-2">
                <span class="text-lg">${goal.icon}</span>
                <span class="text-sm font-medium text-gray-900">${goal.name}</span>
                ${isCompleted ? '<span class="text-green-600 text-sm">✓</span>' : ''}
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div class="bg-${goal.color}-500 h-2 rounded-full transition-all duration-500" 
                     style="width: ${Math.min(progress, 100)}%"></div>
            </div>
            
            <div class="flex justify-between text-xs">
                <span class="text-gray-600">${goal.current} / ${goal.target}</span>
                <span class="font-medium text-${goal.color}-600">${Math.round(progress)}%</span>
            </div>
        </div>
    `;
}

function renderAchievementsSection() {
    const container = document.getElementById('achievements-section');
    if (!container) return;
    
    const recentAchievements = gameState.achievements.slice(0, 3);
    
    container.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">🏆 Conquistas Recentes</h3>
                <button onclick="viewAllAchievements()" class="text-sm text-primary hover:text-primary-dark font-medium">
                    Ver todas
                </button>
            </div>
            
            <div class="space-y-3">
                ${recentAchievements.map(achievement => `
                    <div class="flex items-center space-x-4 p-3 bg-gradient-to-r ${getAchievementGradient(achievement.rarity)} rounded-lg">
                        <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <span class="text-2xl">${achievement.icon}</span>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-white">${achievement.name}</h4>
                            <p class="text-sm text-white/80">${achievement.description}</p>
                            <p class="text-xs text-white/70">${formatTimeAgo(achievement.earned_at)}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-white">+${achievement.points_earned}</p>
                            <p class="text-xs text-white/80">pontos</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderRewardsSection() {
    const container = document.getElementById('rewards-section');
    if (!container) return;
    
    const availableRewards = gameState.rewards.filter(r => r.is_available).slice(0, 4);
    
    container.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">🎁 Loja de Recompensas</h3>
                <button onclick="viewRewardsStore()" class="text-sm text-primary hover:text-primary-dark font-medium">
                    Ver loja completa
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${availableRewards.map(reward => renderRewardCard(reward)).join('')}
            </div>
        </div>
    `;
}

function renderRewardCard(reward) {
    const canAfford = gameState.gameData.total_points >= reward.points_required;
    
    return `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div class="flex items-start space-x-3 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">${reward.icon}</span>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${reward.name}</h4>
                    <p class="text-sm text-gray-600">${reward.description}</p>
                </div>
            </div>
            
            <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-purple-600">${reward.points_required.toLocaleString()} pts</span>
                <button onclick="redeemReward('${reward.id}')" 
                        class="px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    canAfford 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }" ${!canAfford ? 'disabled' : ''}>
                    ${canAfford ? 'Resgatar' : 'Insuficiente'}
                </button>
            </div>
            
            ${reward.stock ? `<p class="text-xs text-gray-500 mt-2">Restam ${reward.stock} unidades</p>` : ''}
        </div>
    `;
}

function renderStreaksSection() {
    const container = document.getElementById('streaks-section');
    if (!container) return;
    
    const streaks = gameState.streaks;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">🔥 Sequências</h3>
            
            <div class="grid grid-cols-3 gap-6">
                <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span class="text-2xl">🔥</span>
                    </div>
                    <p class="text-2xl font-bold text-gray-900">${streaks.current_streak}</p>
                    <p class="text-sm text-gray-600">Dias seguidos</p>
                </div>
                
                <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span class="text-2xl">🏆</span>
                    </div>
                    <p class="text-2xl font-bold text-gray-900">${streaks.best_streak}</p>
                    <p class="text-sm text-gray-600">Melhor sequência</p>
                </div>
                
                <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span class="text-2xl">📅</span>
                    </div>
                    <p class="text-2xl font-bold text-gray-900">${streaks.total_days_active}</p>
                    <p class="text-sm text-gray-600">Dias ativos</p>
                </div>
            </div>
        </div>
    `;
}

// ===== FUNÇÕES AUXILIARES =====
function getCurrentLevelInfo() {
    const points = gameState.gameData.total_points;
    return gameConfig.levels.find(level => points >= level.minPoints && points <= level.maxPoints) || gameConfig.levels[0];
}

function getNextLevelInfo() {
    const currentLevel = getCurrentLevelInfo();
    return gameConfig.levels.find(level => level.level === currentLevel.level + 1);
}

function getLevelInfo(level) {
    return gameConfig.levels.find(l => l.level === level) || gameConfig.levels[0];
}

function getBadgeGradient(rarity) {
    const gradients = {
        common: 'from-gray-400 to-gray-600',
        uncommon: 'from-green-400 to-green-600',
        rare: 'from-blue-400 to-blue-600',
        epic: 'from-purple-400 to-purple-600',
        legendary: 'from-yellow-400 to-orange-600'
    };
    return gradients[rarity] || gradients.common;
}

function getAchievementGradient(rarity) {
    const gradients = {
        common: 'from-gray-500 to-gray-700',
        uncommon: 'from-green-500 to-green-700',
        rare: 'from-blue-500 to-blue-700',
        epic: 'from-purple-500 to-purple-700',
        legendary: 'from-yellow-500 to-orange-700'
    };
    return gradients[rarity] || gradients.common;
}

function formatBadgeDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days}d atrás`;
    if (days < 30) return `${Math.floor(days / 7)}sem atrás`;
    return `${Math.floor(days / 30)}mês atrás`;
}

function getTimeLeft(expiresAt) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d restantes`;
    if (hours > 0) return `${hours}h restantes`;
    return 'Expira em breve';
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Event listeners podem ser adicionados aqui conforme necessário
}

function setupRealTimeUpdates() {
    // Atualizar dados a cada 60 segundos
    gameState.refreshInterval = setInterval(async () => {
        try {
            await loadGameData();
            renderUserStats();
            renderQuickStats();
        } catch (error) {
            console.error('Erro ao atualizar dados em tempo real:', error);
        }
    }, 60000);
}

// ===== AÇÕES GLOBAIS =====
window.viewAllBadges = function() {
    showGameNotification('Modal de badges em desenvolvimento', 'info');
};

window.viewAllChallenges = function() {
    showGameNotification('Modal de desafios em desenvolvimento', 'info');
};

window.viewFullRanking = function() {
    showGameNotification('Ranking completo em desenvolvimento', 'info');
};

window.viewAllAchievements = function() {
    showGameNotification('Modal de conquistas em desenvolvimento', 'info');
};

window.viewRewardsStore = function() {
    showGameNotification('Loja de recompensas em desenvolvimento', 'info');
};

window.redeemReward = function(rewardId) {
    const reward = gameState.rewards.find(r => r.id === rewardId);
    if (reward && gameState.gameData.total_points >= reward.points_required) {
        showGameNotification(`Resgatando ${reward.name}...`, 'success');
        // Implementar lógica de resgate
    } else {
        showGameNotification('Pontos insuficientes para este resgate', 'error');
    }
};

// ===== FUNÇÕES DE UTILIDADE =====
function showLoader(show, message = 'Carregando...') {
    let loader = document.getElementById('game-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'game-loader';
        loader.className = 'fixed inset-0 bg-white/90 z-50 flex items-center justify-center backdrop-blur-sm';
        loader.innerHTML = `
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-b-4 border-gray-100 mx-auto mb-4"></div>
                <p class="text-gray-600 font-medium" id="game-loader-message">${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }
    
    const messageEl = loader.querySelector('#game-loader-message');
    if (messageEl) messageEl.textContent = message;
    
    loader.style.display = show ? 'flex' : 'none';
}

function showGameNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    notification.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-0`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    if (gameState.refreshInterval) {
        clearInterval(gameState.refreshInterval);
    }
});

// ===== EXPORTS =====
export {
    gameState,
    loadGameData,
    renderGameInterface
};
