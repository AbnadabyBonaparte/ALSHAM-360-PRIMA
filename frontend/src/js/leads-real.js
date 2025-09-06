import { supabase } from '../lib/supabase.js';

// Estado da aplicação
let currentView = 'table';
let allLeads = [];
let filteredLeads = [];
let editingLeadId = null;
let userOrgId = null;

// Toast visual
function showNotification(message, type = 'info') {
    let root = document.getElementById('toast-root');
    if (!root) {
        root = document.createElement('div');
        root.id = 'toast-root';
        root.className = 'fixed top-4 right-4 space-y-3 z-50 pointer-events-none';
        document.body.appendChild(root);
    }
    const div = document.createElement('div');
    div.role = "status";
    div.className =
        "pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm border transition-all duration-300 mb-1 " +
        (type === "error"
            ? "bg-red-50 border-red-200 text-red-800"
            : type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-white border-gray-200 text-gray-800");
    div.textContent = message;
    root.appendChild(div);
    setTimeout(() => div.remove(), 3500);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeLeadsPage();
});

async function initializeLeadsPage() {
    try {
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '../pages/login.html';
            return;
        }
        userOrgId = (await getUserOrgId(user)) || 'default-org';

        // Carregar leads
        await loadLeads();

        // Configurar event listeners
        setupEventListeners();

        // Atualizar estatísticas
        updateStatistics();

    } catch (error) {
        console.error('Erro ao inicializar página de leads:', error);
        showNotification('Erro ao carregar dados', 'error');
    }
}

async function getUserOrgId(user) {
    // Busca org_id real do perfil
    const { data, error } = await supabase
        .from('user_profiles')
        .select('org_id')
        .eq('user_id', user.id)
        .single();
    return data?.org_id;
}

function setupEventListeners() {
    // Busca em tempo real
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }

    // Filtros
    const statusFilter = document.getElementById('status-filter');
    const periodFilter = document.getElementById('period-filter');
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (periodFilter) periodFilter.addEventListener('change', applyFilters);

    // Form de novo lead / edição
    const newLeadForm = document.getElementById('new-lead-form');
    if (newLeadForm) {
        newLeadForm.addEventListener('submit', handleLeadSubmit);
    }
}

