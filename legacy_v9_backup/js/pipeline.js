/**
 * 🎯 ALSHAM 360° PRIMA - Pipeline de Vendas (Kanban Board)
 * @version 9.0.0 - 100% COMPLETO ✅
 * @author ALSHAM Development Team
 * @features CRUD + Realtime + Gamificação + Export CSV + Filtros + Busca
 */

console.log('🎯 Pipeline v9.0 carregando...');

// ============================================================================
// IMPORTS & SETUP
// ============================================================================
let supabase, showNotification;

async function waitForDependencies() {
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    if (window.AlshamSupabase?.supabase) {
      supabase = window.AlshamSupabase.supabase;
      showNotification = window.showNotification || console.log;
      console.log('✅ Pipeline: Dependências carregadas');
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  throw new Error('Timeout: Supabase não carregou');
}

// ============================================================================
// CONSTANTS & STATE
// ============================================================================
const COLUNAS = [
  { id: 'qualificacao', nome: 'Qualificação', color: '#3B82F6' },
  { id: 'proposta', nome: 'Proposta', color: '#F59E0B' },
  { id: 'negociacao', nome: 'Negociação', color: '#8B5CF6' },
  { id: 'fechado_ganho', nome: 'Fechado Ganho', color: '#10B981' },
  { id: 'perdido', nome: 'Perdido', color: '#EF4444' }
];

const PipelineState = {
  opportunities: [],
  filteredOpportunities: [],
  draggedCard: null,
  orgId: null,
  userId: null,
  isLoading: false,
  filters: {
    search: '',
    stages: [],
    valorMin: 0,
    valorMax: 999999,
    probMin: 0,
    probMax: 100,
    dateRange: 'all'
  }
};

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
async function initPipeline() {
  try {
    PipelineState.isLoading = true;
    showLoading(true);
    
    console.log('🚀 Iniciando Pipeline v9.0...');
    
    await waitForDependencies();
    
    PipelineState.orgId = await window.AlshamSupabase.getCurrentOrgId();
    if (typeof window.AlshamSupabase.getCurrentUser === 'function') {
      const user = await window.AlshamSupabase.getCurrentUser();
      PipelineState.userId = user?.id;
    }
    
    console.log('📍 Org ID:', PipelineState.orgId);
    
    if (!PipelineState.orgId) {
      throw new Error('Org ID não encontrado');
    }
    
    await loadOpportunities();
    applyFilters();
    renderBoard();
    setupRealtime();
    addHeaderButtons();
    await awardPoints('pipeline_access', 5);
    
    showLoading(false);
    console.log('✅ Pipeline v9.0 inicializado - 100% completo');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar pipeline:', error);
    showError(error.message);
  } finally {
    PipelineState.isLoading = false;
  }
}

// ============================================================================
// DATA LOADING
// ============================================================================
async function loadOpportunities() {
  try {
    console.log('📥 Carregando oportunidades...');
    
    const { data, error } = await supabase
      .from('sales_opportunities')
      .select('*')
      .eq('org_id', PipelineState.orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    PipelineState.opportunities = data || [];
    console.log(`📊 ${PipelineState.opportunities.length} oportunidades carregadas`);
    
    return PipelineState.opportunities;
  } catch (error) {
    console.error('❌ Erro ao carregar oportunidades:', error);
    showNotification(`Erro ao carregar: ${error.message}`, 'error', 4000);
    return [];
  }
}

// ============================================================================
// FILTROS & BUSCA
// ============================================================================
function applyFilters() {
  let filtered = [...PipelineState.opportunities];
  
  // Busca por texto
  if (PipelineState.filters.search.trim()) {
    const search = PipelineState.filters.search.toLowerCase();
    filtered = filtered.filter(opp => 
      (opp.titulo || '').toLowerCase().includes(search) ||
      (opp.valor || '').toString().includes(search)
    );
  }
  
  // Filtro por estágios
  if (PipelineState.filters.stages.length > 0) {
    filtered = filtered.filter(opp => 
      PipelineState.filters.stages.includes(opp.status)
    );
  }
  
  // Filtro por valor
  filtered = filtered.filter(opp => {
    const valor = parseFloat(opp.valor) || 0;
    return valor >= PipelineState.filters.valorMin && valor <= PipelineState.filters.valorMax;
  });
  
  // Filtro por probabilidade
  filtered = filtered.filter(opp => {
    const prob = parseInt(opp.probabilidade) || 0;
    return prob >= PipelineState.filters.probMin && prob <= PipelineState.filters.probMax;
  });
  
  // Filtro por data
  if (PipelineState.filters.dateRange !== 'all') {
    const now = new Date();
    let startDate;
    
    switch(PipelineState.filters.dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }
    
    if (startDate) {
      filtered = filtered.filter(opp => 
        new Date(opp.created_at) >= startDate
      );
    }
  }
  
  PipelineState.filteredOpportunities = filtered;
  updateFilterCount();
  return filtered;
}

function updateFilterCount() {
  const total = PipelineState.opportunities.length;
  const filtered = PipelineState.filteredOpportunities.length;
  
  const countEl = document.getElementById('filter-count');
  if (countEl) {
    if (filtered < total) {
      countEl.textContent = `${filtered} de ${total} oportunidades`;
      countEl.style.display = 'inline';
    } else {
      countEl.style.display = 'none';
    }
  }
}

// Debounce para busca
let searchTimeout;
function handleSearch(value) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    PipelineState.filters.search = value;
    applyFilters();
    renderBoard();
  }, 300);
}

