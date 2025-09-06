// ALSHAM 360° PRIMA - Leads Controller
// CRUD completo de leads com filtros e busca

import { 
    getCurrentUser,
    getLeads,
    createLead,
    updateLead,
    deleteLead,
    getCurrentOrgId
} from '../lib/supabase.js'

// Estado da aplicação
let currentOrgId = null
let allLeads = []
let filteredLeads = []
let currentView = 'table' // 'table' ou 'grid'
let editingLead = null

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Leads controller loaded - ALSHAM 360° PRIMA')
    initializeLeads()
})

// ===== INICIALIZAÇÃO =====
async function initializeLeads() {
    try {
        // Verificar autenticação
        const { user, profile } = await getCurrentUser()
        
        if (!user || !profile) {
            console.log('Usuário não autenticado, redirecionando...')
            window.location.href = 'login.html'
            return
        }
        
        currentOrgId = profile.org_id || getCurrentOrgId()
        
        // Configurar event listeners
        setupEventListeners()
        
        // Carregar leads
        await loadLeads()
        
        // Atualizar informações do usuário
        updateUserInfo(profile)
        
        console.log('✅ Leads inicializados com sucesso')
        
    } catch (error) {
        console.error('Erro ao inicializar leads:', error)
        showError('Erro ao carregar página de leads')
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Botões de novo lead
    document.getElementById('new-lead-btn').addEventListener('click', openNewLeadModal)
    document.getElementById('empty-new-lead-btn').addEventListener('click', openNewLeadModal)
    
    // Modal
    document.getElementById('close-modal').addEventListener('click', closeModal)
    document.getElementById('cancel-lead').addEventListener('click', closeModal)
    document.getElementById('lead-form').addEventListener('submit', handleLeadSubmit)
    
    // Filtros e busca
    document.getElementById('search-input').addEventListener('input', handleSearch)
    document.getElementById('status-filter').addEventListener('change', handleFilter)
    document.getElementById('period-filter').addEventListener('change', handleFilter)
    document.getElementById('clear-filters').addEventListener('click', clearFilters)
    
    // Visualização
    document.getElementById('view-table').addEventListener('click', () => switchView('table'))
    document.getElementById('view-grid').addEventListener('click', () => switchView('grid'))
    
    // Fechar modal clicando fora
    document.getElementById('lead-modal').addEventListener('click', function(e) {
        if (e.target === this) closeModal()
    })
}

// ===== CARREGAMENTO DE DADOS =====
async function loadLeads() {
    try {
        showLoading()
        
        const result = await getLeads(currentOrgId)
        
        if (result.error) {
            throw result.error
        }
        
        allLeads = result.data || []
        filteredLeads = [...allLeads]
        
        renderLeads()
        updateLeadsCount()
        
        hideLoading()
        
    } catch (error) {
        console.error('Erro ao carregar leads:', error)
        showError('Erro ao carregar leads')
        hideLoading()
    }
}

// ===== RENDERIZAÇÃO =====
function renderLeads() {
    if (filteredLeads.length === 0) {
        showEmptyState()
        return
    }
    
    hideEmptyState()
    
    if (currentView === 'table') {
        renderTableView()
    } else {
        renderGridView()
    }
}

function renderTableView() {
    const tbody = document.getElementById('leads-table-body')
    
    tbody.innerHTML = filteredLeads.map(lead => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="py-4 px-6">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-premium rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-semibold">${getInitials(lead.name)}</span>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${lead.name || 'N/A'}</div>
                        <div class="text-sm text-gray-500">${lead.company || ''}</div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="text-gray-900">${lead.email || 'N/A'}</div>
                <div class="text-sm text-gray-500">${lead.phone || ''}</div>
            </td>
            <td class="py-4 px-6">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}">
                    ${getStatusLabel(lead.status)}
                </span>
            </td>
            <td class="py-4 px-6 font-medium text-gray-900">${formatCurrency(lead.value || 0)}</td>
            <td class="py-4 px-6 text-gray-600">${formatDate(lead.created_at)}</td>
            <td class="py-4 px-6">
                <div class="flex items-center space-x-2">
                    <button onclick="editLead('${lead.id}')" class="p-1 text-blue-600 hover:text-blue-800 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteLead('${lead.id}')" class="p-1 text-red-600 hover:text-red-800 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('')
}

function renderGridView() {
    const grid = document.getElementById('leads-grid')
    
    grid.innerHTML = filteredLeads.map(lead => `
        <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-premium rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold">${getInitials(lead.name)}</span>
                </div>
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}">
                    ${getStatusLabel(lead.status)}
                </span>
            </div>
            
            <div class="mb-4">
                <h3 class="font-semibold text-gray-900 mb-1">${lead.name || 'N/A'}</h3>
                <p class="text-sm text-gray-600">${lead.company || ''}</p>
                <p class="text-sm text-gray-600">${lead.email || ''}</p>
            </div>
            
            <div class="flex items-center justify-between mb-4">
                <div class="text-lg font-bold text-gray-900">${formatCurrency(lead.value || 0)}</div>
                <div class="text-sm text-gray-500">${formatDate(lead.created_at)}</div>
            </div>
            
            <div class="flex items-center space-x-2">
                <button onclick="editLead('${lead.id}')" class="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    Editar
                </button>
                <button onclick="deleteLead('${lead.id}')" class="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    Excluir
                </button>
            </div>
        </div>
    `).join('')
}

// ===== MODAL DE LEAD =====
function openNewLeadModal() {
    editingLead = null
    document.getElementById('modal-title').textContent = 'Novo Lead'
    document.getElementById('lead-form').reset()
    document.getElementById('lead-modal').classList.remove('hidden')
}

function openEditLeadModal(lead) {
    editingLead = lead
    document.getElementById('modal-title').textContent = 'Editar Lead'
    
    // Preencher formulário
    document.getElementById('lead-name').value = lead.name || ''
    document.getElementById('lead-email').value = lead.email || ''
    document.getElementById('lead-phone').value = lead.phone || ''
    document.getElementById('lead-company').value = lead.company || ''
    document.getElementById('lead-status').value = lead.status || 'new'
    document.getElementById('lead-value').value = lead.value || ''
    document.getElementById('lead-notes').value = lead.notes || ''
    
    document.getElementById('lead-modal').classList.remove('hidden')
}

function closeModal() {
    document.getElementById('lead-modal').classList.add('hidden')
    editingLead = null
}

// ===== CRUD OPERATIONS =====
async function handleLeadSubmit(e) {
    e.preventDefault()
    
    const formData = {
        name: document.getElementById('lead-name').value,
        email: document.getElementById('lead-email').value,
        phone: document.getElementById('lead-phone').value,
        company: document.getElementById('lead-company').value,
        status: document.getElementById('lead-status').value,
        value: parseFloat(document.getElementById('lead-value').value) || 0,
        notes: document.getElementById('lead-notes').value
    }
    
    try {
        showLoading()
        
        if (editingLead) {
            // Atualizar lead existente
            const result = await updateLead(editingLead.id, formData, currentOrgId)
            if (result.error) throw result.error
            showSuccess('Lead atualizado com sucesso!')
        } else {
            // Criar novo lead
            const result = await createLead(formData, currentOrgId)
            if (result.error) throw result.error
            showSuccess('Lead criado com sucesso!')
        }
        
        closeModal()
        await loadLeads()
        
    } catch (error) {
        console.error('Erro ao salvar lead:', error)
        showError('Erro ao salvar lead')
    } finally {
        hideLoading()
    }
}

// ===== FILTROS E BUSCA =====
function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase()
    applyFilters()
}

