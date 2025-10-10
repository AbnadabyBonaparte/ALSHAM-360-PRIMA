/**
 * Pipeline v7.0 FINAL - COMPLETO E FUNCIONAL
 * ✅ Todas as funções implementadas
 * ✅ Visual corrigido
 * ✅ Sem gambiarras
 */

let checkCount = 0;
const maxChecks = 100;

function waitForDeps() {
  checkCount++;
  
  if (window.AlshamSupabase?.supabase && window.showNotification) {
    console.log('✅ Pipeline: Dependências OK');
    initPipeline();
  } else if (checkCount >= maxChecks) {
    console.error('❌ Pipeline: Timeout');
    showErrorScreen();
  } else {
    setTimeout(waitForDeps, 100);
  }
}

function showErrorScreen() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.innerHTML = `
      <div style="background: white; padding: 3rem; border-radius: 1rem; text-align: center; max-width: 500px; margin: 0 auto;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">❌</div>
        <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #EF4444;">
          Erro ao Carregar Pipeline
        </h3>
        <p style="color: #6B7280; margin-bottom: 2rem;">
          As dependências não carregaram. Tente recarregar a página.
        </p>
        <button onclick="location.reload()" 
                style="padding: 0.75rem 2rem; background: #3B82F6; color: white; 
                       border: none; border-radius: 0.5rem; font-weight: 600; 
                       cursor: pointer; font-size: 1rem;">
          🔄 Recarregar Página
        </button>
      </div>
    `;
  }
}

