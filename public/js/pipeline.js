/**
 * ALSHAM 360° PRIMA - Pipeline de Vendas (Kanban Board)
 * Versão: 1.0
 * Data: 01/10/2025
 * Estrutura: public/js/pipeline.js
 */

import { supabase } from './supabase.js';

const COLUNAS = [
  { id: 'qualificacao', nome: 'Qualificação', cor: 'bg-blue-100' },
  { id: 'proposta', nome: 'Proposta', cor: 'bg-yellow-100' },
  { id: 'negociacao', nome: 'Negociação', cor: 'bg-orange-100' },
  { id: 'fechado_ganho', nome: 'Fechado Ganho', cor: 'bg-green-100' },
  { id: 'fechado_perdido', nome: 'Perdido', cor: 'bg-red-100' }
];

let opportunities = [];

// Inicialização
async function init() {
  try {
    console.log('🎯 Iniciando Pipeline de Vendas...');
    await loadOpportunities();
    renderBoard();
    setupDragDrop();
    
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
        <div class="space-y-2 min-h-[100px]" data-column="${col.id}">
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
      class="bg-white p-3 rounded shadow-sm cursor-move hover:shadow-md transition-shadow border border-gray-200"
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

// Sistema de Drag and Drop
function setupDragDrop() {
  let draggedCard = null;
  let draggedFrom = null;
  
  document.addEventListener('dragstart', (e) => {
    if (e.target.draggable) {
      draggedCard = e.target;
      draggedFrom = e.target.closest('[data-column]')?.dataset.column;
      e.target.classList.add('opacity-50', 'scale-105');
      e.dataTransfer.effectAllowed = 'move';
    }
  });

  document.addEventListener('dragend', (e) => {
    if (e.target.draggable) {
      e.target.classList.remove('opacity-50', 'scale-105');
    }
  });

  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    const column = e.target.closest('[data-column]');
    if (column) {
      e.dataTransfer.dropEffect = 'move';
      column.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
    }
  });

  document.addEventListener('dragleave', (e) => {
    const column = e.target.closest('[data-column]');
    if (column && !column.contains(e.relatedTarget)) {
      column.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
    }
  });

  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    const column = e.target.closest('[data-column]');
    
    if (column && draggedCard) {
      column.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
      const newStatus = column.dataset.column;
      const oppId = draggedCard.dataset.id;
      
      // Não fazer nada se soltar na mesma coluna
      if (draggedFrom === newStatus) {
        console.log('⏸️ Card solto na mesma coluna');
        return;
      }
      
      try {
        console.log(`🔄 Movendo oportunidade ${oppId} para ${newStatus}`);
        
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
        setupDragDrop();
        
      } catch (error) {
        console.error('❌ Erro ao mover card:', error);
        alert(`Erro ao mover card: ${error.message}`);
      }
    }
  });
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

console.log('🎯 Pipeline.js carregado');