function handleFilter() {
    applyFilters()
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase()
    const statusFilter = document.getElementById('status-filter').value
    const periodFilter = document.getElementById('period-filter').value
    
    filteredLeads = allLeads.filter(lead => {
        // Filtro de busca
        const matchesSearch = !searchTerm || 
            (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
            (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
            (lead.company && lead.company.toLowerCase().includes(searchTerm))
        
        // Filtro de status
        const matchesStatus = !statusFilter || lead.status === statusFilter
        
        // Filtro de período
        const matchesPeriod = !periodFilter || matchesPeriodFilter(lead.created_at, periodFilter)
        
        return matchesSearch && matchesStatus && matchesPeriod
    })
    
    renderLeads()
    updateLeadsCount()
}

function matchesPeriodFilter(dateString, period) {
    if (!dateString) return false
    
    const date = new Date(dateString)
    const now = new Date()
    
    switch (period) {
        case 'today':
            return date.toDateString() === now.toDateString()
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return date >= weekAgo
        case 'month':
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3)
            const leadQuarter = Math.floor(date.getMonth() / 3)
            return leadQuarter === quarter && date.getFullYear() === now.getFullYear()
        default:
            return true
    }
}

function clearFilters() {
    document.getElementById('search-input').value = ''
    document.getElementById('status-filter').value = ''
    document.getElementById('period-filter').value = ''
    applyFilters()
}

// ===== VISUALIZAÇÃO =====
function switchView(view) {
    currentView = view
    
    const tableView = document.getElementById('leads-table-view')
    const gridView = document.getElementById('leads-grid-view')
    const tableBtn = document.getElementById('view-table')
    const gridBtn = document.getElementById('view-grid')
    
    if (view === 'table') {
        tableView.classList.remove('hidden')
        gridView.classList.add('hidden')
        tableBtn.classList.add('text-primary')
        tableBtn.classList.remove('text-gray-400')
        gridBtn.classList.add('text-gray-400')
        gridBtn.classList.remove('text-primary')
    } else {
        tableView.classList.add('hidden')
        gridView.classList.remove('hidden')
        gridBtn.classList.add('text-primary')
        gridBtn.classList.remove('text-gray-400')
        tableBtn.classList.add('text-gray-400')
        tableBtn.classList.remove('text-primary')
    }
    
    renderLeads()
}

// ===== UTILITÁRIOS =====
function getInitials(name) {
    if (!name) return 'N'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getStatusColor(status) {
    const colors = {
        'new': 'bg-blue-100 text-blue-800',
        'qualified': 'bg-yellow-100 text-yellow-800',
        'proposal': 'bg-purple-100 text-purple-800',
        'converted': 'bg-green-100 text-green-800',
        'lost': 'bg-red-100 text-red-800'
    }
    return colors[status] || colors.new
}

function getStatusLabel(status) {
    const labels = {
        'new': 'Novo',
        'qualified': 'Qualificado',
        'proposal': 'Proposta',
        'converted': 'Convertido',
        'lost': 'Perdido'
    }
    return labels[status] || 'Novo'
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value)
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date)
}

