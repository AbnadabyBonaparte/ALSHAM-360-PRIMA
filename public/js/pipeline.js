/**
 * ALSHAM 360° PRIMA - Pipeline de Vendas (Kanban Board)
 * Versão: 2.2.0 - MODERN UI REFACTORED WITH REALTIME, NOTIFICATIONS, GLOBAL TOTAL, AUDIO FEEDBACK & ANIMATIONS
 * Data: 06/10/2025
 * Estrutura: public/js/pipeline.js
 */
import { supabase } from '../../src/lib/supabase.js';
import { showNotification } from '/public/js/utils/notifications.js';

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
    console.log('🎯 Iniciando Pipeline de Vendas v2.2.0...');
    await loadOpportunities();
    renderBoard();
    attachDragAndDropListeners();
    updateTotal(); // Atualiza o total global inicial

    // Adicionar realtime sync com Supabase
    supabase
      .channel('sales_opportunities')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sales_opportunities' }, payload => {
        console.log('📡 Atualização detectada no Supabase:', payload);
        loadOpportunities().then(() => {
          renderBoard();
          attachDragAndDropListeners();
          updateTotal();
        });
      })
      .subscribe();
   
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
          title="Abrir detalhes da oportunidade"
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
        showNotification('Oportunidade movida com sucesso!', 'success');
        playSound('success');
        // Recarregar os dados e renderizar tudo para manter a consistência
        await loadOpportunities();
        renderBoard();
        attachDragAndDropListeners(); // Reanexar listeners ao novo DOM
        updateTotal(); // Atualiza o total global após movimento
      } catch (error) {
        console.error('❌ Erro ao mover card:', error);
        showNotification(`Erro ao mover a oportunidade: ${error.message}`, 'error');
        playSound('error');
        // Reverter em caso de erro
        renderBoard();
        attachDragAndDropListeners();
        updateTotal();
      }
    });
  });
  console.log('🔗 Eventos de Drag & Drop anexados.');
}
// Atualizar total global
function updateTotal() {
  let totalEl = document.getElementById('pipeline-total');
  if (!totalEl) {
    // Inserir dinamicamente se não existir
    const headerDiv = document.querySelector('header > div');
    if (headerDiv) {
      totalEl = document.createElement('span');
      totalEl.id = 'pipeline-total';
      totalEl.style.marginLeft = '1rem';
      totalEl.style.fontSize = '1.25rem';
      totalEl.style.fontWeight = '500';
      totalEl.style.color = 'var(--alsham-text-secondary)';
      headerDiv.appendChild(totalEl);
    }
  }
  if (totalEl) {
    const totalGeral = opportunities.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
    totalEl.innerText = `Total: R$ ${totalGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  }
}
// Função para tocar som de feedback
function playSound(type) {
  const audio = new Audio(type === 'success' ? '/public/assets/success.mp3' : '/public/assets/error.mp3');
  audio.volume = 0.2;
  audio.play().catch(error => console.warn('⚠️ Áudio não reproduzido:', error.message));
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
