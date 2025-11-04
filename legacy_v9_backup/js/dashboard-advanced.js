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
        return `<span class="font-bold">${item}</span>`;
      }
      return `<a href="#" class="text-blue-600 hover:underline">${item}</a> /`;
    }).join(' ');
  }

  // Título
  const titleEl = document.getElementById('drill-down-title');
  if (titleEl) titleEl.textContent = title;

  // Conteúdo
  const contentEl = document.getElementById('drill-down-content');
  if (!contentEl) return;

  if (!data || data.length === 0) {
    contentEl.innerHTML = `<p class="text-gray-500">Nenhum dado disponível</p>`;
  } else {
    // Gerar tabela
    const headers = Object.keys(data[0]);
    const tableHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              ${headers.map(h => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            ${data.map(row => `
              <tr>
                ${headers.map(h => `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${row[h] || 'N/A'}</td>`).join('')}
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
      listContainer.innerHTML = `<p class="text-gray-500">Nenhum dashboard salvo</p>`;
    } else {
      listContainer.innerHTML = DashboardAdvancedState.dashboards.map(dash => `
        <div class="flex items-center justify-between p-4 border-b">
          <div>
            <h4 class="font-semibold">${dash.name}</h4>
            <p class="text-sm text-gray-500">${new Date(dash.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <button onclick="window.DashboardAdvanced.deleteDashboard('${dash.id}')" class="text-red-600 hover:text-red-800">Excluir</button>
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
  const nameInput = document.getElementById('new-dashboard-name');
  if (!nameInput || !nameInput.value.trim()) {
    showToast('Nome do dashboard obrigatório', 'error');
    return;
  }

  const name = nameInput.value.trim();

  try {
    const { data } = await window.AlshamSupabase.genericInsert('saved_dashboards', {
      org_id: window.DashboardApp.state.orgId,
      user_id: window.DashboardApp.state.user.id,
      name,
      layout: [] // Layout vazio inicialmente
    });

    DashboardAdvancedState.dashboards.push(data[0]);
    showToast(`Dashboard "${name}" criado!`, 'success');
    closeDashboardManager();
    nameInput.value = '';

    // Atualizar lista se modal aberto
    openDashboardManager(); // Re-render

  } catch (error) {
    console.error('❌ Erro ao criar dashboard:', error);
    showToast('Erro ao criar dashboard', 'error');
  }
}

async function deleteDashboard(dashboardId) {
  if (!confirm('Excluir este dashboard?')) return;

  try {
    await window.AlshamSupabase.genericDelete('saved_dashboards', { id: dashboardId });
    DashboardAdvancedState.dashboards = DashboardAdvancedState.dashboards.filter(d => d.id !== dashboardId);
    showToast('Dashboard excluído', 'success');
    openDashboardManager(); // Re-render

  } catch (error) {
    console.error('❌ Erro ao excluir dashboard:', error);
    showToast('Erro ao excluir dashboard', 'error');
  }
}

// ============================================================================
// WIDGET GALLERY
// ============================================================================
function openWidgetGallery() {
  const modal = document.getElementById('widget-gallery-modal');
  if (!modal) return;

  // Renderizar gallery
  const galleryContainer = document.getElementById('widget-gallery');
  if (galleryContainer) {
    galleryContainer.innerHTML = DashboardAdvancedState.availableWidgets.map(widget => `
      <div class="widget-card" onclick="window.DashboardAdvanced.addWidgetFromGallery('${widget.id}')">
        <div class="widget-icon">${widget.icon}</div>
        <h3 class="widget-name">${widget.name}</h3>
      </div>
    `).join('');
  }

  modal.classList.add('active');
}

function closeWidgetGallery() {
  const modal = document.getElementById('widget-gallery-modal');
  if (modal) modal.classList.remove('active');
}

function addWidgetFromGallery(widgetId) {
  console.log(`➕ Adicionando widget: ${widgetId}`);
  closeWidgetGallery();
  addWidget(widgetId); // Chama a função principal de addWidget
}

// ============================================================================
// NOTIFICAÇÕES
// ============================================================================
function setupNotifications() {
  updateNotificationBadge();
}

function toggleNotifications() {
  const dropdown = document.getElementById('notifications-dropdown');
  if (!dropdown) return;

  dropdown.classList.toggle('active');

  if (dropdown.classList.contains('active')) {
    renderNotifications();
  }
}

function renderNotifications() {
  const listContainer = document.getElementById('notifications-list');
  if (!listContainer) return;

  if (DashboardAdvancedState.notifications.length === 0) {
    listContainer.innerHTML = `<p class="p-4 text-gray-500">Nenhuma notificação</p>`;
  } else {
    listContainer.innerHTML = DashboardAdvancedState.notifications.map(notif => `
      <div class="p-4 border-b flex items-start">
        <div class="flex-1">
          <h4 class="font-semibold">${notif.title}</h4>
          <p class="text-sm text-gray-600">${notif.message}</p>
          <p class="text-xs text-gray-400 mt-1">${new Date(notif.created_at).toLocaleString('pt-BR')}</p>
        </div>
        <button onclick="markAsRead('${notif.id}')" class="ml-4 text-blue-600 hover:text-blue-800 text-sm">Marcar lida</button>
      </div>
    `).join('');
  }
}

async function markAllAsRead() {
  try {
    await window.AlshamSupabase.genericUpdate('notifications', { is_read: true }, {
      user_id: window.DashboardApp.state.user.id,
      is_read: false
    });
    DashboardAdvancedState.notifications = [];
    updateNotificationBadge();
    renderNotifications();
    showToast('Todas notificações marcadas como lidas', 'success');
  } catch (error) {
    console.error('❌ Erro ao marcar como lidas:', error);
  }
}

function updateNotificationBadge() {
  const badge = document.getElementById('notifications-badge');
  if (!badge) return;

  const count = DashboardAdvancedState.notifications.length;
  badge.textContent = count > 0 ? count : '';
  badge.classList.toggle('hidden', count === 0);
}

// ============================================================================
// CURRENCY & TIMEZONE
// ============================================================================
function changeCurrency(currency) {
  DashboardAdvancedState.currency = currency;
  // Atualizar todos os valores monetários no dashboard
  document.querySelectorAll('[data-currency]').forEach(el => {
    const value = parseFloat(el.dataset.value);
    el.textContent = formatCurrency(value, currency);
  });
  showToast(`Moeda alterada para ${currency}`, 'success');
}

function changeTimezone(timezone) {
  DashboardAdvancedState.timezone = timezone;
  // Atualizar datas
  document.querySelectorAll('[data-timestamp]').forEach(el => {
    const timestamp = parseInt(el.dataset.timestamp);
    el.textContent = new Date(timestamp).toLocaleString('pt-BR', { timeZone: timezone });
  });
  showToast(`Fuso horário alterado para ${timezone}`, 'success');
}

// ============================================================================
// SAVED FILTERS
// ============================================================================
async function saveCurrentFilters() {
  const name = prompt('Nome para o filtro salvo:');
  if (!name) return;

  try {
    const { data } = await window.AlshamSupabase.genericInsert('saved_filters', {
      org_id: window.DashboardApp.state.orgId,
      user_id: window.DashboardApp.state.user.id,
      name,
      filters: DashboardState.filters // Do dashboard principal
    });

    DashboardAdvancedState.savedFilters.push(data[0]);
    showToast(`Filtro "${name}" salvo!`, 'success');
  } catch (error) {
    console.error('❌ Erro ao salvar filtro:', error);
  }
}

function applySavedFilter(filterId) {
  const filter = DashboardAdvancedState.savedFilters.find(f => f.id === filterId);
  if (!filter) return;

  DashboardState.filters = filter.filters;
  applyFilters(); // Do dashboard principal
  renderDashboard();
  showToast(`Filtro "${filter.name}" aplicado`, 'success');
}

async function deleteSavedFilter(filterId) {
  if (!confirm('Excluir este filtro?')) return;

  try {
    await window.AlshamSupabase.genericDelete('saved_filters', { id: filterId });
    DashboardAdvancedState.savedFilters = DashboardAdvancedState.savedFilters.filter(f => f.id !== filterId);
    showToast('Filtro excluído', 'success');
  } catch (error) {
    console.error('❌ Erro ao excluir filtro:', error);
  }
}

// ============================================================================
// ANÁLISE DE COHORT
// ============================================================================
function openCohortModal() {
  const modal = document.getElementById('cohort-modal');
  if (!modal) return;

  renderCohortAnalysis();
  modal.classList.add('active');
}

function closeCohortModal() {
  const modal = document.getElementById('cohort-modal');
  if (modal) modal.classList.remove('active');
}

async function renderCohortAnalysis() {
  const container = document.getElementById('cohort-table');
  if (!container) return;

  try {
    // Buscar dados de cohort do Supabase (simulado por agora)
    const cohortData = await getCohortData();
    container.innerHTML = generateCohortTable(cohortData);
  } catch (error) {
    console.error('❌ Erro ao renderizar cohort:', error);
    container.innerHTML = '<p>Erro ao carregar análise</p>';
  }
}

async function getCohortData() {
  // Em produção: Query Supabase para cohort retention
  // Simulado:
  return [
    { month: '2025-01', size: 100, retained: [100, 80, 60, 50, 40, 30, 25] },
    { month: '2025-02', size: 120, retained: [100, 85, 65, 55, 45, 35] },
    { month: '2025-03', size: 150, retained: [100, 90, 70, 60, 50] },
    { month: '2025-04', size: 180, retained: [100, 82, 62, 52] },
    { month: '2025-05', size: 200, retained: [100, 78, 58] },
    { month: '2025-06', size: 220, retained: [100, 75] },
    { month: '2025-07', size: 250, retained: [100] }
  ];
}

function generateCohortTable(data) {
  let html = `
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead>
        <tr>
          <th class="px-4 py-2">Cohort</th>
          <th class="px-4 py-2">Tamanho</th>
          <th class="px-4 py-2">Mês 0</th>
          <th class="px-4 py-2">Mês 1</th>
          <th class="px-4 py-2">Mês 2</th>
          <th class="px-4 py-2">Mês 3</th>
          <th class="px-4 py-2">Mês 4</th>
          <th class="px-4 py-2">Mês 5</th>
          <th class="px-4 py-2">Mês 6</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(cohort => {
    html += `
      <tr>
        <td class="px-4 py-2">${formatCohortMonth(cohort.month)}</td>
        <td class="px-4 py-2">${cohort.size}</td>
    `;

    for (let i = 0; i <= 6; i++) {
      const value = cohort.retained[i] || 0;
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
  addWidgetFromGallery,
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
