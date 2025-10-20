/**
 * 📊 ALSHAM 360° PRIMA - Dashboard Advanced Features
 * @version 11.1.0
 * @author ALSHAM Development Team
 * @features Drag & Drop, Multiple Dashboards, Drill-down, Cohort, Maps, Heatmaps, etc.
 */
console.log('🔧 Dashboard Advanced v11.1 carregando...');

// ============================================================================
// ESTADO AVANÇADO
// ============================================================================
const DashboardAdvancedState = {
  currentDashboard: 'main',
  dashboards: [],
  widgets: [],
  gridstack: null,
  notifications: [],
  savedFilters: [],
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  layoutTemplates: {
    sales: {
      name: 'Vendas',
      icon: '💰',
      widgets: ['kpis', 'status-chart', 'funnel-chart', 'roi', 'leads-table']
    },
    marketing: {
      name: 'Marketing',
      icon: '📢',
      widgets: ['kpis', 'origem-chart', 'daily-chart', 'leads-table']
    },
    executive: {
      name: 'Executivo',
      icon: '👔',
      widgets: ['kpis', 'roi', 'goals', 'status-chart']
    },
    analytics: {
      name: 'Analytics',
      icon: '📊',
      widgets: ['kpis', 'status-chart', 'daily-chart', 'funnel-chart', 'origem-chart']
    }
  },
  availableWidgets: [
    { id: 'kpis', name: 'KPIs Principais', icon: '📈', type: 'metrics' },
    { id: 'status-chart', name: 'Distribuição por Status', icon: '🥧', type: 'chart' },
    { id: 'daily-chart', name: 'Novos Leads (7 dias)', icon: '📉', type: 'chart' },
    { id: 'funnel-chart', name: 'Funil de Conversão', icon: '🔽', type: 'chart' },
    { id: 'origem-chart', name: 'Leads por Origem', icon: '🌍', type: 'chart' },
    { id: 'roi', name: 'ROI Mensal', icon: '💰', type: 'metrics' },
    { id: 'goals', name: 'Metas e Objetivos', icon: '🎯', type: 'metrics' },
    { id: 'leads-table', name: 'Tabela de Leads', icon: '📋', type: 'table' },
    { id: 'cohort', name: 'Análise de Cohort', icon: '📊', type: 'advanced' },
    { id: 'map', name: 'Mapa Geográfico', icon: '🗺️', type: 'advanced' },
    { id: 'heatmap', name: 'Heatmap de Atividades', icon: '🔥', type: 'advanced' }
  ]
};

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
async function initAdvanced() {
  console.log('🚀 Inicializando features avançadas...');
 
  try {
    // Aguardar DashboardApp estar pronto
    if (!window.DashboardApp) {
      console.warn('⚠️ DashboardApp não disponível ainda, aguardando...');
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (window.DashboardApp && window.DashboardApp.state) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }
   
    // Carregar dados avançados
    await loadAdvancedData();
   
    // Inicializar GridStack
    initializeGridStack();
   
    // Carregar widgets iniciais
    await loadWidgetsForCurrentDashboard();
   
    // Setup UI
    setupDashboardToolbar();
    setupNotifications();
    setupKeyboardShortcuts();
   
    console.log('✅ Dashboard Advanced inicializado');
   
  } catch (error) {
    console.error('❌ Erro ao inicializar advanced:', error);
  }
}

async function loadAdvancedData() {
  if (!window.AlshamSupabase || !window.DashboardApp?.state?.orgId) return;
 
  const orgId = window.DashboardApp.state.orgId;
  const userId = window.DashboardApp.state.user?.id;
 
  try {
    // Carregar dashboards salvos
    const { data: dashboards } = await window.AlshamSupabase.genericSelect(
      'saved_dashboards',
      { org_id: orgId, user_id: userId }
    );
    DashboardAdvancedState.dashboards = dashboards || [];
   
    // Carregar filtros salvos
    const { data: filters } = await window.AlshamSupabase.genericSelect(
      'saved_filters',
      { org_id: orgId, user_id: userId }
    );
    DashboardAdvancedState.savedFilters = filters || [];
   
    // Carregar notificações
    const { data: notifications } = await window.AlshamSupabase.genericSelect(
      'notifications',
      { user_id: userId, is_read: false }
    );
    DashboardAdvancedState.notifications = notifications || [];
   
    console.log(`✅ Dados avançados carregados: ${dashboards?.length || 0} dashboards, ${filters?.length || 0} filtros`);
   
  } catch (error) {
    console.error('❌ Erro ao carregar dados avançados:', error);
  }
}

