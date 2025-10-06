/**
 * ALSHAM 360° PRIMA - Pipeline de Vendas (Kanban Board)
 * Versão: 2.0.0 - MODERN UI REFACTORED
 * Data: 06/10/2025
 * Estrutura: public/js/pipeline.js
 */

import { supabase } from '../../src/lib/supabase.js';

const COLUNAS = [
  { id: 'qualificacao', nome: 'Qualificação' },
  { id: 'proposta', nome: 'Proposta' },
  { id: 'negociacao', nome: 'Negociação' },
  { id: 'fechado_ganho', nome: 'Fechado Ganho' },
  { id: 'perdido', nome: 'Perdido' }
];

let opportunities = [];
let draggedCard = null;

// Inicialização
async function init() {
  try {
    console.log('🎯 Iniciando Pipeline de Vendas v2.0...');
    await loadOpportunities();
    renderBoard();
    attachDragAndDropListeners();
    
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
    const boardEl = document.getElementById('pipeline-board');
    if (boardEl) boardEl.classList.remove('hidden');
    console.log('✅ Pipeline carregado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar pipeline:', error);
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.innerHTML = `<p style="color: #EF4444;">Erro ao carregar pipeline: ${error.message}</p>`;
    }
  }
}

// Carregar oportunidades do Supabase
async function loadOpportunities() {
  const { data, error } = await supabase
    .from('sales_opportunities')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  opportunities = data || [];
  console.log(`📊 ${opportunities.length} oportunidades carregadas.`);
}

// Renderizar board completo
function renderBoard() {
  const board = document.getElementById('pipeline-board');
  if (!board) return;
  board.innerHTML = COLUNAS.map(col => {
    const oppsInColumn = opportunities.filter(o => o.status === col.id);
    const totalValue = oppsInColumn.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
    
    return `
      <div class="pipeline-column" data-stage="${col.id}">
        <div class="pipeline-column-header">
          <h3>${col.nome}</h3>
          <div class="pipeline-column-stats">
            <span>R$ ${totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            <span class="deal-count">${oppsInColumn.length}</span>
          </div>
        </div>
        <div class="pipeline-column-body" data-column-id="${col.id}">
          ${oppsInColumn.map(opp => createCardHTML(opp)).join('') || '<div class="p-4 text-center text-sm text-gray-500">Nenhuma oportunidade.</div>'}
        </div>
      </div>
    `;
  }).join('');
}

// Criar card individual
function createCardHTML(opp) {
  return `
    <div 
      class="opportunity-card"
      draggable="true"
      data-opportunity-id="${opp.id}"
    >
      <h4 class="opportunity-card-title">${opp.titulo || 'N/A'}</h4>
      <p class="opportunity-card-value">
        R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
      </p>
      <div class="opportunity-card-footer">
        <span class="opportunity-probability">${opp.probabilidade || 0}%</span>
        <button 
          onclick="viewOpportunityDetails('${opp.id}')" 
          class="text-xs text-blue-600 hover:underline"
        >
          Ver detalhes
        </button>
      </div>
    </div>
  `;
}

// Anexar event listeners de Drag and Drop
function attachDragAndDropListeners() {
  const cards = document.querySelectorAll('.opportunity-card');
  const columns = document.querySelectorAll('.pipeline-column-body');

  cards.forEach(card => {
    card.addEventListener('dragstart', () => {
      draggedCard = card;
      setTimeout(() => card.classList.add('dragging'), 0);
    });

    card.addEventListener('dragend', () => {
      if (draggedCard) draggedCard.classList.remove('dragging');
      draggedCard = null;
    });
  });

  columns.forEach(column => {
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

      const targetColumnId = column.dataset.columnId;
      const opportunityId = draggedCard.dataset.opportunityId;

      const originalOpp = opportunities.find(o => o.id == opportunityId);
      if (!originalOpp) return;
      const originalColumn = originalOpp.status;
      if (originalColumn === targetColumnId) return; // Não faz nada se soltar na mesma coluna

      // Mover o card visualmente para resposta imediata
      column.appendChild(draggedCard);

      try {
        console.log(`🔄 Movendo oportunidade ${opportunityId} para ${targetColumnId}`);
        const { error } = await supabase
          .from('sales_opportunities')
          .update({ 
            status: targetColumnId, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', opportunityId);

        if (error) throw error;
        
        console.log('✅ Oportunidade movida com sucesso no banco de dados.');
        // Recarregar os dados e renderizar tudo para manter a consistência
        await loadOpportunities();
        renderBoard();
        attachDragAndDropListeners(); // Reanexar listeners ao novo DOM

      } catch (error) {
        console.error('❌ Erro ao mover card:', error);
        alert(`Erro ao mover a oportunidade: ${error.message}`);
        // Reverter em caso de erro
        renderBoard();
        attachDragAndDropListeners();
      }
    });
  });
  console.log('🔗 Eventos de Drag & Drop anexados.');
}

// Ver detalhes da oportunidade (placeholder)
window.viewOpportunityDetails = function(id) {
  const opp = opportunities.find(o => o.id.toString() === id);
  if (!opp) return;
  
  alert(`
📋 Detalhes da Oportunidade

Título: ${opp.titulo || 'N/A'}
Valor: R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
Probabilidade: ${opp.probabilidade || 0}%
Status: ${opp.status || 'N/A'}
Criado em: ${opp.created_at ? new Date(opp.created_at).toLocaleDateString('pt-BR') : 'N/A'}
  `);
}

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
