/**
 * 🎮 ALSHAM 360° PRIMA - Sistema de Gamificação V2.2
 * Produção final alinhada com supabase.js + auth.js
 *
 * @version 2.2.0 - PRODUÇÃO NASA 10/10 MULTI-TENANT
 * @author
 *   ALSHAM Development Team
 */

import {
  getCurrentSession,
  getCurrentOrgId,
  genericSelect
} from "/src/lib/supabase.js";

// ==============================
// AGUARDAR DEPENDÊNCIAS
// ==============================
function initializeGamificationSystem() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeGamification);
  } else {
    initializeGamification();
  }
}

// ==============================
// CONFIGURAÇÕES
// ==============================
const GAMIFICATION_CONFIG = {
  LEVELS: [
    { level: 1, name: "Iniciante", minPoints: 0, maxPoints: 499, color: "gray", icon: "🥚", multiplier: 1.0 },
    { level: 2, name: "Aprendiz", minPoints: 500, maxPoints: 999, color: "blue", icon: "🐣", multiplier: 1.1 },
    { level: 3, name: "Vendedor", minPoints: 1000, maxPoints: 1999, color: "green", icon: "🦅", multiplier: 1.2 },
    { level: 4, name: "Especialista", minPoints: 2000, maxPoints: 3499, color: "purple", icon: "🦉", multiplier: 1.3 },
    { level: 5, name: "Expert", minPoints: 3500, maxPoints: 4999, color: "orange", icon: "🔥", multiplier: 1.4 },
    { level: 6, name: "Mestre", minPoints: 5000, maxPoints: 7499, color: "red", icon: "⚡", multiplier: 1.5 },
    { level: 7, name: "Lenda", minPoints: 7500, maxPoints: 9999, color: "yellow", icon: "👑", multiplier: 1.6 },
    { level: 8, name: "Mítico", minPoints: 10000, maxPoints: 14999, color: "indigo", icon: "💎", multiplier: 1.7 },
    { level: 9, name: "Épico", minPoints: 15000, maxPoints: 24999, color: "pink", icon: "🌟", multiplier: 1.8 },
    { level: 10, name: "Lendário", minPoints: 25000, maxPoints: 999999, color: "emerald", icon: "🚀", multiplier: 2.0 }
  ],
  POINT_ACTIONS: {
    lead_created: { points: 10, description: "Lead criado", category: "sales" },
    lead_qualified: { points: 25, description: "Lead qualificado", category: "sales" },
    call_made: { points: 5, description: "Ligação realizada", category: "activity" },
    email_sent: { points: 3, description: "Email enviado", category: "communication" },
    deal_closed: { points: 100, description: "Negócio fechado", category: "sales" },
    meeting_scheduled: { points: 15, description: "Reunião agendada", category: "activity" },
    proposal_sent: { points: 20, description: "Proposta enviada", category: "sales" },
    follow_up_completed: { points: 8, description: "Follow-up realizado", category: "activity" },
    goal_achieved: { points: 50, description: "Meta alcançada", category: "achievement" },
    daily_login: { points: 2, description: "Login diário", category: "engagement" }
  },
  BADGE_TIERS: {
    bronze: { color: "amber-600", multiplier: 1.0, icon: "🥉" },
    silver: { color: "gray-400", multiplier: 1.2, icon: "🥈" },
    gold: { color: "yellow-500", multiplier: 1.5, icon: "🥇" },
    platinum: { color: "purple-500", multiplier: 2.0, icon: "💎" },
    legendary: { color: "red-500", multiplier: 3.0, icon: "🏆" }
  }
};

// ==============================
// ESTADO GLOBAL
// ==============================
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

// ==============================
// INICIALIZAÇÃO PRINCIPAL
// ==============================
async function initializeGamification() {
  try {
    console.log("🎮 Inicializando sistema de gamificação...");
    showLoading(true);

    const authResult = await checkAuthentication();
    if (!authResult.success) {
      showError("Usuário não autenticado");
      redirectToLogin();
      return;
    }

    gamificationState.user = authResult.user;
    gamificationState.orgId = authResult.orgId;

    await loadGamificationData();
    renderGamificationInterface();
    setupAutoRefresh();

    showLoading(false);
    console.log("✅ Sistema de gamificação inicializado com sucesso");
    window.showToast?.("Sistema de gamificação carregado!", "success");
  } catch (error) {
    console.error("❌ Erro ao inicializar gamificação:", error);
    showLoading(false);
    handleError(error);
  }
}

// ==============================
// AUTENTICAÇÃO
// ==============================
async function checkAuthentication() {
  try {
    const session = await getCurrentSession();
    if (!session?.user) return { success: false };
    const orgId = await getCurrentOrgId();
    return { success: true, user: session.user, orgId };
  } catch (error) {
    console.warn("⚠️ Erro na autenticação:", error);
    return { success: false, error };
  }
}
function redirectToLogin() {
  window.location.href = "/login.html";
}