// ============================================================================
// GRIDSTACK INITIALIZATION
// ============================================================================
function initializeGridStack() {
  if (typeof GridStack === 'undefined') {
    console.error('❌ GridStack não carregado');
    return;
  }
 
  const gridContainer = document.getElementById('main-grid');
  if (!gridContainer) {
    console.warn('⚠️ Container do grid não encontrado');
    return;
  }
 
  DashboardAdvancedState.gridstack = GridStack.init({
    column: 12,
    minRow: 1,
    cellHeight: 'auto',
    margin: 10,
    resizable: { handles: 'e, se, s, sw, w' },
    draggable: { handle: '.grid-stack-item-content' },
    alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }, gridContainer);
 
  // Evento de mudança para salvar layout
  DashboardAdvancedState.gridstack.on('change', () => {
    saveCurrentLayout();
  });
 
  console.log('✅ GridStack inicializado');
}

// ============================================================================
// WIDGET MANAGEMENT
// ============================================================================
async function loadWidgetsForCurrentDashboard() {
  const grid = DashboardAdvancedState.gridstack;
  if (!grid) return;
 
  // Limpar widgets atuais
  grid.removeAll();
  DashboardAdvancedState.widgets = [];
 
  // Carregar layout salvo do Supabase
  try {
    const { data: layouts } = await window.AlshamSupabase.genericSelect(
      'dashboard_layouts',
      { dashboard_id: DashboardAdvancedState.currentDashboard, user_id: window.DashboardApp.state.user.id }
    );
    const layout = layouts?.[0]?.layout || [];
   
    layout.forEach(widgetData => {
      addWidget(widgetData.id, widgetData.config);
    });
   
    if (layout.length === 0) {
      // Carregar template padrão se não houver layout salvo
      applyLayoutTemplate('analytics');
    }
   
  } catch (error) {
    console.error('❌ Erro ao carregar widgets:', error);
    applyLayoutTemplate('analytics'); // Fallback para template padrão
  }
}

function addWidget(widgetId, config = {}) {
  const widgetInfo = DashboardAdvancedState.availableWidgets.find(w => w.id === widgetId);
  if (!widgetInfo) return;
 
  const widgetHtml = `
    <div>
      <div class="grid-stack-item-content">
        <div class="widget-header">
          <h3 class="widget-title">${widgetInfo.name}</h3>
          <button class="widget-action-btn" onclick="window.DashboardAdvanced.removeWidget(this.closest('.grid-stack-item'))">
            ✕
          </button>
        </div>
        <div id="widget-${widgetId}-${Date.now()}"></div>
      </div>
    </div>
  `;
 
  const el = DashboardAdvancedState.gridstack.addWidget(widgetHtml);
 
  // Renderizar conteúdo baseado no tipo
  const contentEl = el.querySelector('div[id^="widget-"]');
  if (contentEl) {
    renderWidgetContent(widgetInfo.type, widgetId, contentEl, config);
  }
 
  DashboardAdvancedState.widgets.push({ id: widgetId, el });
}

function renderWidgetContent(type, widgetId, container, config) {
  switch (type) {
    case 'metrics':
      if (widgetId === 'kpis') {
        container.innerHTML = window.DashboardApp?.renderKPIs?.toString() || 'KPIs';
      } else if (widgetId === 'roi') {
        container.innerHTML = window.DashboardApp?.renderROI?.toString() || 'ROI';
      } else if (widgetId === 'goals') {
        container.innerHTML = window.DashboardApp?.renderGoals?.toString() || 'Goals';
      }
      break;
   
    case 'chart':
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      if (widgetId === 'status-chart') {
        window.DashboardApp?.renderStatusChart(canvas);
      } // Similar para outros gráficos
      break;
   
    case 'table':
      container.innerHTML = window.DashboardApp?.renderLeadsTable?.toString() || 'Table';
      break;
   
    case 'advanced':
      if (widgetId === 'cohort') {
        openCohortModal(); // Ou render inline
      } // Similar para map e heatmap
      break;
  }
}