function updateLeadsCount() {
    const count = filteredLeads.length
    document.getElementById('leads-count').textContent = `${count} lead${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`
}

function updateUserInfo(profile) {
    if (profile?.full_name) {
        const nameElements = document.querySelectorAll('[data-auth="user-name"]')
        nameElements.forEach(el => el.textContent = profile.full_name)
        
        const avatarElements = document.querySelectorAll('[data-auth="user-avatar"]')
        const initials = getInitials(profile.full_name)
        avatarElements.forEach(el => el.textContent = initials)
    }
}

function showEmptyState() {
    document.getElementById('leads-table-view').classList.add('hidden')
    document.getElementById('leads-grid-view').classList.add('hidden')
    document.getElementById('empty-state').classList.remove('hidden')
}

function hideEmptyState() {
    document.getElementById('empty-state').classList.add('hidden')
    if (currentView === 'table') {
        document.getElementById('leads-table-view').classList.remove('hidden')
    } else {
        document.getElementById('leads-grid-view').classList.remove('hidden')
    }
}

function showLoading() {
    // Implementar loading state se necessário
}

function hideLoading() {
    // Implementar loading state se necessário
}

function showSuccess(message) {
    showNotification(message, 'success')
}

function showError(message) {
    showNotification(message, 'error')
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${getNotificationClasses(type)}`
    
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
                ${getNotificationIcon(type)}
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)'
    }, 100)
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)'
        setTimeout(() => notification.remove(), 300)
    }, 5000)
}

function getNotificationClasses(type) {
    switch (type) {
        case 'success':
            return 'bg-green-50 border border-green-200 text-green-800'
        case 'error':
            return 'bg-red-50 border border-red-200 text-red-800'
        case 'warning':
            return 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        default:
            return 'bg-blue-50 border border-blue-200 text-blue-800'
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
        case 'error':
            return '<svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
        default:
            return '<svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
    }
}

// ===== API GLOBAL =====
window.editLead = function(leadId) {
    const lead = allLeads.find(l => l.id === leadId)
    if (lead) {
        openEditLeadModal(lead)
    }
}

window.deleteLead = async function(leadId) {
    if (!confirm('Tem certeza que deseja excluir este lead?')) {
        return
    }
    
    try {
        showLoading()
        
        const result = await deleteLead(leadId, currentOrgId)
        if (result.error) throw result.error
        
        showSuccess('Lead excluído com sucesso!')
        await loadLeads()
        
    } catch (error) {
        console.error('Erro ao excluir lead:', error)
        showError('Erro ao excluir lead')
    } finally {
        hideLoading()
    }
}

console.log('📋 Leads controller configurado - ALSHAM 360° PRIMA')