async function loadLeads() {
    try {
        showLoading(true);

        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .eq('org_id', userOrgId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        allLeads = leads || [];
        filteredLeads = [...allLeads];

        renderLeads();
        updateStatistics();

    } catch (error) {
        console.error('Erro ao carregar leads:', error);
        showNotification('Erro ao carregar leads', 'error');
        showEmptyState();
    } finally {
        showLoading(false);
    }
}

function renderLeads() {
    if (filteredLeads.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    if (currentView === 'table') {
        renderTableView();
    } else {
        renderGridView();
    }
}

function renderTableView() {
    const tableBody = document.getElementById('leads-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = filteredLeads.map(lead => `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-4">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold text-sm">${getInitials(lead.name)}</span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${lead.name}</p>
                        <p class="text-sm text-gray-600">${lead.company || 'Sem empresa'}</p>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4">
                <div>
                    <p class="text-sm text-gray-900">${lead.email}</p>
                    <p class="text-sm text-gray-600">${lead.phone || 'Sem telefone'}</p>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}">
                    ${getStatusText(lead.status)}
                </span>
            </td>
            <td class="py-4 px-4">
                <span class="font-medium text-gray-900">
                    ${lead.value ? formatCurrency(lead.value) : 'Não informado'}
                </span>
            </td>
            <td class="py-4 px-4">
                <span class="text-sm text-gray-600">
                    ${formatDate(lead.created_at)}
                </span>
            </td>
            <td class="py-4 px-4">
                <div class="flex items-center space-x-2">
                    <button onclick="editLead('${lead.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    ${lead.phone ? `
                    <button onclick="openWhatsApp('${lead.phone}', '${lead.name}')" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="WhatsApp">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="deleteLead('${lead.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    document.getElementById('table-view').classList.remove('hidden');
    document.getElementById('grid-view').classList.add('hidden');
}

function renderGridView() {
    const gridContainer = document.getElementById('leads-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = filteredLeads.map(lead => `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold">${getInitials(lead.name)}</span>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900">${lead.name}</h3>
                        <p class="text-sm text-gray-600">${lead.company || 'Sem empresa'}</p>
                    </div>
                </div>
                <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}">
                    ${getStatusText(lead.status)}
                </span>
            </div>

            <div class="space-y-2 mb-4">
                <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span>${lead.email}</span>
                </div>
                ${lead.phone ? `
                <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span>${lead.phone}</span>
                </div>
                ` : ''}
                ${lead.value ? `
                <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <span>${formatCurrency(lead.value)}</span>
                </div>
                ` : ''}
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <span class="text-xs text-gray-500">${formatDate(lead.created_at)}</span>
                <div class="flex items-center space-x-2">
                    <button onclick="editLead('${lead.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    ${lead.phone ? `
                    <button onclick="openWhatsApp('${lead.phone}', '${lead.name}')" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="WhatsApp">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="deleteLead('${lead.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('grid-view').classList.remove('hidden');
    document.getElementById('table-view').classList.add('hidden');
}

function updateStatistics() {
    const totalLeads = allLeads.length;
    const qualifiedLeads = allLeads.filter(lead => lead.status === 'qualified').length;
    const convertedLeads = allLeads.filter(lead => lead.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    document.getElementById('total-leads').textContent = totalLeads;
    document.getElementById('qualified-leads').textContent = qualifiedLeads;
    document.getElementById('converted-leads').textContent = convertedLeads;
    document.getElementById('conversion-rate').textContent = `${conversionRate}%`;
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const periodFilter = document.getElementById('period-filter').value;

    filteredLeads = allLeads.filter(lead => {
        // Filtro de busca
        const matchesSearch = !searchTerm ||
            lead.name.toLowerCase().includes(searchTerm) ||
            lead.email.toLowerCase().includes(searchTerm) ||
            (lead.company && lead.company.toLowerCase().includes(searchTerm));

        // Filtro de status
        const matchesStatus = !statusFilter || lead.status === statusFilter;

        // Filtro de período
        const matchesPeriod = !periodFilter || checkPeriodFilter(lead.created_at, periodFilter);

        return matchesSearch && matchesStatus && matchesPeriod;
    });

    renderLeads();
}

function checkPeriodFilter(dateString, period) {
    const date = new Date(dateString);
    const now = new Date();

    switch (period) {
        case 'today':
            return date.toDateString() === now.toDateString();
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
        case 'month':
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            const leadQuarter = Math.floor(date.getMonth() / 3);
            return leadQuarter === quarter && date.getFullYear() === now.getFullYear();
        default:
            return true;
    }
}

async function handleLeadSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const leadData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        position: formData.get('position'),
        status: formData.get('status'),
        value: formData.get('value') ? parseFloat(formData.get('value')) : null,
        source: formData.get('source'),
        notes: formData.get('notes'),
        org_id: userOrgId
    };

    try {
        if (editingLeadId) {
            // Update lead
            const { error } = await supabase
                .from('leads')
                .update(leadData)
                .eq('id', editingLeadId);
            if (error) throw error;
            showNotification('Lead editado com sucesso!', 'success');
        } else {
            // Create lead
            const { error } = await supabase
                .from('leads')
                .insert([leadData]);
            if (error) throw error;
            showNotification('Lead criado com sucesso!', 'success');
        }
        closeNewLeadModal();
        await loadLeads();
    } catch (error) {
        console.error('Erro ao salvar lead:', error);
        showNotification('Erro ao salvar lead', 'error');
    }
}

// Funções auxiliares
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getStatusColor(status) {
    const colors = {
        'new': 'bg-blue-100 text-blue-800',
        'qualified': 'bg-yellow-100 text-yellow-800',
        'proposal': 'bg-purple-100 text-purple-800',
        'converted': 'bg-green-100 text-green-800',
        'lost': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const texts = {
        'new': 'Novo',
        'qualified': 'Qualificado',
        'proposal': 'Proposta',
        'converted': 'Convertido',
        'lost': 'Perdido'
    };
    return texts[status] || status;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
        loadingState.classList.toggle('hidden', !show);
    }
}

function showEmptyState() {
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('table-view').classList.add('hidden');
    document.getElementById('grid-view').classList.add('hidden');
}

function hideEmptyState() {
    document.getElementById('empty-state').classList.add('hidden');
}

// Funções globais
window.toggleView = function(view) {
    currentView = view;

    // Atualizar botões
    document.getElementById('table-view-btn').classList.toggle('bg-primary', view === 'table');
    document.getElementById('table-view-btn').classList.toggle('text-white', view === 'table');
    document.getElementById('table-view-btn').classList.toggle('bg-gray-200', view !== 'table');
    document.getElementById('table-view-btn').classList.toggle('text-gray-600', view !== 'table');

    document.getElementById('grid-view-btn').classList.toggle('bg-primary', view === 'grid');
    document.getElementById('grid-view-btn').classList.toggle('text-white', view === 'grid');
    document.getElementById('grid-view-btn').classList.toggle('bg-gray-200', view !== 'grid');
    document.getElementById('grid-view-btn').classList.toggle('text-gray-600', view !== 'grid');

    renderLeads();
};

window.openNewLeadModal = function() {
    editingLeadId = null;
    document.getElementById('new-lead-modal').classList.remove('hidden');
    document.getElementById('new-lead-form').reset();
    document.querySelector('#new-lead-modal h3').textContent = '➕ Novo Lead';
    document.querySelector('#new-lead-form button[type=submit]').textContent = 'Criar Lead';
};

window.closeNewLeadModal = function() {
    editingLeadId = null;
    document.getElementById('new-lead-modal').classList.add('hidden');
    document.getElementById('new-lead-form').reset();
};

window.refreshLeads = function() {
    loadLeads();
};

window.applyFilters = applyFilters;

window.openWhatsApp = function(phone, name) {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${name}! Sou da ALSHAM e gostaria de conversar sobre nossa proposta. Quando seria um bom momento para você?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
};

window.editLead = function(leadId) {
    editingLeadId = leadId;
    const lead = allLeads.find(l => l.id === leadId);
    if (!lead) return showNotification('Lead não encontrado', 'error');

    document.getElementById('new-lead-modal').classList.remove('hidden');
    const form = document.getElementById('new-lead-form');
    // Preenche campos
    form.name.value = lead.name || '';
    form.email.value = lead.email || '';
    form.phone.value = lead.phone || '';
    form.company.value = lead.company || '';
    form.position.value = lead.position || '';
    form.status.value = lead.status || 'new';
    form.value.value = lead.value || '';
    form.source.value = lead.source || 'website';
    form.notes.value = lead.notes || '';
    document.querySelector('#new-lead-modal h3').textContent = '✏️ Editar Lead';
    document.querySelector('#new-lead-form button[type=submit]').textContent = 'Salvar Alterações';
};

window.deleteLead = async function(leadId) {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    try {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', leadId);

        if (error) throw error;

        showNotification('Lead excluído com sucesso!', 'success');
        await loadLeads();

    } catch (error) {
        console.error('Erro ao excluir lead:', error);
        showNotification('Erro ao excluir lead', 'error');
    }
};

window.exportLeads = function() {
    if (!allLeads.length) return showNotification('Sem leads para exportar!', 'info');

    // Monta csv
    const headers = ['Nome', 'E-mail', 'Telefone', 'Empresa', 'Cargo', 'Status', 'Valor', 'Origem', 'Observações', 'Data'];
    const rows = allLeads.map(l => [
        l.name, l.email, l.phone, l.company, l.position, getStatusText(l.status), l.value, l.source, l.notes, formatDate(l.created_at)
    ]);
    const csvContent = [headers, ...rows].map(row =>
        row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(';')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Exportação concluída!', 'success');
};