function removeWidget(el) {
  if (!confirm('Remover este widget?')) return;
  DashboardAdvancedState.gridstack.removeWidget(el);
  DashboardAdvancedState.widgets = DashboardAdvancedState.widgets.filter(w => w.el !== el);
  saveCurrentLayout();
}

async function saveCurrentLayout() {
  const grid = DashboardAdvancedState.gridstack;
  if (!grid) return;
 
  const serialized = grid.save();
  const layoutData = serialized.map(item => ({
    id: item.content.match(/widget-(\w+)/)?.[1],
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  }));
 
  try {
    await window.AlshamSupabase.genericUpsert('dashboard_layouts', {
      dashboard_id: DashboardAdvancedState.currentDashboard,
      user_id: window.DashboardApp.state.user.id,
      org_id: window.DashboardApp.state.orgId,
      layout: layoutData
    }, ['dashboard_id', 'user_id']);
   
    console.log('💾 Layout salvo');
   
  } catch (error) {
    console.error('❌ Erro ao salvar layout:', error);
  }
}

// ============================================================================
// DASHBOARD TOOLBAR
// ============================================================================
function setupDashboardToolbar() {
  const toolbar = document.getElementById('dashboard-toolbar');
  if (!toolbar) {
    console.warn('⚠️ Dashboard toolbar não encontrado no HTML');
    return;
  }
 
  // Mostrar toolbar
  toolbar.classList.remove('hidden');
 
  // Atualizar badge de notificações
  updateNotificationBadge();
}

