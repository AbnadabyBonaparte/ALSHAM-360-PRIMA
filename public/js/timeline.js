// public/js/timeline.js
import { supabase } from '../../src/lib/supabase.js';

const ICONS = {
  email: '📧',
  call: '📞',
  meeting: '🤝',
  note: '📝'
};

const COLORS = {
  email: 'bg-blue-50 text-blue-600',
  call: 'bg-green-50 text-green-600',
  meeting: 'bg-purple-50 text-purple-600',
  note: 'bg-gray-50 text-gray-600'
};

export async function loadTimeline(leadId, containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error('Container não encontrado:', containerId);
    return;
  }

  container.innerHTML = '<p class="text-gray-500 text-center py-8">Carregando interações...</p>';

  try {
    const { data, error } = await supabase
      .from('lead_interactions')
      .select('*')
      .eq('lead_id', leadId)
      .order('interaction_date', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500 mb-4">Nenhuma interação registrada ainda</p>
          <button onclick="window.showAddInteractionModal('${leadId}')" 
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Adicionar Primeira Interação
          </button>
        </div>
      `;
      return;
    }

    const timelineHTML = `
      <div class="space-y-4">
        ${data.map(interaction => createInteractionCard(interaction)).join('')}
      </div>
      <button onclick="window.showAddInteractionModal('${leadId}')" 
              class="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-blue-500 hover:text-blue-600">
        + Adicionar Interação
      </button>
    `;

    container.innerHTML = timelineHTML;

  } catch (err) {
    console.error('Erro ao carregar timeline:', err);
    container.innerHTML = '<p class="text-red-500 text-center py-8">Erro ao carregar interações</p>';
  }
}

function createInteractionCard(interaction) {
  const icon = ICONS[interaction.interaction_type] || '📄';
  const color = COLORS[interaction.interaction_type] || 'bg-gray-50';
  const date = new Date(interaction.interaction_date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <div class="flex gap-3 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
      <div class="flex-shrink-0 w-10 h-10 ${color} rounded-full flex items-center justify-center text-xl">
        ${icon}
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold text-gray-900 capitalize">${interaction.interaction_type}</span>
          <span class="text-sm text-gray-500">${date}</span>
        </div>
        <p class="text-gray-700 mb-2">${interaction.notes || 'Sem descrição'}</p>
        ${interaction.outcome ? `
          <span class="inline-block px-2 py-1 text-xs rounded ${getOutcomeBadge(interaction.outcome)}">
            ${interaction.outcome}
          </span>
        ` : ''}
      </div>
    </div>
  `;
}

function getOutcomeBadge(outcome) {
  const badges = {
    positivo: 'bg-green-100 text-green-800',
    neutro: 'bg-yellow-100 text-yellow-800',
    negativo: 'bg-red-100 text-red-800',
    aguardando: 'bg-blue-100 text-blue-800'
  };
  return badges[outcome] || 'bg-gray-100 text-gray-800';
}

// Expor funções globalmente
window.loadTimeline = loadTimeline;