// ============================================================================
// RENDERING
// ============================================================================
function renderBoard() {
  const board = document.getElementById('pipeline-board');
  if (!board) {
    console.warn('⚠️ Container pipeline-board não encontrado');
    return;
  }
  
  const oppsToRender = PipelineState.filteredOpportunities;
  
  board.innerHTML = COLUNAS.map(col => {
    const opps = oppsToRender.filter(o => o.status === col.id);
    const total = opps.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
    
    return `
      <div class="pipeline-column" data-stage="${col.id}">
        <div class="pipeline-column-header" style="border-bottom-color: ${col.color};">
          <h3>${col.nome}</h3>
          <div class="pipeline-column-stats">
            <span>R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span class="deal-count">${opps.length}</span>
          </div>
        </div>
        <div class="pipeline-column-body" data-column-id="${col.id}">
          ${opps.length > 0 
            ? opps.map(opp => createCard(opp)).join('') 
            : '<div style="padding: 2rem; text-align: center; color: #9CA3AF; font-size: 0.875rem;">Nenhuma oportunidade</div>'}
        </div>
      </div>
    `;
  }).join('');
  
  attachDragListeners();
  updateTotalDisplay();
}

function createCard(opp) {
  return `
    <div class="opportunity-card" draggable="true" data-opportunity-id="${opp.id}">
      <div style="margin-bottom: 0.75rem;">
        <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--alsham-text-primary, #111827);">
          ${escapeHtml(opp.titulo || 'Sem título')}
        </h4>
        <p style="font-size: 1.25rem; font-weight: 700; color: #3B82F6; margin: 0;">
          R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: var(--alsham-text-secondary, #6B7280);">
        <span>${opp.probabilidade || 0}% prob.</span>
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="window.PipelineApp.editOpp('${opp.id}')" 
                  style="background: none; border: none; color: #3B82F6; cursor: pointer; padding: 0.25rem 0.5rem; font-size: 0.875rem;">
            ✏️ Editar
          </button>
          <button onclick="window.PipelineApp.deleteOpp('${opp.id}')" 
                  style="background: none; border: none; color: #EF4444; cursor: pointer; padding: 0.25rem 0.5rem; font-size: 0.875rem;">
            🗑️ Deletar
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// DRAG & DROP
// ============================================================================
function attachDragListeners() {
  document.querySelectorAll('.opportunity-card').forEach(card => {
    card.addEventListener('dragstart', () => {
      PipelineState.draggedCard = card;
      card.style.opacity = '0.5';
      card.classList.add('dragging');
    });
    
    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      card.classList.remove('dragging');
      PipelineState.draggedCard = null;
    });
  });

  document.querySelectorAll('.pipeline-column-body').forEach(column => {
    column.addEventListener('dragover', e => {
      e.preventDefault();
      column.classList.add('drag-over');
    });
    
    column.addEventListener('dragleave', () => {
      column.classList.remove('drag-over');
    });
    
    column.addEventListener('drop', async (e) => {
      e.preventDefault();
      column.classList.remove('drag-over');
      
      if (!PipelineState.draggedCard) return;
      
      const targetStage = column.dataset.columnId;
      const oppId = PipelineState.draggedCard.dataset.opportunityId;
      const opp = PipelineState.opportunities.find(o => o.id == oppId);
      
      if (!opp || opp.status === targetStage) return;
      
      column.appendChild(PipelineState.draggedCard);
      
      try {
        const { error } = await supabase
          .from('sales_opportunities')
          .update({ 
            status: targetStage, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', oppId);
        
        if (error) throw error;
        
        showNotification('✅ Oportunidade movida com sucesso!', 'success', 2000);
        await awardPoints('pipeline_move_card', 5);
        
        await loadOpportunities();
        applyFilters();
        renderBoard();
      } catch (error) {
        showNotification(`❌ Erro ao mover: ${error.message}`, 'error', 3000);
        await loadOpportunities();
        applyFilters();
        renderBoard();
      }
    });
  });
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================
async function createOpp() {
  const modal = createModal('Criar Oportunidade', `
    <form id="create-form" style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Título *</label>
        <input type="text" id="new-titulo" required 
               style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
      </div>
      
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Valor (R$) *</label>
        <input type="number" id="new-valor" required step="0.01" min="0"
               style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
      </div>
      
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Probabilidade (%)</label>
        <input type="number" id="new-prob" min="0" max="100" value="50"
               style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
      </div>
      
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Estágio</label>
        <select id="new-status" 
                style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
          ${COLUNAS.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
        </select>
      </div>
      
      <div style="display: flex; gap: 1rem; margin-top: 1rem;">
        <button type="submit" 
                style="flex: 1; padding: 0.75rem; background: #3B82F6; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 1rem;">
          ✅ Criar
        </button>
        <button type="button" onclick="window.PipelineApp.closeModal()" 
                style="flex: 1; padding: 0.75rem; background: #F3F4F6; color: #374151; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 1rem;">
          Cancelar
        </button>
      </div>
    </form>
  `);
  
  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titulo = document.getElementById('new-titulo').value.trim();
    const valor = parseFloat(document.getElementById('new-valor').value) || 0;
    const probabilidade = parseInt(document.getElementById('new-prob').value) || 0;
    const status = document.getElementById('new-status').value;
    
    if (!titulo) {
      showNotification('❌ Título é obrigatório', 'error', 2000);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('sales_opportunities')
        .insert({
          titulo,
          valor,
          probabilidade,
          status,
          org_id: PipelineState.orgId,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      showNotification('✅ Oportunidade criada!', 'success', 2000);
      await awardPoints('pipeline_create_opp', 10);
      
      closeModal();
      await loadOpportunities();
      applyFilters();
      renderBoard();
    } catch (error) {
      showNotification(`❌ Erro: ${error.message}`, 'error', 3000);
    }
  });
}

async function editOpp(id) {
  const opp = PipelineState.opportunities.find(o => o.id == id);
  if (!opp) return;
  
  const modal = createModal('Editar Oportunidade', `
    <form id="edit-form" style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Título *</label>
        <input type="text" id="edit-titulo" value="${escapeHtml(opp.titulo || '')}" required 
               style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
      </div>
      
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Valor (R$) *</label>
        <input type="number" id="edit-valor" value="${opp.valor || 0}" required step="0.01" min="0"
               style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
      </div>
      
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Probabilidade (%)</label>
        <input type="number" id="edit-prob" value="${opp.probabilidade || 0}" min="0" max="100"
               style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
      </div>
      
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Estágio</label>
        <select id="edit-status" 
                style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
          ${COLUNAS.map(c => `<option value="${c.id}" ${c.id === opp.status ? 'selected' : ''}>${c.nome}</option>`).join('')}
        </select>
      </div>
      
      <div style="display: flex; gap: 1rem; margin-top: 1rem;">
        <button type="submit" 
                style="flex: 1; padding: 0.75rem; background: #3B82F6; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 1rem;">
          ✅ Salvar
        </button>
        <button type="button" onclick="window.PipelineApp.closeModal()" 
                style="flex: 1; padding: 0.75rem; background: #F3F4F6; color: #374151; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 1rem;">
          Cancelar
        </button>
      </div>
    </form>
  `);
  
  document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titulo = document.getElementById('edit-titulo').value.trim();
    const valor = parseFloat(document.getElementById('edit-valor').value) || 0;
    const probabilidade = parseInt(document.getElementById('edit-prob').value) || 0;
    const status = document.getElementById('edit-status').value;
    
    if (!titulo) {
      showNotification('❌ Título é obrigatório', 'error', 2000);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('sales_opportunities')
        .update({ 
          titulo, 
          valor, 
          probabilidade, 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      showNotification('✅ Oportunidade atualizada!', 'success', 2000);
      await awardPoints('pipeline_edit_opp', 5);
      
      closeModal();
      await loadOpportunities();
      applyFilters();
      renderBoard();
    } catch (error) {
      showNotification(`❌ Erro: ${error.message}`, 'error', 3000);
    }
  });
}

async function deleteOpp(id) {
  if (!confirm('❌ Tem certeza que deseja deletar esta oportunidade?')) return;
  
  try {
    const { error } = await supabase
      .from('sales_opportunities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    showNotification('✅ Oportunidade deletada!', 'success', 2000);
    
    await loadOpportunities();
    applyFilters();
    renderBoard();
  } catch (error) {
    showNotification(`❌ Erro: ${error.message}`, 'error', 3000);
  }
}

// ============================================================================
// EXPORT CSV
// ============================================================================
function exportCSV() {
  try {
    const opps = PipelineState.filteredOpportunities;
    
    if (opps.length === 0) {
      showNotification('⚠️ Nenhuma oportunidade para exportar', 'warning', 2000);
      return;
    }
    
    // Headers
    const headers = ['ID', 'Título', 'Valor', 'Probabilidade', 'Estágio', 'Data Criação'];
    
    // Rows
    const rows = opps.map(opp => [
      opp.id,
      `"${(opp.titulo || '').replace(/"/g, '""')}"`,
      (parseFloat(opp.valor) || 0).toFixed(2),
      opp.probabilidade || 0,
      opp.status || '',
      new Date(opp.created_at).toLocaleDateString('pt-BR')
    ]);
    
    // CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `pipeline_${date}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`✅ ${opps.length} oportunidades exportadas!`, 'success', 2000);
    
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    showNotification('❌ Erro ao exportar CSV', 'error', 3000);
  }
}

