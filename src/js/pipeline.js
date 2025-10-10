/**
 * Pipeline v6.3 - SIMPLIFICADO (funciona como outras páginas)
 */

// Aguarda Supabase estar disponível (método simples como outras páginas)
let checkCount = 0;
const maxChecks = 50;

function checkAndInit() {
  checkCount++;
  
  if (window.AlshamSupabase?.supabase && window.showNotification) {
    console.log('✅ Pipeline: Iniciando...');
    initPipeline();
  } else if (checkCount >= maxChecks) {
    console.error('❌ Pipeline: Timeout');
    showError();
  } else {
    setTimeout(checkAndInit, 100);
  }
}

function showError() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.innerHTML = `
      <div style="color: #EF4444; text-align: center; padding: 2rem;">
        <h3>❌ Erro ao carregar Pipeline</h3>
        <button onclick="location.reload()" 
                style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3B82F6; 
                       color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
          🔄 Recarregar
        </button>
      </div>
    `;
  }
}

// Inicialização principal
function initPipeline() {
  const supabase = window.AlshamSupabase.supabase;
  const notify = window.showNotification;

  const COLUNAS = [
    { id: 'qualificacao', nome: 'Qualificação' },
    { id: 'proposta', nome: 'Proposta' },
    { id: 'negociacao', nome: 'Negociação' },
    { id: 'fechado_ganho', nome: 'Fechado Ganho' },
    { id: 'perdido', nome: 'Perdido' }
  ];

  let opportunities = [];
  let draggedCard = null;

  async function loadOpportunities() {
    try {
      const { data, error } = await supabase
        .from('sales_opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      opportunities = data || [];
      console.log(`📊 ${opportunities.length} oportunidades`);
      return opportunities;
    } catch (err) {
      console.error('❌ Erro ao carregar:', err);
      return [];
    }
  }

  function renderBoard() {
    const board = document.getElementById('pipeline-board');
    if (!board) return;
    
    board.innerHTML = COLUNAS.map(col => {
      const opps = opportunities.filter(o => o.status === col.id);
      const total = opps.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
      
      return `
        <div class="pipeline-column" data-stage="${col.id}">
          <div class="pipeline-column-header">
            <h3>${col.nome}</h3>
            <div class="pipeline-column-stats">
              <span>R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span class="deal-count">${opps.length}</span>
            </div>
          </div>
          <div class="pipeline-column-body" data-column-id="${col.id}">
            ${opps.map(opp => `
              <div class="opportunity-card" draggable="true" data-opportunity-id="${opp.id}">
                <h4>${opp.titulo || 'N/A'}</h4>
                <p class="text-lg font-bold text-blue-600">
                  R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div class="flex justify-between text-sm">
                  <span>${opp.probabilidade || 0}%</span>
                </div>
              </div>
            `).join('') || '<div class="p-4 text-center text-sm">Vazio</div>'}
          </div>
        </div>
      `;
    }).join('');
    
    attachDragListeners();
  }

  function attachDragListeners() {
    document.querySelectorAll('.opportunity-card').forEach(card => {
      card.addEventListener('dragstart', () => {
        draggedCard = card;
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedCard = null;
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
        
        if (!draggedCard) return;
        
        const targetStage = column.dataset.columnId;
        const oppId = draggedCard.dataset.opportunityId;
        
        try {
          const { error } = await supabase
            .from('sales_opportunities')
            .update({ status: targetStage })
            .eq('id', oppId);
          
          if (error) throw error;
          
          notify('Movido com sucesso!', 'success', 2000);
          await loadOpportunities();
          renderBoard();
        } catch (err) {
          notify(`Erro: ${err.message}`, 'error', 3000);
        }
      });
    });
  }

  // Inicialização
  async function init() {
    try {
      await loadOpportunities();
      renderBoard();
      
      document.getElementById('loading')?.remove();
      document.getElementById('pipeline-board')?.classList.remove('hidden');
      
      console.log('✅ Pipeline carregado');
    } catch (err) {
      console.error('❌ Erro:', err);
      showError();
    }
  }

  init();
}

// Inicia quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInit);
} else {
  checkAndInit();
}

console.log('🚀 Pipeline v6.3 carregado');
