/**
 * ALSHAM 360° PRIMA - Sistema de Gamificação V3.2.0
 * FINAL: Estrutura completa e robusta
 */

function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.getCurrentSession) {
    console.log("✅ Supabase carregado para Gamificação");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou");
    showError("Erro ao carregar sistema");
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

function showError(msg) {
  const div = document.createElement("div");
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-red-600 shadow-lg";
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showSuccess(msg) {
  const div = document.createElement("div");
  div.className = "fixed top-4 right-4 z-50 px-4 py-2 rounded text-white bg-green-600 shadow-lg";
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

waitForSupabase(() => {
  const { getCurrentSession, getCurrentOrgId, genericSelect } = window.AlshamSupabase;

  const GAMIFICATION_CONFIG = {
    LEVELS: [
      { level: 1, name: "Iniciante", minPoints: 0, maxPoints: 499, color: "gray", icon: "🥚" },
      { level: 2, name: "Aprendiz", minPoints: 500, maxPoints: 999, color: "blue", icon: "🐣" },
      { level: 3, name: "Vendedor", minPoints: 1000, maxPoints: 1999, color: "green", icon: "🦅" },
      { level: 4, name: "Especialista", minPoints: 2000, maxPoints: 3499, color: "purple", icon: "🦉" },
      { level: 5, name: "Expert", minPoints: 3500, maxPoints: 4999, color: "orange", icon: "🔥" },
      { level: 6, name: "Mestre", minPoints: 5000, maxPoints: 7499, color: "red", icon: "⚡" },
      { level: 7, name: "Lenda", minPoints: 7500, maxPoints: 9999, color: "yellow", icon: "👑" },
      { level: 8, name: "Mítico", minPoints: 10000, maxPoints: 999999, color: "indigo", icon: "💎" }
    ]
  };

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

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      showLoading(true);
      const authResult = await checkAuthentication();
      if (!authResult.success) {
        redirectToLogin();
        return;
      }

      gamificationState.user = authResult.user;
      gamificationState.orgId = authResult.orgId;

      await loadGamificationData();
      renderInterface();
      setupAutoRefresh();

      showLoading(false);
      showSuccess("Gamificação carregada!");
    } catch (error) {
      console.error("❌ Erro ao inicializar:", error);
      showLoading(false);
      showError("Erro ao carregar gamificação");
    }
  });

  async function checkAuthentication() {
    try {
      const session = await getCurrentSession();
      if (!session?.user) return { success: false };
      const orgId = await getCurrentOrgId();
      return { success: true, user: session.user, orgId };
    } catch {
      return { success: false };
    }
  }

  function redirectToLogin() {
    window.location.href = "/login.html";
  }

  async function loadGamificationData() {
    try {
      gamificationState.isLoading = true;
      const userId = gamificationState.user.id;
      const orgId = gamificationState.orgId;

      const [pointsResult, badgesResult, availableBadgesResult] = await Promise.allSettled([
        genericSelect("gamification_points", { user_id: userId, org_id: orgId }),
        genericSelect("user_badges", { user_id: userId, org_id: orgId }),
        genericSelect("gamification_badges", { org_id: orgId })
      ]);

      const pointsData = pointsResult.status === "fulfilled" ? pointsResult.value.data || [] : [];
      const badgesData = badgesResult.status === "fulfilled" ? badgesResult.value.data || [] : [];
      const availableBadgesData = availableBadgesResult.status === "fulfilled" ? availableBadgesResult.value.data || [] : [];

      const totalPoints = pointsData.reduce((sum, p) => sum + (p.points_awarded || 0), 0);

      gamificationState.userPoints = totalPoints;
      gamificationState.userLevel = calculateLevel(totalPoints);
      gamificationState.userBadges = badgesData;
      gamificationState.availableBadges = availableBadgesData;
      gamificationState.recentActivities = pointsData.slice(-10).reverse();
      gamificationState.lastUpdate = new Date();

      console.log(`✅ ${totalPoints} pontos carregados`);
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      showError("Erro ao carregar dados");
    } finally {
      gamificationState.isLoading = false;
    }
  }

  function calculateLevel(points) {
    for (const level of GAMIFICATION_CONFIG.LEVELS) {
      if (points >= level.minPoints && points <= level.maxPoints) return level;
    }
    return GAMIFICATION_CONFIG.LEVELS[GAMIFICATION_CONFIG.LEVELS.length - 1];
  }

  function renderInterface() {
    renderStats();
    renderProgress();
    renderBadges();
    renderActivities();
  }

  function renderStats() {
    const container = document.getElementById("user-stats");
    if (!container) return;
    const level = gamificationState.userLevel;
    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-gray-600 text-sm">Pontos Totais</p>
        <h2 class="text-3xl font-bold text-blue-600">${gamificationState.userPoints}</h2>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-gray-600 text-sm">Nível Atual</p>
        <h2 class="text-3xl font-bold">${level.icon} ${level.name}</h2>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-gray-600 text-sm">Badges Conquistadas</p>
        <h2 class="text-3xl font-bold text-yellow-600">${gamificationState.userBadges.length}</h2>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-gray-600 text-sm">Atividades Recentes</p>
        <h2 class="text-3xl font-bold text-green-600">${gamificationState.recentActivities.length}</h2>
      </div>
    `;
  }

  function renderProgress() {
    const container = document.getElementById("level-progress");
    if (!container) return;
    const current = gamificationState.userLevel;
    const nextLevel = GAMIFICATION_CONFIG.LEVELS.find(l => l.level === current.level + 1);
    
    if (!nextLevel) {
      container.innerHTML = `
        <div class="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow p-6 text-white">
          <h3 class="text-xl font-bold mb-2">Nível Máximo Alcançado!</h3>
          <p class="text-sm">Você atingiu o nível mais alto do sistema.</p>
        </div>
      `;
      return;
    }

    const progress = Math.min(100, ((gamificationState.userPoints - current.minPoints) / (nextLevel.minPoints - current.minPoints)) * 100);
    const pointsNeeded = nextLevel.minPoints - gamificationState.userPoints;

    container.innerHTML = `
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold text-gray-700">Progresso para ${nextLevel.name}</h3>
          <span class="text-sm font-medium text-gray-600">${progress.toFixed(1)}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
        </div>
        <p class="text-sm text-gray-600">Faltam <span class="font-semibold">${pointsNeeded}</span> pontos para ${nextLevel.icon} ${nextLevel.name}</p>
      </div>
    `;
  }

  function renderBadges() {
    const container = document.getElementById("badges-container");
    if (!container) return;

    if (!gamificationState.availableBadges.length) {
      container.innerHTML = `<p class="text-gray-500 col-span-2">Nenhuma badge disponível ainda.</p>`;
      return;
    }

    const userBadgeIds = new Set(gamificationState.userBadges.map(b => b.badge_id));

    container.innerHTML = gamificationState.availableBadges.map(badge => {
      const hasUnlocked = userBadgeIds.has(badge.id);
      return `
        <div class="bg-white rounded-lg shadow p-4 ${hasUnlocked ? 'border-2 border-yellow-400' : 'opacity-60'}">
          <div class="text-4xl mb-2">${hasUnlocked ? '🏆' : '🔒'}</div>
          <h4 class="font-semibold text-gray-900">${badge.name}</h4>
          <p class="text-sm text-gray-600 mt-1">${badge.description || 'Conquista especial'}</p>
          ${hasUnlocked ? '<p class="text-xs text-green-600 mt-2 font-medium">✓ Conquistada</p>' : '<p class="text-xs text-gray-500 mt-2">Bloqueada</p>'}
        </div>
      `;
    }).join('');
  }

  function renderActivities() {
    const container = document.getElementById("points-history");
    if (!container) return;

    if (!gamificationState.recentActivities.length) {
      container.innerHTML = `<p class="text-gray-500">Nenhuma atividade registrada ainda.</p>`;
      return;
    }

    container.innerHTML = gamificationState.recentActivities.map(activity => {
      const date = new Date(activity.created_at);
      return `
        <div class="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p class="font-medium text-gray-900">${activity.activity_type || 'Atividade'}</p>
            <p class="text-xs text-gray-500">${date.toLocaleString('pt-BR')}</p>
          </div>
          <span class="text-lg font-bold text-green-600">+${activity.points_awarded}</span>
        </div>
      `;
    }).join('');
  }

  function setupAutoRefresh() {
    setInterval(() => {
      if (!document.hidden && !gamificationState.isLoading) {
        loadGamificationData().then(renderInterface);
      }
    }, 60000);
  }

  function showLoading(show) {
    const loader = document.getElementById("gamification-loading");
    if (loader) {
      loader.classList.toggle("hidden", !show);
    }
  }

  window.GamificationSystem = {
    refresh: () => loadGamificationData().then(renderInterface),
    getState: () => ({ ...gamificationState }),
    version: "3.2.0"
  };

  console.log("🎮 Gamificação v3.2.0 carregada");
});
