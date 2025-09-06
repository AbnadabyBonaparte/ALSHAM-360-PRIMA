import { supabase } from '../lib/supabase.js';

// Estado da aplicação
let userGameData = {};
let teamRanking = [];
let badges = [];
let challenges = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeGamificationPage();
});

async function initializeGamificationPage() {
    try {
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '../pages/login.html';
            return;
        }

        // Carregar dados de gamificação
        await loadGameData(user);
        
    } catch (error) {
        console.error('Erro ao inicializar página de gamificação:', error);
        showNotification('Erro ao carregar dados', 'error');
    }
}

async function loadGameData(user) {
    try {
        // Tentar carregar dados do Supabase
        const { data: gameData, error } = await supabase
            .from('user_game_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        userGameData = gameData || {};
        
        // Se não houver dados, usar dados mockados
        if (!gameData) {
            loadMockGameData();
        }

        // Carregar outros dados
        loadTeamRanking();
        loadBadges();
        loadChallenges();
        
        // Atualizar interface
        updateGameInterface();
        
    } catch (error) {
        console.error('Erro ao carregar dados de gamificação:', error);
        loadMockGameData();
        loadTeamRanking();
        loadBadges();
        loadChallenges();
        updateGameInterface();
    }
}

function loadMockGameData() {
    userGameData = {
        user_id: 'mock-user',
        level: 7,
        total_points: 2847,
        points_to_next_level: 353,
        weekly_points: 156,
        streak_days: 12,
        rank_position: 3,
        badges_earned: 12,
        achievements_month: 3
    };
}

function loadTeamRanking() {
    teamRanking = [
        {
            position: 1,
            name: 'Maria Santos',
            role: 'Vendedora Senior',
            points: 2956,
            weekly_points: 89,
            avatar: 'MS',
            badge: '👑'
        },
        {
            position: 2,
            name: 'Pedro Costa',
            role: 'Vendedor Pleno',
            points: 2891,
            weekly_points: 76,
            avatar: 'PC',
            badge: '🥈'
        },
        {
            position: 3,
            name: 'João Silva',
            role: 'Vendedor Expert',
            points: 2847,
            weekly_points: 156,
            avatar: 'JS',
            badge: '🥉',
            isCurrentUser: true
        },
        {
            position: 4,
            name: 'Ana Oliveira',
            role: 'Vendedora Junior',
            points: 2234,
            weekly_points: 45,
            avatar: 'AO'
        },
        {
            position: 5,
            name: 'Carlos Mendes',
            role: 'Vendedor Junior',
            points: 1987,
            weekly_points: 32,
            avatar: 'CM'
        }
    ];
}

function loadBadges() {
    badges = [
        { id: 'first-lead', name: 'Primeiro Lead', icon: '🥇', earned: true, description: 'Criou seu primeiro lead' },
        { id: 'seller-month', name: 'Vendedor do Mês', icon: '💰', earned: true, description: 'Melhor vendedor do mês' },
        { id: 'goal-achieved', name: 'Meta Batida', icon: '🎯', earned: true, description: 'Atingiu a meta mensal' },
        { id: 'streak-10', name: 'Sequência 10', icon: '🔥', earned: true, description: '10 dias consecutivos ativos' },
        { id: 'quick-response', name: 'Resposta Rápida', icon: '⚡', earned: true, description: 'Respondeu em menos de 5 min' },
        { id: 'calls-100', name: '100 Ligações', icon: '📞', earned: true, description: 'Fez 100 ligações' },
        { id: 'star-seller', name: 'Vendedor Estrela', icon: '🚀', earned: false, description: 'Converta 50 leads em um mês', progress: 76 },
        { id: 'consistent-growth', name: 'Crescimento Consistente', icon: '📈', earned: false, description: 'Aumente vendas por 3 meses', progress: 67 },
        { id: 'team-mentor', name: 'Mentor da Equipe', icon: '🎖️', earned: false, description: 'Ajude 5 colegas', progress: 40 }
    ];
}

function loadChallenges() {
    challenges = [
        {
            id: 'weekly-sprint',
            name: 'Sprint Semanal',
            icon: '🎯',
            description: 'Converta 10 leads esta semana',
            progress: 70,
            current: 7,
            target: 10,
            reward: 50,
            timeLeft: '3 dias',
            color: 'blue'
        },
        {
            id: 'call-marathon',
            name: 'Maratona de Ligações',
            icon: '📞',
            description: 'Faça 25 ligações hoje',
            progress: 88,
            current: 22,
            target: 25,
            reward: 30,
            timeLeft: '1 dia',
            color: 'green'
        },
        {
            id: 'lightning-response',
            name: 'Resposta Relâmpago',
            icon: '⚡',
            description: 'Responda leads em menos de 5 min',
            progress: 60,
            current: 12,
            target: 20,
            reward: 40,
            timeLeft: '5 dias',
            color: 'purple'
        }
    ];
}

function updateGameInterface() {
    // Atualizar estatísticas do perfil
    document.getElementById('user-level').textContent = `Nível ${userGameData.level}`;
    document.getElementById('total-points').textContent = `${userGameData.total_points.toLocaleString()} pontos`;
    document.getElementById('total-badges').textContent = `${userGameData.badges_earned} badges`;
    
    // Atualizar barra de progresso
    const progressPercent = ((userGameData.total_points % 1000) / 1000) * 100;
    document.getElementById('level-progress').style.width = `${progressPercent}%`;
    
    // Atualizar estatísticas rápidas
    document.getElementById('weekly-score').textContent = userGameData.weekly_points;
    document.getElementById('streak-days').textContent = userGameData.streak_days;
    document.getElementById('rank-position').textContent = `#${userGameData.rank_position}`;
    document.getElementById('achievements-month').textContent = userGameData.achievements_month;
    
    // Renderizar badges
    renderBadges();
    
    // Renderizar ranking
    renderTeamRanking();
    
    // Renderizar desafios
    renderChallenges();
}

function renderBadges() {
    const earnedBadgesContainer = document.getElementById('earned-badges');
    if (!earnedBadgesContainer) return;

    const earnedBadges = badges.filter(badge => badge.earned).slice(0, 6);
    
    earnedBadgesContainer.innerHTML = earnedBadges.map(badge => `
        <div class="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div class="text-3xl mb-2">${badge.icon}</div>
            <p class="text-xs font-medium text-gray-900">${badge.name}</p>
            <p class="text-xs text-gray-600">Conquistado</p>
        </div>
    `).join('');
}

function renderTeamRanking() {
    const rankingContainer = document.getElementById('team-ranking');
    if (!rankingContainer) return;

    rankingContainer.innerHTML = teamRanking.map(member => {
        const isCurrentUser = member.isCurrentUser;
        const positionColor = getPositionColor(member.position);
        const bgClass = isCurrentUser ? 'ring-2 ring-primary' : '';
        
        return `
            <div class="flex items-center space-x-4 p-4 ${positionColor.bg} rounded-lg ${positionColor.border} ${bgClass}">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 ${positionColor.badge} rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-sm">${member.position}</span>
                    </div>
                    <div class="w-10 h-10 ${positionColor.avatar} rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold">${member.avatar}</span>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="font-semibold text-gray-900">${member.name}${isCurrentUser ? ' (Você)' : ''}</p>
                    <p class="text-sm text-gray-600">${member.role}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-gray-900">${member.points.toLocaleString()} pts</p>
                    <p class="text-xs text-gray-600">+${member.weekly_points} esta semana</p>
                </div>
                ${member.badge ? `<div class="text-2xl">${member.badge}</div>` : ''}
            </div>
        `;
    }).join('');
}

function renderChallenges() {
    const challengesContainer = document.getElementById('active-challenges');
    if (!challengesContainer) return;

    challengesContainer.innerHTML = challenges.map(challenge => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-${challenge.color}-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">${challenge.icon}</span>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">${challenge.name}</h4>
                    <p class="text-xs text-gray-600">Termina em ${challenge.timeLeft}</p>
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-3">${challenge.description}</p>
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-${challenge.color}-500 h-2 rounded-full" style="width: ${challenge.progress}%"></div>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">${challenge.current} / ${challenge.target} ${challenge.description.split(' ').pop()}</span>
                <span class="text-xs bg-${challenge.color}-100 text-${challenge.color}-800 px-2 py-1 rounded-full">+${challenge.reward} pts</span>
            </div>
        </div>
    `).join('');
}

// Funções auxiliares
function getPositionColor(position) {
    switch (position) {
        case 1:
            return {
                bg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
                border: 'border border-yellow-200',
                badge: 'bg-yellow-400',
                avatar: 'bg-gradient-to-r from-yellow-500 to-orange-500'
            };
        case 2:
            return {
                bg: 'bg-gradient-to-r from-gray-50 to-blue-50',
                border: 'border border-gray-200',
                badge: 'bg-gray-400',
                avatar: 'bg-gradient-to-r from-gray-500 to-blue-500'
            };
        case 3:
            return {
                bg: 'bg-gradient-to-r from-orange-50 to-red-50',
                border: 'border border-orange-200',
                badge: 'bg-orange-400',
                avatar: 'bg-gradient-premium'
            };
        default:
            return {
                bg: 'hover:bg-gray-50',
                border: '',
                badge: 'bg-gray-300',
                avatar: 'bg-gradient-to-r from-purple-500 to-pink-500'
            };
    }
}

function showNotification(message, type = 'info') {
    // Implementar sistema de notificações
    console.log(`${type}: ${message}`);
    
    // Criar notificação visual simples
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${getNotificationColor(type)}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getNotificationColor(type) {
    const colors = {
        'success': 'bg-green-500 text-white',
        'error': 'bg-red-500 text-white',
        'info': 'bg-blue-500 text-white',
        'warning': 'bg-yellow-500 text-white'
    };
    return colors[type] || colors.info;
}

// Funções globais
window.viewAllBadges = function() {
    showNotification('Visualizando todos os badges...', 'info');
    // Implementar modal com todos os badges
};

window.viewAllChallenges = function() {
    showNotification('Visualizando todos os desafios...', 'info');
    // Implementar modal com todos os desafios
};