function initPipeline() {
  const supabase = window.AlshamSupabase.supabase;
  const notify = window.showNotification;

  const COLUNAS = [
    { id: 'qualificacao', nome: 'Qualificação', color: '#3B82F6' },
    { id: 'proposta', nome: 'Proposta', color: '#F59E0B' },
    { id: 'negociacao', nome: 'Negociação', color: '#8B5CF6' },
    { id: 'fechado_ganho', nome: 'Fechado Ganho', color: '#10B981' },
    { id: 'perdido', nome: 'Perdido', color: '#EF4444' }
  ];

  let opportunities = [];
  let draggedCard = null;

  // ===== CARREGAR OPORTUNIDADES =====
  async function loadOpportunities() {
    try {
      const { data, error } = await supabase
        .from('sales_opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      opportunities = data || [];
      console.log(`📊 ${opportunities.length} oportunidades carregadas`);
      return opportunities;
    } catch (err) {
      console.error('❌ Erro ao carregar:', err);
      notify(`Erro: ${err.message}`, 'error', 4000);
      return [];
    }
  }

  // ===== RENDERIZAR BOARD =====
  function renderBoard() {
    const board = document.getElementById('pipeline-board');
    if (!board) return;
    
    board.innerHTML = COLUNAS.map(col => {
      const opps = opportunities.filter(o => o.status === col.id);
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
            ${opps.length > 0 ? opps.map(opp => createCard(opp)).join('') : 
              '<div style="padding: 2rem; text-align: center; color: #9CA3AF; font-size: 0.875rem;">Nenhuma oportunidade</div>'}
          </div>
        </div>
      `;
    }).join('');
    
    attachDragListeners();
  }

  function createCard(opp) {
    return `
      <div class="opportunity-card" draggable="true" data-opportunity-id="${opp.id}">
        <div style="margin-bottom: 0.75rem;">
          <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #111827;">
            ${escapeHtml(opp.titulo || 'Sem título')}
          </h4>
          <p style="font-size: 1.25rem; font-weight: 700; color: #3B82F6; margin: 0;">
            R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: #6B7280;">
          <span>${opp.probabilidade || 0}% prob.</span>
          <div style="display: flex; gap: 0.5rem;">
            <button onclick="editOpp('${opp.id}')" 
                    style="background: none; border: none; color: #3B82F6; cursor: pointer; padding: 0.25rem 0.5rem; font-size: 0.875rem;">
              ✏️ Editar
            </button>
            <button onclick="deleteOpp('${opp.id}')" 
                    style="background: none; border: none; color: #EF4444; cursor: pointer; padding: 0.25rem 0.5rem; font-size: 0.875rem;">
              🗑️ Deletar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ===== DRAG & DROP =====
  function attachDragListeners() {
    document.querySelectorAll('.opportunity-card').forEach(card => {
      card.addEventListener('dragstart', () => {
        draggedCard = card;
        card.style.opacity = '0.5';
      });
      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
        draggedCard = null;
      });
    });

    document.querySelectorAll('.pipeline-column-body').forEach(column => {
      column.addEventListener('dragover', e => {
        e.preventDefault();
        column.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      });
      column.addEventListener('dragleave', () => {
        column.style.backgroundColor = '';
      });
      column.addEventListener('drop', async (e) => {
        e.preventDefault();
        column.style.backgroundColor = '';
        
        if (!draggedCard) return;
        
        const targetStage = column.dataset.columnId;
        const oppId = draggedCard.dataset.opportunityId;
        const opp = opportunities.find(o => o.id == oppId);
        
        if (!opp || opp.status === targetStage) return;
        
        column.appendChild(draggedCard);
        
        try {
          const { error } = await supabase
            .from('sales_opportunities')
            .update({ status: targetStage, updated_at: new Date().toISOString() })
            .eq('id', oppId);
          
          if (error) throw error;
          
          notify('✅ Oportunidade movida com sucesso!', 'success', 2000);
          await loadOpportunities();
          renderBoard();
        } catch (err) {
          notify(`❌ Erro ao mover: ${err.message}`, 'error', 3000);
          await loadOpportunities();
          renderBoard();
        }
      });
    });
  }

  // ===== CRIAR OPORTUNIDADE =====
  window.createNewOpp = function() {
    const modal = createModal('Criar Oportunidade', `
      <form id="create-form" style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Título</label>
          <input type="text" id="new-titulo" required 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Valor (R$)</label>
          <input type="number" id="new-valor" required step="0.01" min="0"
                 style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Probabilidade (%)</label>
          <input type="number" id="new-prob" min="0" max="100" value="50"
                 style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Status</label>
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
          <button type="button" onclick="closeModal()" 
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
        notify('❌ Título é obrigatório', 'error', 2000);
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
            org_id: await window.AlshamSupabase.getCurrentOrgId(),
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        notify('✅ Oportunidade criada!', 'success', 2000);
        closeModal();
        await loadOpportunities();
        renderBoard();
      } catch (err) {
        notify(`❌ Erro: ${err.message}`, 'error', 3000);
      }
    });
  };

  // ===== EDITAR OPORTUNIDADE =====
  window.editOpp = function(id) {
    const opp = opportunities.find(o => o.id == id);
    if (!opp) return;
    
    const modal = createModal('Editar Oportunidade', `
      <form id="edit-form" style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Título</label>
          <input type="text" id="edit-titulo" value="${escapeHtml(opp.titulo || '')}" required 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Valor (R$)</label>
          <input type="number" id="edit-valor" value="${opp.valor || 0}" required step="0.01" min="0"
                 style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Probabilidade (%)</label>
          <input type="number" id="edit-prob" value="${opp.probabilidade || 0}" min="0" max="100"
                 style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; font-size: 1rem;">
        </div>
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151;">Status</label>
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
          <button type="button" onclick="closeModal()" 
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
        notify('❌ Título é obrigatório', 'error', 2000);
        return;
      }
      
      try {
        const { error } = await supabase
          .from('sales_opportunities')
          .update({ titulo, valor, probabilidade, status, updated_at: new Date().toISOString() })
          .eq('id', id);
        
        if (error) throw error;
        
        notify('✅ Oportunidade atualizada!', 'success', 2000);
        closeModal();
        await loadOpportunities();
        renderBoard();
      } catch (err) {
        notify(`❌ Erro: ${err.message}`, 'error', 3000);
      }
    });
  };

  // ===== DELETAR OPORTUNIDADE =====
  window.deleteOpp = async function(id) {
    if (!confirm('❌ Tem certeza que deseja deletar esta oportunidade?')) return;
    
    try {
      const { error } = await supabase
        .from('sales_opportunities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      notify('✅ Oportunidade deletada!', 'success', 2000);
      await loadOpportunities();
      renderBoard();
    } catch (err) {
      notify(`❌ Erro: ${err.message}`, 'error', 3000);
    }
  };

  // ===== MODAL =====
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

  window.closeModal = function() {
    const modal = document.getElementById('pipeline-modal');
    if (modal) modal.remove();
  };

  // ===== UTILITÃRIOS =====
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== INICIALIZAÃÃO =====
  async function init() {
    try {
      await loadOpportunities();
      renderBoard();
      
      // Adicionar botão criar
      const header = document.querySelector('header > div');
      if (header && !document.getElementById('create-opp-btn')) {
        const btn = document.createElement('button');
        btn.id = 'create-opp-btn';
        btn.textContent = '➕ Nova Oportunidade';
        btn.onclick = window.createNewOpp;
        btn.style.cssText = 'padding: 0.75rem 1.5rem; background: #10B981; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.875rem;';
        header.appendChild(btn);
      }
      
      document.getElementById('loading')?.remove();
      const board = document.getElementById('pipeline-board');
      if (board) {
        board.classList.remove('hidden');
        board.style.display = 'flex';
      }
      
      console.log('✅ Pipeline v7.0 carregado com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao inicializar:', err);
      showErrorScreen();
    }
  }

  init();
}

// Inicia quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForDeps);
} else {
  waitForDeps();
}

console.log('🚀 Pipeline v7.0 - Sistema completo inicializado');
