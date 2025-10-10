/**
 * TIMELINE DE INTERAÇÕES - LEADS CRM v2.0
 * ✅ CORRIGIDO: usa created_at em vez de interaction_date
 * ✅ CORRIGIDO: removido export ES6, mantido apenas window export
 */

const ICONS = {
  email: '📧',
  ligacao: '📞',
  reuniao: '🤝',
  nota: '📝',
  whatsapp: '💬'
};

const COLORS = {
  email: 'bg-blue-50 text-blue-600',
  ligacao: 'bg-green-50 text-green-600',
  reuniao: 'bg-purple-50 text-purple-600',
  nota: 'bg-gray-50 text-gray-600',
  whatsapp: 'bg-green-50 text-green-600'
};

// ✅ REMOVIDO "export" - agora usa apenas window export
async function loadTimeline(leadId, containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error('❌ Container não encontrado:', containerId);
    return;
  }

  container.innerHTML = '<p class="text-gray-500 text-center py-8">⏳ Carregando interações...</p>';

  try {
    if (!window.AlshamSupabase) {
      throw new Error('Supabase não está carregado');
    }

    const { genericSelect, getCurrentOrgId } = window.AlshamSupabase;
    const orgId = await getCurrentOrgId();
    
    // ✅ CORRIGIDO: created_at em vez de interaction_date
    const { data, error } = await genericSelect(
      'lead_interactions',
      { lead_id: leadId, org_id: orgId },
      { order: { column: 'created_at', ascending: false } }
    );

    if (error) {
      console.error('❌ Erro no Supabase:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 bg-gray-50 rounded-lg">
          <div class="text-4xl mb-3">📋</div>
          <p class="text-gray-600 font-medium mb-3">Nenhuma interação registrada</p>
          <button 
            onclick="window.showAddInteractionForm?.('${leadId}')" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Adicionar Primeira Interação
          </button>
        </div>
      `;
      return;
    }

    const timelineHTML = `
      <div class="space-y-3 max-h-[500px] overflow-y-auto">
        ${data.map(interaction => createInteractionCard(interaction)).join('')}
      </div>
      <button 
        onclick="window.showAddInteractionForm?.('${leadId}')" 
        class="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
      >
        ➕ Adicionar Nova Interação
      </button>
    `;

    container.innerHTML = timelineHTML;
    console.log(`✅ Timeline carregada: ${data.length} interações`);

  } catch (err) {
    console.error('❌ Erro ao carregar timeline:', err);
    container.innerHTML = `
      <div class="text-center py-8">
        <p class="text-red-600 font-medium mb-2">❌ Erro ao carregar interações</p>
        <p class="text-sm text-gray-500">${err.message}</p>
        <button 
          onclick="location.reload()" 
          class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🔄 Recarregar
        </button>
      </div>
    `;
  }
}

function createInteractionCard(interaction) {
  const icon = ICONS[interaction.interaction_type] || '📄';
  const color = COLORS[interaction.interaction_type] || 'bg-gray-50';
  
  // ✅ CORRIGIDO: usar created_at
  const date = new Date(interaction.created_at);
  const timeAgo = getTimeAgo(date);
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <div class="flex gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div class="flex-shrink-0 w-10 h-10 ${color} rounded-full flex items-center justify-center text-xl">
        ${icon}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold text-gray-900 capitalize">${formatType(interaction.interaction_type)}</span>
          <span class="text-xs text-gray-500" title="${formattedDate}">${timeAgo}</span>
        </div>
        ${interaction.notes ? `
          <p class="text-sm text-gray-700 mb-2">${escapeHtml(interaction.notes)}</p>
        ` : ''}
        <div class="flex gap-2 flex-wrap text-xs">
          ${interaction.outcome ? `
            <span class="px-2 py-1 rounded ${getOutcomeBadge(interaction.outcome)}">
              ${formatOutcome(interaction.outcome)}
            </span>
          ` : ''}
          ${interaction.duration_minutes ? `
            <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded">
              ⏱️ ${interaction.duration_minutes} min
            </span>
          ` : ''}
          ${interaction.next_action ? `
            <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded" title="${escapeHtml(interaction.next_action)}">
              📌 Próxima ação
            </span>
          ` : ''}
        </div>
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

function formatType(type) {
  const labels = {
    email: 'Email',
    ligacao: 'Ligação',
    reuniao: 'Reunião',
    nota: 'Nota',
    whatsapp: 'WhatsApp'
  };
  return labels[type] || type;
}

function formatOutcome(outcome) {
  const labels = {
    positivo: '✅ Positivo',
    neutro: '⚪ Neutro',
    negativo: '❌ Negativo',
    aguardando: '⏳ Aguardando'
  };
  return labels[outcome] || outcome;
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: 'ano', seconds: 31536000 },
    { label: 'mês', seconds: 2592000 },
    { label: 'dia', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `há ${count} ${interval.label}${count > 1 ? 's' : ''}`;
    }
  }
  return 'agora';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ✅ Export via window (padrão correto)
window.loadTimeline = loadTimeline;
console.log('✅ Timeline.js v2.0 carregado');
