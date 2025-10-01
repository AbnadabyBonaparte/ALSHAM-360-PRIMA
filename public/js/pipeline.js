// Importar Supabase
import { supabase } from '../lib/supabase.js';

// Definir as colunas do pipeline
const COLUNAS = [
  { id: 'qualificacao', nome: 'Qualificação', cor: 'blue' },
  { id: 'proposta', nome: 'Proposta', cor: 'yellow' },
  { id: 'negociacao', nome: 'Negociação', cor: 'orange' },
  { id: 'fechado_ganho', nome: 'Fechado - Ganho', cor: 'green' },
  { id: 'fechado_perdido', nome: 'Fechado - Perdido', cor: 'red' }
];

// Estado global
let opportunities = [];
let orgId = null;

// Inicializar
async function init() {
  // Obter org_id
  orgId = await window.AlshamSupabase.getCurrentOrgId();
  
  // Carregar oportunidades
  await loadOpportunities();
  
  // Renderizar board
  renderBoard();
  
  // Setup de eventos
  setupEvents();
}

// Carregar oportunidades do Supabase
async function loadOpportunities() {
  const { data, error } = await supabase
    .from('sales_opportunities')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao carregar oportunidades:', error);
    return;
  }
  
  opportunities = data || [];
  console.log(`✅ ${opportunities.length} oportunidades carregadas`);
}

// Renderizar o board completo
function renderBoard() {
  const board = document.getElementById('pipeline-board');
  board.innerHTML = '';
  
  COLUNAS.forEach(coluna => {
    const column = createColumn(coluna);
    board.appendChild(column);
  });
}

// Criar uma coluna
function createColumn(coluna) {
  const col = document.createElement('div');
  col.className = 'flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4';
  col.dataset.status = coluna.id;
  
  // Filtrar oportunidades desta coluna
  const opps = opportunities.filter(o => o.status === coluna.id);
  const total = opps.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
  
  col.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-gray-700">${coluna.nome}</h3>
      <span class="text-sm bg-white px-2 py-1 rounded">${opps.length}</span>
    </div>
    <div class="text-sm text-gray-600 mb-4">
      Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    </div>
    <div class="space-y-3" data-column="${coluna.id}">
      ${opps.map(opp => createCard(opp)).join('')}
    </div>
  `;
  
  return col;
}

// Criar um card de oportunidade
function createCard(opp) {
  return `
    <div 
      class="bg-white p-4 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
      draggable="true"
      data-id="${opp.id}"
    >
      <h4 class="font-medium text-gray-900 mb-2">${opp.titulo}</h4>
      <p class="text-sm text-gray-600">
        R$ ${(opp.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </p>
      <div class="mt-2 flex items-center justify-between">
        <span class="text-xs text-gray-500">${opp.probabilidade}% prob.</span>
        <button 
          onclick="viewOpportunity('${opp.id}')" 
          class="text-xs text-blue-600 hover:underline"
        >
          Ver detalhes
        </button>
      </div>
    </div>
  `;
}

// Setup de eventos (drag & drop simplificado)
function setupEvents() {
  const board = document.getElementById('pipeline-board');
  let draggedCard = null;
  
  // Drag start
  board.addEventListener('dragstart', (e) => {
    if (e.target.draggable) {
      draggedCard = e.target;
      e.target.style.opacity = '0.5';
    }
  });
  
  // Drag end
  board.addEventListener('dragend', (e) => {
    if (e.target.draggable) {
      e.target.style.opacity = '1';
    }
  });
  
  // Drag over (permitir drop)
  board.addEventListener('dragover', (e) => {
    e.preventDefault();
    const column = e.target.closest('[data-column]');
    if (column) {
      e.dataTransfer.dropEffect = 'move';
    }
  });
  
  // Drop
  board.addEventListener('drop', async (e) => {
    e.preventDefault();
    const column = e.target.closest('[data-column]');
    
    if (column && draggedCard) {
      const newStatus = column.dataset.column;
      const oppId = draggedCard.dataset.id;
      
      // Atualizar no Supabase
      await updateOpportunityStatus(oppId, newStatus);
      
      // Recarregar
      await loadOpportunities();
      renderBoard();
      setupEvents();
    }
  });
}

// Atualizar status da oportunidade
async function updateOpportunityStatus(oppId, newStatus) {
  const { error } = await supabase
    .from('sales_opportunities')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', oppId);
  
  if (error) {
    console.error('Erro ao atualizar:', error);
    alert('Erro ao mover card');
  } else {
    console.log(`✅ Oportunidade movida para ${newStatus}`);
  }
}

// Ver detalhes (placeholder)
window.viewOpportunity = function(id) {
  const opp = opportunities.find(o => o.id === id);
  alert(`Detalhes:\n\nTítulo: ${opp.titulo}\nValor: R$ ${opp.valor}\nStatus: ${opp.status}`);
}

// Iniciar quando página carrega
document.addEventListener('DOMContentLoaded', init);