// ============================================================================
// FILTROS UI
// ============================================================================
function openFilters() {
  const modal = createModal('Filtros Avançados', `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <!-- Estágios -->
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.75rem; color: #374151;">
          Estágios
        </label>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${COLUNAS.map(col => `
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" 
                     value="${col.id}" 
                     ${PipelineState.filters.stages.includes(col.id) ? 'checked' : ''}
                     onchange="window.PipelineApp.toggleStageFilter('${col.id}')"
                     style="width: 1rem; height: 1rem; cursor: pointer;">
              <span style="font-size: 0.875rem;">${col.nome}</span>
            </label>
          `).join('')}
        </div>
      </div>
      
      <!-- Valor -->
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.75rem; color: #374151;">
          Valor (R$)
        </label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.75rem; color: #6B7280; margin-bottom: 0.25rem; display: block;">Mínimo</label>
            <input type="number" id="filter-valor-min" value="${PipelineState.filters.valorMin}" min="0"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; font-size: 0.875rem;">
          </div>
          <div>
            <label style="font-size: 0.75rem; color: #6B7280; margin-bottom: 0.25rem; display: block;">Máximo</label>
            <input type="number" id="filter-valor-max" value="${PipelineState.filters.valorMax}" min="0"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; font-size: 0.875rem;">
          </div>
        </div>
      </div>
      
      <!-- Probabilidade -->
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.75rem; color: #374151;">
          Probabilidade (%)
        </label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.75rem; color: #6B7280; margin-bottom: 0.25rem; display: block;">Mínimo</label>
            <input type="number" id="filter-prob-min" value="${PipelineState.filters.probMin}" min="0" max="100"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; font-size: 0.875rem;">
          </div>
          <div>
            <label style="font-size: 0.75rem; color: #6B7280; margin-bottom: 0.25rem; display: block;">Máximo</label>
            <input type="number" id="filter-prob-max" value="${PipelineState.filters.probMax}" min="0" max="100"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; font-size: 0.875rem;">
          </div>
        </div>
      </div>
      
      <!-- Data -->
      <div>
        <label style="display: block; font-weight: 600; margin-bottom: 0.75rem; color: #374151;">
          Período
        </label>
        <select id="filter-date-range" 
                style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
          <option value="all" ${PipelineState.filters.dateRange === 'all' ? 'selected' : ''}>Todos</option>
          <option value="7d" ${PipelineState.filters.dateRange === '7d' ? 'selected' : ''}>Últimos 7 dias</option>
          <option value="30d" ${PipelineState.filters.dateRange === '30d' ? 'selected' : ''}>Últimos 30 dias</option>
          <option value="90d" ${PipelineState.filters.dateRange === '90d' ? 'selected' : ''}>Últimos 90 dias</option>
        </select>
      </div>
      
      <!-- Botões -->
      <div style="display: flex; gap: 1rem; margin-top: 1rem;">
        <button onclick="window.PipelineApp.applyFilterModal()" 
                style="flex: 1; padding: 0.75rem; background: #3B82F6; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
          ✅ Aplicar Filtros
        </button>
        <button onclick="window.PipelineApp.clearFilters()" 
                style="flex: 1; padding: 0.75rem; background: #F3F4F6; color: #374151; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
          🔄 Limpar
        </button>
      </div>
    </div>
  `);
}

