/**
 * ALSHAM 360° PRIMA - Pipeline de Vendas (Kanban Board)
 * Versão: 2.3.0 – PATCH: Toggle de Som + Animação Suave + UX Refinado
 * Data: 06/10/2025
 */

import { supabase } from '../../src/lib/supabase.js';
import { showNotification as notify } from '/public/js/utils/notifications.js';

const COLUNAS = [
  { id: 'qualificacao', nome: 'Qualificação' },
  { id: 'proposta', nome: 'Proposta' },
  { id: 'negociacao', nome: 'Negociação' },
  { id: 'fechado_ganho', nome: 'Fechado Ganho' },
  { id: 'perdido', nome: 'Perdido' }
];

let opportunities = [];
let draggedCard = null;

// === Sons ===
const successSounds = [
  '/assets/sounds/success/success.mp3',
  '/assets/sounds/success/success-level.mp3',
  '/assets/sounds/success/success-bonus.mp3',
  '/assets/sounds/success/success-rise.mp3'
];
const errorSounds = [
  '/assets/sounds/error/error.mp3',
  '/assets/sounds/error/error-alert.mp3',
  '/assets/sounds/error/error-glitch.mp3'
];
const fallbackSound = '/assets/sounds/success/success.mp3';

// === Controle de som ===
let soundEnabled = JSON.parse(localStorage.getItem('soundEnabled')) ?? true;

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  const btn = document.getElementById('toggle-sound');
  if (btn) btn.innerText = soundEnabled ? '🔊 Som: Ativo' : '🔇 Som: Mudo';
  notify(soundEnabled ? 'Som ativado 🔊' : 'Som desativado 🔇', 'info');
}

// === Inicialização ===
async function init() {
  try {
    console.log('🎯 Iniciando Pipeline de Vendas v2.3.0...');
    await loadOpportunities();
    renderBoard();
    attachDragAndDropListeners();
    updateHeaderUI();
    updateTotal();

    // Canal realtime
    supabase
      .channel('sales_opportunities')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sales_opportunities' }, async () => {
        await loadOpportunities();
        renderBoard();
        attachDragAndDropListeners();
        updateTotal();
      })
      .subscribe();

    document.getElementById('loading')?.remove();
    document.getElementById('pipeline-board')?.classList.remove('hidden');
  } catch (error) {
    console.error('❌ Erro ao inicializar pipeline:', error);
    document.getElementById('loading').innerHTML =
      `<p style="color:#EF4444;">Erro ao carregar pipeline: ${error.message}</p>`;
  }
}

// === Carregar dados ===
async function loadOpportunities() {
  const { data, error } = await supabase
    .from('sales_opportunities')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  opportunities = data || [];
  console.log(`📊 ${opportunities.length} oportunidades carregadas.`);
}

// === Renderização do board ===
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
          ${opps.map(opp => createCardHTML(opp)).join('') || '<div class="p-4 text-center text-sm text-gray-500">Nenhuma oportunidade.</div>'}
        </div>
      </div>
    `;
  }).join('');
}

// === Cartão de oportunidade ===
function createCardHTML(opp) {
  return `
    <div class="opportunity-card" draggable="true" data-opportunity-id="${opp.id}">
      <h4 class="opportunity-card-title">${opp.titulo || 'N/A'}</h4>
      <p class="opportunity-card-value">R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      <div class="opportunity-card-footer">
        <span class="opportunity-probability">${opp.probabilidade || 0}%</span>
        <button onclick="viewOpportunityDetails('${opp.id}')" class="text-xs text-blue-600 hover:underline">Ver detalhes</button>
      </div>
    </div>
  `;
}

// === Drag and Drop ===
function attachDragAndDropListeners() {
  const cards = document.querySelectorAll('.opportunity-card');
  const columns = document.querySelectorAll('.pipeline-column-body');

  cards.forEach(card => {
    card.addEventListener('dragstart', () => {
      draggedCard = card;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedCard = null;
    });
  });

  columns.forEach(column => {
    column.addEventListener('dragover', e => {
      e.preventDefault();
      column.classList.add('drag-over');
    });
    column.addEventListener('dragleave', () => column.classList.remove('drag-over'));
    column.addEventListener('drop', async e => {
      e.preventDefault();
      column.classList.remove('drag-over');
      if (!draggedCard) return;

      const targetColumn = column.dataset.columnId;
      const oppId = draggedCard.dataset.opportunityId;
      const opp = opportunities.find(o => o.id == oppId);
      if (!opp || opp.status === targetColumn) return;

      column.appendChild(draggedCard);
      try {
        const { error } = await supabase
          .from('sales_opportunities')
          .update({ status: targetColumn, updated_at: new Date().toISOString() })
          .eq('id', oppId);
        if (error) throw error;

        notify('Oportunidade movida com sucesso!', 'success');
        playSound('success');
        await loadOpportunities();
        renderBoard();
        attachDragAndDropListeners();
        updateTotal();
      } catch (err) {
        console.error('❌ Erro ao mover card:', err);
        notify(`Erro: ${err.message}`, 'error');
        playSound('error');
      }
    });
  });
}

// === Atualizar total e header ===
function updateHeaderUI() {
  const headerDiv = document.querySelector('header > div');
  if (!headerDiv) return;

  // Botão de som
  let btn = document.getElementById('toggle-sound');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'toggle-sound';
    btn.className = 'ml-4 px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition';
    btn.onclick = toggleSound;
    headerDiv.appendChild(btn);
  }
  btn.innerText = soundEnabled ? '🔊 Som: Ativo' : '🔇 Som: Mudo';
}

function updateTotal() {
  let totalEl = document.getElementById('pipeline-total');
  if (!totalEl) {
    const headerDiv = document.querySelector('header > div');
    if (headerDiv) {
      totalEl = document.createElement('span');
      totalEl.id = 'pipeline-total';
      totalEl.className = 'ml-4 text-lg font-semibold text-gray-600 dark:text-gray-300';
      headerDiv.appendChild(totalEl);
    }
  }
  if (totalEl) {
    const total = opportunities.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0);
    totalEl.innerText = `Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
}

// === Sons ===
function playSound(type) {
  if (!soundEnabled) return;
  const list = type === 'success' ? successSounds : errorSounds;
  const src = list[Math.floor(Math.random() * list.length)];
  const audio = new Audio(src);
  audio.volume = 0.25;
  audio.play().catch(() => {
    const fallback = new Audio(fallbackSound);
    fallback.volume = 0.2;
    fallback.play().catch(() => {});
  });
}

// === Detalhes ===
window.viewOpportunityDetails = function(id) {
  const opp = opportunities.find(o => o.id.toString() === id);
  if (!opp) return;
  alert(`
📋 Detalhes da Oportunidade
Título: ${opp.titulo || 'N/A'}
Valor: R$ ${(parseFloat(opp.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
Probabilidade: ${opp.probabilidade || 0}%
Status: ${opp.status || 'N/A'}
Criado em: ${opp.created_at ? new Date(opp.created_at).toLocaleDateString('pt-BR') : 'N/A'}
  `);
};

// === Inicialização ===
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