// ============================================================================
// DRILL-DOWN AVANÇADO (MODAL COM TABELA)
// ============================================================================
function openDrillDown(title, data, breadcrumb = []) {
  const modal = document.getElementById('drill-down-modal');
  if (!modal) {
    console.warn('⚠️ Modal drill-down não encontrado');
    return;
  }
 
  // Breadcrumb
  const breadcrumbContainer = document.getElementById('drill-down-breadcrumb');
  if (breadcrumbContainer) {
    breadcrumbContainer.innerHTML = breadcrumb.map((item, index) => {
      if (index === breadcrumb.length - 1) {
        return `<span class="text-gray-900 dark:text-gray-100">${item}</span>`;
      }
      return `<a href="#" class="text-blue-600 hover:underline" onclick="event.preventDefault()">${item}</a> <span class="text-gray-400">/</span>`;
    }).join(' ');
  }
 
  // Título
  const titleEl = document.getElementById('drill-down-title');
  if (titleEl) titleEl.textContent = title;
 
  // Conteúdo
  const contentEl = document.getElementById('drill-down-content');
  if (!contentEl) return;
 
  if (!data || data.length === 0) {
    contentEl.innerHTML = '<p class="text-center text-gray-500 py-8">Nenhum dado disponível</p>';
  } else {
    // Gerar tabela
    const headers = Object.keys(data[0]);
   
    const tableHTML = `
      <div class="overflow-x-auto">
        <table class="drill-down-table">
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(h => `<td>${row[h] || 'N/A'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
   
    contentEl.innerHTML = tableHTML;
  }
 
  // Abrir modal
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}
function closeDrillDown() {
  const modal = document.getElementById('drill-down-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}
// ============================================================================
// DASHBOARD SWITCHER
// ============================================================================
function toggleDashboardDropdown() {
  const dropdown = document.getElementById('dashboard-dropdown');
  if (!dropdown) return;
 
  dropdown.classList.toggle('active');
}
function switchDashboard(dashboardId) {
  DashboardAdvancedState.currentDashboard = dashboardId;
 
  // Atualizar nome no botão
  const nameEl = document.getElementById('current-dashboard-name');
  if (nameEl) {
    const names = {
      main: 'Dashboard Principal',
      sales: 'Dashboard de Vendas',
      marketing: 'Dashboard de Marketing',
      executive: 'Dashboard Executivo',
      forecast: 'Forecast & Analytics'
    };
    nameEl.textContent = names[dashboardId] || 'Dashboard';
  }
 
  // Fechar dropdown
  toggleDashboardDropdown();
 
  // Atualizar active state
  document.querySelectorAll('.dashboard-item').forEach(item => {
    item.classList.remove('active');
  });
  event?.target?.closest('.dashboard-item')?.classList.add('active');
 
  // Recarregar widgets para novo dashboard
  loadWidgetsForCurrentDashboard();
 
  console.log(`📊 Trocando para dashboard: ${dashboardId}`);
  showToast(`Dashboard "${names[dashboardId]}" carregado`, 'success');
}
function openDashboardManager() {
  const modal = document.getElementById('dashboard-manager-modal');
  if (!modal) return;
 
  // Renderizar lista de dashboards
  const listContainer = document.getElementById('dashboards-list');
  if (listContainer) {
    if (DashboardAdvancedState.dashboards.length === 0) {
      listContainer.innerHTML = '<p class="text-center text-gray-500 py-4">Nenhum dashboard salvo</p>';
    } else {
      listContainer.innerHTML = DashboardAdvancedState.dashboards.map(dash => `
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-gray-100">${dash.name}</h4>
            <p class="text-xs text-gray-500">${new Date(dash.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <div class="flex gap-2">
            <button onclick="window.DashboardAdvanced.loadDashboard('${dash.id}')"
                    class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Carregar
            </button>
            <button onclick="window.DashboardAdvanced.deleteDashboard('${dash.id}')"
                    class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
              Deletar
            </button>
          </div>
        </div>
      `).join('');
    }
  }
 
  modal.classList.add('active');
}
function closeDashboardManager() {
  const modal = document.getElementById('dashboard-manager-modal');
  if (modal) modal.classList.remove('active');
}
async function createNewDashboard() {
  const name = prompt('Nome do novo dashboard:');
  if (!name) return;
 
  try {
    await window.AlshamSupabase.genericInsert('saved_dashboards', {
      name,
      user_id: window.DashboardApp.state.user.id,
      org_id: window.DashboardApp.state.orgId,
      layout: {},
      is_default: false
    });
   
    showToast('✅ Dashboard criado com sucesso!', 'success');
    await loadAdvancedData();
    openDashboardManager();
   
  } catch (error) {
    console.error('❌ Erro ao criar dashboard:', error);
    showToast('❌ Erro ao criar dashboard', 'error');
  }
}
async function deleteDashboard(dashboardId) {
  if (!confirm('Tem certeza que deseja deletar este dashboard?')) return;
 
  try {
    await window.AlshamSupabase.genericDelete('saved_dashboards', { id: dashboardId });
   
    showToast('✅ Dashboard deletado', 'success');
    await loadAdvancedData();
    openDashboardManager();
   
  } catch (error) {
    console.error('❌ Erro ao deletar dashboard:', error);
    showToast('❌ Erro ao deletar dashboard', 'error');
  }
}
// ============================================================================
// WIDGET GALLERY
// ============================================================================
function openWidgetGallery() {
  const modal = document.getElementById('widget-gallery-modal');
  if (!modal) return;
 
  const grid = document.getElementById('widget-gallery-grid');
  if (grid) {
    grid.innerHTML = DashboardAdvancedState.availableWidgets.map(widget => `
      <div class="widget-gallery-item" onclick="window.DashboardAdvanced.addWidget('${widget.id}')">
        <div class="widget-icon">${widget.icon}</div>
        <div class="widget-name">${widget.name}</div>
        <div class="widget-description">${widget.type}</div>
      </div>
    `).join('');
  }
 
  modal.classList.add('active');
}
function closeWidgetGallery() {
  const modal = document.getElementById('widget-gallery-modal');
  if (modal) modal.classList.remove('active');
}
// ============================================================================
// NOTIFICATIONS CENTER
// ============================================================================
function toggleNotifications() {
  const dropdown = document.getElementById('notifications-dropdown');
  if (!dropdown) return;
 
  dropdown.classList.toggle('active');
 
  // Renderizar notificações
  const listEl = document.getElementById('notifications-list');
  if (listEl) {
    if (DashboardAdvancedState.notifications.length === 0) {
      listEl.innerHTML = '<p class="text-center text-gray-500 py-8">Nenhuma notificação</p>';
    } else {
      listEl.innerHTML = DashboardAdvancedState.notifications.map(notif => `
        <div class="notification-item ${notif.is_read ? '' : 'unread'}">
          <div class="notification-title">${notif.title}</div>
          <div class="notification-message">${notif.message}</div>
          <div class="notification-time">${getRelativeTime(notif.created_at)}</div>
        </div>
      `).join('');
    }
  }
}
function updateNotificationBadge() {
  const badge = document.getElementById('notification-badge');
  if (badge) {
    const unreadCount = DashboardAdvancedState.notifications.filter(n => !n.is_read).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }
}
async function markAllAsRead() {
  try {
    const userId = window.DashboardApp.state.user?.id;
    if (!userId) return;
   
    await window.AlshamSupabase.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
   
    DashboardAdvancedState.notifications.forEach(n => n.is_read = true);
    updateNotificationBadge();
    toggleNotifications();
    showToast('✅ Todas as notificações marcadas como lidas', 'success');
   
  } catch (error) {
    console.error('❌ Erro ao marcar notificações:', error);
  }
}
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
 
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}m atrás`;
 
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
 
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d atrás`;
 
  return date.toLocaleDateString('pt-BR');
}
// ============================================================================
// CURRENCY & TIMEZONE
// ============================================================================
function changeCurrency(currency) {
  DashboardAdvancedState.currency = currency;
  console.log(`💱 Moeda alterada para: ${currency}`);
 
  // Salvar preferência
  localStorage.setItem('alsham-currency', currency);
 
  // Recarregar dashboard com nova moeda
  if (window.DashboardApp?.refresh) {
    window.DashboardApp.refresh();
  }
 
  showToast(`Moeda alterada para ${currency}`, 'success');
}
function changeTimezone(timezone) {
  DashboardAdvancedState.timezone = timezone;
  console.log(`🌍 Timezone alterado para: ${timezone}`);
 
  // Salvar preferência
  localStorage.setItem('alsham-timezone', timezone);
 
  // Recarregar dashboard com novo timezone
  if (window.DashboardApp?.refresh) {
    window.DashboardApp.refresh();
  }
 
  showToast(`Timezone alterado para ${timezone}`, 'success');
}

// ============================================================================
// SAVED FILTERS
// ============================================================================
async function saveCurrentFilters() {
  const name = prompt('Nome do filtro:');
  if (!name) return;
 
  try {
    const filters = window.DashboardApp.state.filters;
   
    await window.AlshamSupabase.genericInsert('saved_filters', {
      name,
      user_id: window.DashboardApp.state.user.id,
      org_id: window.DashboardApp.state.orgId,
      filters: JSON.stringify(filters)
    });
   
    showToast('✅ Filtro salvo com sucesso!', 'success');
    await loadAdvancedData();
    renderSavedFilters();
   
  } catch (error) {
    console.error('❌ Erro ao salvar filtro:', error);
    showToast('❌ Erro ao salvar filtro', 'error');
  }
}
function renderSavedFilters() {
  const container = document.getElementById('saved-filters-list');
  if (!container) return;
 
  const filtersContainer = document.getElementById('saved-filters-container');
  if (filtersContainer && DashboardAdvancedState.savedFilters.length > 0) {
    filtersContainer.classList.remove('hidden');
  }
 
  if (DashboardAdvancedState.savedFilters.length === 0) {
    container.innerHTML = '';
    return;
  }
 
  container.innerHTML = DashboardAdvancedState.savedFilters.map(filter => `
    <div class="saved-filter-tag" onclick="window.DashboardAdvanced.applySavedFilter('${filter.id}')">
      <span>${filter.name}</span>
      <button class="remove-filter" onclick="event.stopPropagation(); window.DashboardAdvanced.deleteSavedFilter('${filter.id}')">
        ✕
      </button>
    </div>
  `).join('');
}
async function applySavedFilter(filterId) {
  const filter = DashboardAdvancedState.savedFilters.find(f => f.id === filterId);
  if (!filter) return;
 
  try {
    const filters = JSON.parse(filter.filters);
    window.DashboardApp.state.filters = filters;
   
    // Atualizar UI
    if (filters.dateRange) {
      const dateSelect = document.getElementById('date-filter');
      if (dateSelect) dateSelect.value = filters.dateRange;
    }
   
    if (filters.search) {
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = filters.search;
    }
   
    // Aplicar e renderizar
    if (window.DashboardApp.refresh) {
      await window.DashboardApp.refresh();
    }
   
    showToast(`✅ Filtro "${filter.name}" aplicado`, 'success');
   
  } catch (error) {
    console.error('❌ Erro ao aplicar filtro:', error);
    showToast('❌ Erro ao aplicar filtro', 'error');
  }
}
async function deleteSavedFilter(filterId) {
  if (!confirm('Deletar este filtro salvo?')) return;
 
  try {
    await window.AlshamSupabase.genericDelete('saved_filters', { id: filterId });
   
    showToast('✅ Filtro deletado', 'success');
    await loadAdvancedData();
    renderSavedFilters();
   
  } catch (error) {
    console.error('❌ Erro ao deletar filtro:', error);
  }
}
// ============================================================================
// COHORT ANALYSIS
// ============================================================================
function openCohortModal() {
  const modal = document.getElementById('cohort-modal');
  if (!modal) return;
 
  // Calcular cohort
  const cohortData = calculateCohort();
 
  // Renderizar tabela
  const container = document.getElementById('cohort-table-container');
  if (container) {
    container.innerHTML = renderCohortTable(cohortData);
  }
 
  modal.classList.add('active');
}
function closeCohortModal() {
  const modal = document.getElementById('cohort-modal');
  if (modal) modal.classList.remove('active');
}
function calculateCohort() {
  const leads = window.DashboardApp?.state?.leads || [];
  const cohorts = {};
 
  // Agrupar por mês de criação
  leads.forEach(lead => {
    const cohortMonth = new Date(lead.created_at).toISOString().slice(0, 7); // YYYY-MM
    if (!cohorts[cohortMonth]) {
      cohorts[cohortMonth] = {
        total: 0,
        retained: {}
      };
    }
    cohorts[cohortMonth].total++;
  });
 
  // Calcular retenção (simplificado - assumindo lead ativo = não perdido)
  Object.keys(cohorts).forEach(cohortMonth => {
    const cohortLeads = leads.filter(l =>
      new Date(l.created_at).toISOString().slice(0, 7) === cohortMonth
    );
   
    for (let month = 0; month <= 6; month++) {
      const activeLeads = cohortLeads.filter(l => l.status !== 'perdido').length;
      cohorts[cohortMonth].retained[month] = Math.round((activeLeads / cohorts[cohortMonth].total) * 100);
    }
  });
 
  return cohorts;
}
function renderCohortTable(cohortData) {
  const cohortMonths = Object.keys(cohortData).sort().reverse().slice(0, 12); // Últimos 12 meses
 
  if (cohortMonths.length === 0) {
    return '<p class="text-center text-gray-500 py-8">Dados insuficientes para análise de cohort</p>';
  }
 
  let html = '<table class="cohort-table"><thead><tr>';
  html += '<th>Cohort</th>';
  for (let i = 0; i <= 6; i++) {
    html += `<th>Mês ${i}</th>`;
  }
  html += '</tr></thead><tbody>';
 
  cohortMonths.forEach(cohortMonth => {
    const data = cohortData[cohortMonth];
    html += `<tr><td><strong>${formatCohortMonth(cohortMonth)}</strong><br><small>${data.total} leads</small></td>`;
   
    for (let i = 0; i <= 6; i++) {
      const value = data.retained[i] || 0;
      const colorClass = value >= 80 ? 'cohort-high' : value >= 50 ? 'cohort-medium' : 'cohort-low';
      html += `<td class="cohort-cell ${colorClass}">${value}%</td>`;
    }
   
    html += '</tr>';
  });
 
  html += '</tbody></table>';
  return html;
}
function formatCohortMonth(monthStr) {
  const [year, month] = monthStr.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(month) - 1]} ${year}`;
}
// ============================================================================
// MAPAS GEOGRÁFICOS (LEAFLET.JS)
// ============================================================================
function openMapModal() {
  const modal = document.getElementById('map-modal');
  if (!modal) return;
 
  modal.classList.add('active');
 
  // Aguardar modal abrir antes de inicializar mapa
  setTimeout(() => {
    initializeMap();
  }, 100);
}
function closeMapModal() {
  const modal = document.getElementById('map-modal');
  if (modal) modal.classList.remove('active');
}
function initializeMap() {
  if (typeof L === 'undefined') {
    console.error('❌ Leaflet.js não carregado');
    showToast('❌ Biblioteca de mapas não disponível', 'error');
    return;
  }
 
  const container = document.getElementById('map-container');
  if (!container) return;
 
  // Limpar mapa anterior se existir
  container.innerHTML = '';
 
  // Criar mapa centrado no Brasil
  const map = L.map('map-container').setView([-15.7801, -47.9292], 4);
 
  // Adicionar tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);
 
  // Adicionar markers dos leads
  const leads = window.DashboardApp?.state?.filteredLeads || [];
  const markersData = getLeadsGeoData(leads);
 
  markersData.forEach(location => {
    const marker = L.marker([location.lat, location.lng]).addTo(map);
    marker.bindPopup(`
      <strong>${location.city}</strong><br>
      ${location.count} lead(s)
    `);
  });
 
  // Cluster se muitos markers
  if (markersData.length > 0) {
    const bounds = L.latLngBounds(markersData.map(loc => [loc.lat, loc.lng]));
    map.fitBounds(bounds);
  }
}
function getLeadsGeoData(leads) {
  // Dados fictícios para demonstração (em produção, buscar do banco ou API)
  const cities = {
    'São Paulo': { lat: -23.5505, lng: -46.6333, count: 0 },
    'Rio de Janeiro': { lat: -22.9068, lng: -43.1729, count: 0 },
    'Brasília': { lat: -15.7801, lng: -47.9292, count: 0 },
    'Belo Horizonte': { lat: -19.9167, lng: -43.9345, count: 0 },
    'Fortaleza': { lat: -3.7172, lng: -38.5433, count: 0 }
  };
 
  // Distribuir leads ficticiamente entre as cidades
  leads.forEach((lead, index) => {
    const cityKeys = Object.keys(cities);
    const randomCity = cityKeys[index % cityKeys.length];
    cities[randomCity].count++;
  });
 
  return Object.entries(cities)
    .filter(([_, data]) => data.count > 0)
    .map(([city, data]) => ({
      city,
      lat: data.lat,
      lng: data.lng,
      count: data.count
    }));
}
// ============================================================================
// HEATMAPS
// ============================================================================
function openHeatmapModal() {
  const modal = document.getElementById('heatmap-modal');
  if (!modal) return;
 
  modal.classList.add('active');
 
  setTimeout(() => {
    initializeHeatmap();
  }, 100);
}
function closeHeatmapModal() {
  const modal = document.getElementById('heatmap-modal');
  if (modal) modal.classList.remove('active');
}
function initializeHeatmap() {
  if (typeof h337 === 'undefined') {
    console.error('❌ Heatmap.js não carregado');
    showToast('❌ Biblioteca de heatmap não disponível', 'error');
    return;
  }
 
  const container = document.getElementById('heatmap-container');
  if (!container) return;
 
  // Limpar container
  container.innerHTML = '';
 
  // Criar heatmap
  const heatmapInstance = h337.create({
    container: container,
    radius: 40,
    maxOpacity: 0.6,
    minOpacity: 0.1,
    blur: 0.75
  });
 
  // Gerar dados de atividades (simulado)
  const leads = window.DashboardApp?.state?.filteredLeads || [];
  const points = generateHeatmapData(leads, container.offsetWidth, container.offsetHeight);
 
  heatmapInstance.setData({
    max: Math.max(...points.map(p => p.value)),
    data: points
  });
}
function generateHeatmapData(leads, width, height) {
  // Gerar pontos baseados em atividades dos leads (simulado)
  const points = [];
  const hoursInDay = 24;
  const daysInWeek = 7;
 
  // Criar grid de horas x dias
  for (let day = 0; day < daysInWeek; day++) {
    for (let hour = 0; hour < hoursInDay; hour++) {
      const x = (hour / hoursInDay) * width;
      const y = (day / daysInWeek) * height;
     
      // Simular atividade (em produção, usar dados reais)
      const activity = Math.random() * leads.length;
     
      points.push({
        x: Math.round(x),
        y: Math.round(y),
        value: Math.round(activity)
      });
    }
  }
 
  return points;
}
// ============================================================================
// LAYOUT TEMPLATES
// ============================================================================
function openLayoutTemplates() {
  const modal = document.getElementById('layout-templates-modal');
  if (modal) modal.classList.add('active');
}
function closeLayoutTemplates() {
  const modal = document.getElementById('layout-templates-modal');
  if (modal) modal.classList.remove('active');
}
function applyLayoutTemplate(templateId) {
  const template = DashboardAdvancedState.layoutTemplates[templateId];
  if (!template) return;
 
  console.log(`🎨 Aplicando template: ${template.name}`);
  showToast(`✅ Template "${template.name}" aplicado`, 'success');
  closeLayoutTemplates();
 
  // Limpar grid
  DashboardAdvancedState.gridstack.removeAll();
  DashboardAdvancedState.widgets = [];
 
  // Adicionar widgets do template
  template.widgets.forEach(widgetId => {
    addWidget(widgetId);
  });
 
  // Salvar novo layout
  saveCurrentLayout();
}
// ============================================================================
// EXPORT POWERPOINT (já implementado no dashboard.js)
// ============================================================================
async function exportPowerPoint() {
  // Delegar para função do dashboard principal
  if (window.DashboardApp?.exportPowerPoint) {
    await window.DashboardApp.exportPowerPoint();
  } else {
    showToast('⚠️ Export PowerPoint não disponível', 'warning');
  }
}
// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================
function setupKeyboardShortcuts() {
  let lastKey = '';
  let lastKeyTime = 0;
 
  document.addEventListener('keydown', (e) => {
    const now = Date.now();
    const timeSinceLastKey = now - lastKeyTime;
   
    // ESC - Fechar modais
    if (e.key === 'Escape') {
      closeAllModals();
      return;
    }
   
    // Ctrl/Cmd + K - Command Palette (futuro)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      showToast('Command Palette (Em desenvolvimento)', 'info');
      return;
    }
   
    // ? - Ajuda
    if (e.key === '?') {
      e.preventDefault();
      const shortcutsModal = document.getElementById('shortcuts-modal');
      if (shortcutsModal) shortcutsModal.classList.add('active');
      return;
    }
   
    // Atalhos em sequência (G + X)
    if (timeSinceLastKey < 1000) {
      // G + D - Dashboard
      if (lastKey === 'g' && e.key === 'd') {
        window.location.href = '/dashboard.html';
        return;
      }
     
      // G + L - Leads
      if (lastKey === 'g' && e.key === 'l') {
        window.location.href = '/leads-real.html';
        return;
      }
     
      // G + P - Pipeline
      if (lastKey === 'g' && e.key === 'p') {
        window.location.href = '/pipeline.html';
        return;
      }
    }
   
    lastKey = e.key.toLowerCase();
    lastKeyTime = now;
  });
 
  console.log('⌨️ Keyboard shortcuts ativados');
}
function closeAllModals() {
  document.querySelectorAll('.modal.active').forEach(modal => {
    modal.classList.remove('active');
  });
 
  // Fechar dropdowns também
  document.querySelectorAll('.dashboard-switcher-dropdown.active, .notifications-dropdown.active').forEach(dropdown => {
    dropdown.classList.remove('active');
  });
}
// ============================================================================
// UTILITIES
// ============================================================================
function showToast(message, type = 'info') {
  // Usar a função do dashboard principal se disponível
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// ============================================================================
// API PÚBLICA
// ============================================================================
window.DashboardAdvanced = {
  init: initAdvanced,
  openDrillDown,
  closeDrillDown,
  toggleDashboardDropdown,
  switchDashboard,
  openDashboardManager,
  closeDashboardManager,
  createNewDashboard,
  deleteDashboard,
  openWidgetGallery,
  closeWidgetGallery,
  addWidget,
  toggleNotifications,
  markAllAsRead,
  changeCurrency,
  changeTimezone,
  saveCurrentFilters,
  applySavedFilter,
  deleteSavedFilter,
  openCohortModal,
  closeCohortModal,
  openMapModal,
  closeMapModal,
  openHeatmapModal,
  closeHeatmapModal,
  openLayoutTemplates,
  closeLayoutTemplates,
  applyLayoutTemplate,
  exportPowerPoint
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.DashboardAdvanced?.init) {
    window.DashboardAdvanced.init();
  }
});

console.log('✅ Dashboard Advanced v11.1 - Completo');