function toggleStageFilter(stageId) {
  const index = PipelineState.filters.stages.indexOf(stageId);
  if (index > -1) {
    PipelineState.filters.stages.splice(index, 1);
  } else {
    PipelineState.filters.stages.push(stageId);
  }
}

function applyFilterModal() {
  PipelineState.filters.valorMin = parseFloat(document.getElementById('filter-valor-min').value) || 0;
  PipelineState.filters.valorMax = parseFloat(document.getElementById('filter-valor-max').value) || 999999;
  PipelineState.filters.probMin = parseInt(document.getElementById('filter-prob-min').value) || 0;
  PipelineState.filters.probMax = parseInt(document.getElementById('filter-prob-max').value) || 100;
  PipelineState.filters.dateRange = document.getElementById('filter-date-range').value;
  
  applyFilters();
  renderBoard();
  closeModal();
  
  showNotification('✅ Filtros aplicados!', 'success', 1500);
}

function clearFilters() {
  PipelineState.filters = {
    search: '',
    stages: [],
    valorMin: 0,
    valorMax: 999999,
    probMin: 0,
    probMax: 100,
    dateRange: 'all'
  };
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  
  applyFilters();
  renderBoard();
  closeModal();
  
  showNotification('✅ Filtros limpos!', 'success', 1500);
}

