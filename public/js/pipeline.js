/**
 * ALSHAM 360° PRIMA - Pipeline de Vendas (Kanban Board)
 * Versão: 1.1.0 - FIX DRAG-DROP
 * Data: 01/10/2025 16:45
 * Estrutura: public/js/pipeline.js
 */

import { supabase } from '../../src/lib/supabase.js';

const COLUNAS = [
  { id: 'qualificacao', nome: 'Qualificação', cor: 'bg-blue-100' },
  { id: 'proposta', nome: 'Proposta', cor: 'bg-yellow-100' },
  { id: 'negociacao', nome: 'Negociação', cor: 'bg-orange-100' },
  { id: 'fechado_ganho', nome: 'Fechado Ganho', cor: 'bg-green-100' },
  { id: 'fechado_perdido', nome: 'Perdido', cor: 'bg-red-100' }
];

let opportunities = [];
let draggedCard = null;
let draggedFrom = null;

// Inicialização
async function init() {
  try {
    console.log('🎯 Iniciando Pipeline de Vendas...');
    await loadOpportunities();
    renderBoard();
    attachEventListeners(); // ✅ CHAMADA EXPLÍCITA
    
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('pipeline-board').classList.remove('hidden');
    console.log('✅ Pipeline carregado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar pipeline:', error);
    document.getElementById('loading').innerHTML = 
      `<p class="text-red-500">Erro ao carregar pipeline: ${error.message}</p>`;
  }
}

// Carregar oportunidades do Supabase
async function loadOpportunities() {
  const { data, error } = await supabase
    .from('sales_opportunities')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar oportunidades:', error);
    throw error;
  }
  
  opportunities = data || [];
  console.log(`📊 ${opportunities.length} oportunidades carregadas`);
}

// Renderizar board completo
function renderBoard() {
  const board = document.getElementById('pipeline-board');
  
  board.innerHTML = COLUNAS.map(col => {
    const opps = opportunities.filter(o => o.status === col.id);
    const total = opps.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
    
    return `
      <div class="flex-shrink-0 w-80 ${col.cor} rounded-lg p-4">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold text-gray-700">${col.nome}</h3>
          <span class="bg-white px-2 py-1 rounded text-sm font-medium">${opps.length}</span>
        </div>
        <p class="text-sm text-gray-600 mb-4 font-medium">
          Total: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
        </p>
        <div class="space-y-2 min-h-[100px] drop-zone" data-column="${col.id}">
          ${opps.map(opp => createCard(opp)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Criar card individual
function createCard(opp) {
  return `
    <div 
      class="bg-white p-3 rounded shadow-sm cursor-move hover:shadow-md transition-shadow border border-gray-200 draggable-card"
      draggable="true"
      data-id="${opp.id}"
    >
      <h4 class="font-medium text-gray-900 mb-1 text-sm">${opp.titulo}</h4>
      <p class="text-sm text-gray-600 mb-2">
        R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
      </p>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">${opp.probabilidade}%</span>
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

// ✅ NOVO: Anexar event listeners (pode ser chamado múltiplas vezes)
function attachEventListeners() {
  const board = document.getElementById('pipeline-board');
  
  // Limpar listeners antigos (prevenir duplicação)
  const newBoard = board.cloneNode(true);
  board.parentNode.replaceChild(newBoard, board);
  
  // ✅ DRAGSTART: Capturar o card sendo arrastado
  newBoard.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.draggable-card');
    if (card) {
      draggedCard = card;
      draggedFrom = card.closest('[data-column]')?.dataset.column;
      card.classList.add('opacity-50', 'scale-105');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.id);
      console.log(`🎯 Drag iniciado: ${card.dataset.id} de ${draggedFrom}`);
    }
  });

  // ✅ DRAGEND: Remover estilos
  newBoard.addEventListener('dragend', (e) => {
    const card = e.target.closest('.draggable-card');
    if (card) {
      card.classList.remove('opacity-50', 'scale-105');
    }
  });

  // ✅ DRAGOVER: Permitir drop (CRÍTICO!)
  newBoard.addEventListener('dragover', (e) => {
    e.preventDefault(); // ← SEM ISSO, DROP NÃO FUNCIONA!
    const dropZone = e.target.closest('.drop-zone');
    if (dropZone) {
      e.dataTransfer.dropEffect = 'move';
      dropZone.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
    }
  });

  // ✅ DRAGLEAVE: Remover highlight
  newBoard.addEventListener('dragleave', (e) => {
    const dropZone = e.target.closest('.drop-zone');
    if (dropZone && !dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
    }
  });

  // ✅ DROP: Processar o drop
  newBoard.addEventListener('drop', async (e) => {
    e.preventDefault();
    const dropZone = e.target.closest('.drop-zone');
    
    if (dropZone && draggedCard) {
      dropZone.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
      const newStatus = dropZone.dataset.column;
      const oppId = draggedCard.dataset.id;
      
      // Não fazer nada se soltar na mesma coluna
      if (draggedFrom === newStatus) {
        console.log('⏸️ Card solto na mesma coluna');
        return;
      }
      
      try {
        console.log(`🔄 Movendo oportunidade ${oppId}: ${draggedFrom} → ${newStatus}`);
        
        const { error } = await supabase
          .from('sales_opportunities')
          .update({ 
            status: newStatus, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', oppId);
        
        if (error) throw error;
        
        console.log(`✅ Oportunidade movida com sucesso para ${newStatus}`);
        
        // Recarregar e re-renderizar
        await loadOpportunities();
        renderBoard();
        attachEventListeners(); // ✅ RE-ANEXAR LISTENERS!
        
      } catch (error) {
        console.error('❌ Erro ao mover card:', error);
        alert(`Erro ao mover card: ${error.message}`);
        
        // Em caso de erro, re-renderizar para estado original
        renderBoard();
        attachEventListeners();
      } finally {
        // Limpar estado
        draggedCard = null;
        draggedFrom = null;
      }
    }
  });
  
  console.log('✅ Event listeners anexados ao board');
}

// Ver detalhes da oportunidade (placeholder)
window.viewOpportunityDetails = function(id) {
  const opp = opportunities.find(o => o.id === id);
  if (!opp) return;
  
  alert(`
📋 Detalhes da Oportunidade

Título: ${opp.titulo}
Valor: R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
Probabilidade: ${opp.probabilidade}%
Status: ${opp.status}
Criado em: ${new Date(opp.created_at).toLocaleDateString('pt-BR')}
  `);
}

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('🎯 Pipeline.js v1.1.0 carregado');