// ==============================
// CARREGAMENTO DE DADOS
// ==============================
async function loadGamificationData() {
  try {
    gamificationState.isLoading = true;

    const userId = gamificationState.user?.id;
    const orgId = gamificationState.orgId;
    if (!userId || !orgId) throw new Error("Usuário ou organização não definidos");

    const [pointsResult, badgesResult, availableBadgesResult, leaderboardResult] = await Promise.allSettled([
      genericSelect("gamification_points", { user_id: userId, org_id: orgId }),
      genericSelect("user_badges", { user_id: userId, org_id: orgId }),
      genericSelect("gamification_badges", { org_id: orgId }),
      genericSelect("team_leaderboards", { org_id: orgId })
    ]);

    const pointsData = pointsResult.value?.data || [];
    const badgesData = badgesResult.value?.data || [];
    const availableBadgesData = availableBadgesResult.value?.data || [];
    const leaderboardData = leaderboardResult.value?.data || [];

    const totalPoints = pointsData.reduce((sum, p) => sum + (p.points_awarded || 0), 0);

    gamificationState.userPoints = totalPoints;
    gamificationState.userLevel = calculateUserLevel(totalPoints);
    gamificationState.userBadges = badgesData;
    gamificationState.availableBadges = availableBadgesData;
    gamificationState.leaderboard = processLeaderboard(leaderboardData);
    gamificationState.recentActivities = processRecentActivities(pointsData);
    gamificationState.lastUpdate = new Date();

    console.log("✅ Dados de gamificação carregados do Supabase");
  } catch (error) {
    console.error("❌ Erro ao carregar gamificação:", error);
    loadDemoData();
  } finally {
    gamificationState.isLoading = false;
  }
}

// ==============================
// FUNÇÕES DE CÁLCULO
// ==============================
function calculateUserLevel(points) {
  for (const level of GAMIFICATION_CONFIG.LEVELS) {
    if (points >= level.minPoints && points <= level.maxPoints) return level;
  }
  return GAMIFICATION_CONFIG.LEVELS.at(-1);
}
function processLeaderboard(data) {
  return data.map(entry => ({
    ...entry,
    user_name: entry.user_name || "Usuário",
    total_points: entry.total_points || entry.points || 0
  })).sort((a, b) => b.total_points - a.total_points);
}
function processRecentActivities(data) {
  return data
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
    .map(activity => ({
      ...activity,
      actionConfig: GAMIFICATION_CONFIG.POINT_ACTIONS[activity.action] || { points: activity.points_awarded || 0, description: "Atividade", category: "other" },
      timeAgo: formatTimeAgo(activity.created_at)
    }));
}
function formatTimeAgo(dateString) {
  try {
    const date = new Date(dateString);
    const diffMs = Date.now() - date;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "agora mesmo";
    if (mins < 60) return `${mins}m atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString("pt-BR");
  } catch {
    return "data inválida";
  }
}

// ==============================
// DEMO
// ==============================
function loadDemoData() {
  console.log("📋 Carregando dados demo gamificação...");
  gamificationState.userPoints = 1250;
  gamificationState.userLevel = calculateUserLevel(1250);
  gamificationState.userBadges = [{ id: 1, badge_id: 1, earned_at: new Date().toISOString() }];
  gamificationState.availableBadges = [
    { id: 1, name: "Primeiro Lead", description: "Criou seu primeiro lead", tier: "bronze", points_required: 10 },
    { id: 2, name: "Vendedor Ativo", description: "Fez 10 ligações", tier: "silver", points_required: 50 }
  ];
  gamificationState.leaderboard = [
    { user_id: "demo1", user_name: "João Silva", total_points: 2500 },
    { user_id: "current", user_name: "Você", total_points: 1250 }
  ];
  gamificationState.recentActivities = [
    { id: 1, action: "lead_created", points_awarded: 10, created_at: new Date(Date.now() - 3600000).toISOString(), actionConfig: GAMIFICATION_CONFIG.POINT_ACTIONS.lead_created, timeAgo: "1h atrás" }
  ];
  window.showToast?.("Usando dados demo", "warning");
}

// ==============================
// INTERFACE
// ==============================
function renderGamificationInterface() {
  try {
    renderHeader();
    renderStats();
    renderProgress();
    renderBadges();
    renderLeaderboard();
    renderRecentActivities();
    console.log("🎨 Interface gamificação renderizada");
  } catch (error) {
    console.error("❌ Erro render interface:", error);
    showError("Erro render interface");
  }
}
// (Funções renderHeader, renderStats, renderProgress, renderBadges, renderLeaderboard, renderRecentActivities devem estar no mesmo arquivo ou importadas)

// ==============================
// AUTO-REFRESH
// ==============================
function setupAutoRefresh() {
  setInterval(() => {
    if (!document.hidden && !gamificationState.isLoading) refreshGamificationData();
  }, 300000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshGamificationData();
  });
}

// ==============================
// PUBLIC API
// ==============================
async function refreshGamificationData() {
  try {
    console.log("🔄 Atualizando gamificação...");
    await loadGamificationData();
    renderGamificationInterface();
    window.showToast?.("Gamificação atualizada!", "success");
  } catch (error) {
    console.error("Erro refresh:", error);
    showError("Erro atualizar gamificação");
  }
}
function handleError(error) {
  console.error("Erro sistema gamificação:", error);
  loadDemoData();
  renderGamificationInterface();
  showError("Carregando demo");
}

// ==============================
// EXPORT
// ==============================
window.GamificationSystem = {
  refresh: refreshGamificationData,
  getState: () => ({ ...gamificationState }),
  version: "2.2.0"
};
window.refreshGamificationData = refreshGamificationData;

console.log("🎮 Gamificação V2.2 carregada - multi-tenant Supabase");

// Init
initializeGamificationSystem();