// ============================================================================
// GAMIFICAÇÃO
// ============================================================================
async function awardPoints(action, points) {
  if (!PipelineState.userId || !PipelineState.orgId) return;
  
  try {
    await window.AlshamSupabase.genericInsert('gamification_points', {
      user_id: PipelineState.userId,
      org_id: PipelineState.orgId,
      points_awarded: points,
      activity_type: 'pipeline',
      reason: action
    });
    
    console.log(`🏅 +${points} pontos por ${action}`);
  } catch (error) {
    console.warn('⚠️ Erro ao pontuar:', error);
  }
}

// ============================================================================
// REALTIME
// ============================================================================
function setupRealtime() {
  if (!supabase || !PipelineState.orgId) return;
  
  supabase
    .channel('sales_opportunities_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'sales_opportunities',
      filter: `org_id=eq.${PipelineState.orgId}`
    }, (payload) => {
      console.log('🔔 Atualização em tempo real:', payload);
      loadOpportunities().then(() => {
        applyFilters();
        renderBoard();
      });
    })
    .subscribe();
  
  console.log('🔔 Realtime ativado');
}

// ============================================================================
// UI HELPERS
// ============================================================================
function createModal(title, content) {
  const existing = document.getElementById('pipeline-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'pipeline-modal';
  modal.style.cssText = 'position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); padding: 1rem;';
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 1rem; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
      <div style="padding: 1.5rem; border-bottom: 1px solid #E5E7EB;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0; color: #111827;">${title}</h2>
      </div>
      <div style="padding: 1.5rem;">
        ${content}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  return modal;
}

function closeModal() {
  const modal = document.getElementById('pipeline-modal');
  if (modal) modal.remove();
}

function addHeaderButtons() {
  const header = document.querySelector('header > div');
  if (!header || document.getElementById('pipeline-actions')) return;
  
  const actionsDiv = document.createElement('div');
  actionsDiv.id = 'pipeline-actions';
  actionsDiv.style.cssText = 'display: flex; gap: 0.75rem; align-items: center;';
  
  // Busca
  const searchInput = document.createElement('input');
  searchInput.id = 'search-input';
  searchInput.type = 'text';
  searchInput.placeholder = '🔍 Buscar oportunidade...';
  searchInput.style.cssText = 'padding: 0.625rem 1rem; border: 1px solid var(--alsham-border-default, #D1D5DB); border-radius: 0.5rem; font-size: 0.875rem; width: 250px;';
  searchInput.oninput = (e) => handleSearch(e.target.value);
  
  // Contador de filtros
  const filterCount = document.createElement('span');
  filterCount.id = 'filter-count';
  filterCount.style.cssText = 'font-size: 0.875rem; color: var(--alsham-text-secondary, #6B7280); display: none;';
  
  // Botão Filtros
  const filterBtn = document.createElement('button');
  filterBtn.textContent = '🔍 Filtros';
  filterBtn.onclick = openFilters;
  filterBtn.style.cssText = 'padding: 0.625rem 1rem; background: var(--alsham-bg-surface, white); color: var(--alsham-text-primary, #374151); border: 1px solid var(--alsham-border-default, #D1D5DB); border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.875rem;';
  
  // Botão Export
  const exportBtn = document.createElement('button');
  exportBtn.textContent = '📥 Export CSV';
  exportBtn.onclick = exportCSV;
  exportBtn.style.cssText = 'padding: 0.625rem 1rem; background: #8B5CF6; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.875rem;';
  
  // Botão Nova Oportunidade
  const createBtn = document.createElement('button');
  createBtn.textContent = '➕ Nova Oportunidade';
  createBtn.onclick = createOpp;
  createBtn.style.cssText = 'padding: 0.625rem 1.25rem; background: #10B981; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.875rem;';
  
  actionsDiv.appendChild(searchInput);
  actionsDiv.appendChild(filterCount);
  actionsDiv.appendChild(filterBtn);
  actionsDiv.appendChild(exportBtn);
  actionsDiv.appendChild(createBtn);
  
  header.appendChild(actionsDiv);
}

function updateTotalDisplay() {
  let totalEl = document.getElementById('pipeline-total');
  
  if (!totalEl) {
    const headerDiv = document.querySelector('header > div');
    if (headerDiv) {
      totalEl = document.createElement('span');
      totalEl.id = 'pipeline-total';
      totalEl.style.cssText = 'margin-left: auto; margin-right: 1rem; font-size: 1.125rem; font-weight: 600; color: var(--alsham-text-secondary, #6B7280);';
      const actions = document.getElementById('pipeline-actions');
      if (actions) {
        headerDiv.insertBefore(totalEl, actions);
      } else {
        headerDiv.appendChild(totalEl);
      }
    }
  }
  
  if (totalEl) {
    const total = PipelineState.filteredOpportunities.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
    totalEl.textContent = `Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  const board = document.getElementById('pipeline-board');
  
  if (loading) loading.style.display = show ? 'flex' : 'none';
  if (board) {
    if (show) {
      board.classList.add('hidden');
    } else {
      board.classList.remove('hidden');
    }
  }
}

function showError(message) {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.innerHTML = `
      <div style="background: white; padding: 3rem; border-radius: 1rem; text-align: center; max-width: 500px; margin: 0 auto;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">❌</div>
        <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #EF4444;">
          Erro ao Carregar Pipeline
        </h3>
        <p style="color: #6B7280; margin-bottom: 2rem;">
          ${message}
        </p>
        <button onclick="location.reload()" 
                style="padding: 0.75rem 2rem; background: #3B82F6; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 1rem;">
          🔄 Recarregar Página
        </button>
      </div>
    `;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// EXPORT & AUTO-INIT
// ============================================================================
window.PipelineApp = {
  state: PipelineState,
  init: initPipeline,
  createOpp,
  editOpp,
  deleteOpp,
  exportCSV,
  openFilters,
  toggleStageFilter,
  applyFilterModal,
  clearFilters,
  closeModal,
  refresh: async () => {
    await loadOpportunities();
    applyFilters();
    renderBoard();
  }
};

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPipeline);
} else {
  initPipeline();
}

console.log('✅ Pipeline v9.0 carregado - 100% COMPLETO');
