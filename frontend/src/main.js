import './style.css'
import { getDashboardKPIs, getLeads } from '../lib/supabase.js'

// Timers globais para controle e limpeza
let kpiTimer = null
let leadTimer = null

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 ALSHAM 360° PRIMA - Dashboard Obra-Prima Carregado!')

  initializeAnimations()
  initializeMicroInteractions()
  initializeGamification()
  initializeCelebrations()

  await renderKPIs()
  await renderLeadsTable()
  await renderChartWithRealData()

  startRealTimeUpdates()
  window.addEventListener('beforeunload', stopRealTimeUpdates)
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopRealTimeUpdates() : startRealTimeUpdates()
  })
})

// ===== KPIs DINÂMICOS =====
async function renderKPIs() {
  const kpiBox = document.getElementById('dashboard-kpis')
  if (!kpiBox) return
  kpiBox.innerHTML = `<div class="text-gray-400 text-sm p-6">Carregando KPIs...</div>`
  const { data, error } = await getDashboardKPIs()
  if (error || !data) {
    kpiBox.innerHTML = `<div class="text-red-500 p-6">Erro ao buscar KPIs: ${error?.message || 'Sem dados'}</div>`
    return
  }
  kpiBox.innerHTML = `
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-lg shadow p-4 flex flex-col">
        <span class="text-gray-500 text-xs mb-1">Leads Totais</span>
        <span class="text-2xl font-bold">${data.totalLeads}</span>
      </div>
      <div class="bg-white rounded-lg shadow p-4 flex flex-col">
        <span class="text-gray-500 text-xs mb-1">Qualificados</span>
        <span class="text-2xl font-bold">${data.qualifiedLeads}</span>
      </div>
      <div class="bg-white rounded-lg shadow p-4 flex flex-col">
        <span class="text-gray-500 text-xs mb-1">Conversão</span>
        <span class="text-2xl font-bold">${data.conversionRate}%</span>
      </div>
      <div class="bg-white rounded-lg shadow p-4 flex flex-col">
        <span class="text-gray-500 text-xs mb-1">Receita</span>
        <span class="text-2xl font-bold">R$ ${data.totalRevenue.toLocaleString()}</span>
      </div>
    </div>
    <div class="text-xs text-gray-400 mt-2">Atualizado: ${new Date(data.lastUpdated).toLocaleTimeString()}</div>
  `
}

// ===== LEADS DINÂMICOS =====
async function renderLeadsTable() {
  const leadsBox = document.getElementById('leads-table')
  if (!leadsBox) return
  leadsBox.innerHTML = `<div class="text-gray-400 text-sm p-6">Carregando leads...</div>`
  const { data, error } = await getLeads()
  if (error || !data) {
    leadsBox.innerHTML = `<div class="text-red-500 p-6">Erro ao buscar leads: ${error?.message || 'Sem dados'}</div>`
    return
  }
  leadsBox.innerHTML = `
    <table class="w-full text-sm text-left">
      <thead>
        <tr>
          <th class="p-2">Nome</th>
          <th class="p-2">Empresa</th>
          <th class="p-2">Status</th>
          <th class="p-2">Score IA</th>
        </tr>
      </thead>
      <tbody>
        ${data.slice(0, 10).map(lead => `
          <tr>
            <td class="p-2 font-medium">${lead.nome}</td>
            <td class="p-2">${lead.empresa || '-'}</td>
            <td class="p-2">${lead.status}</td>
            <td class="p-2">${lead.score_ia ?? '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="text-xs text-gray-400 mt-2">${data.length} leads encontrados</div>
  `
}

// ===== GRÁFICO DINÂMICO COM DADOS REAIS =====
async function renderChartWithRealData() {
  const canvas = document.getElementById('performanceChart')
  if (!canvas) return

  const { data, error } = await getLeads()
  if (error || !data) return createAlternativeChart(canvas)

  // Agrupa receita por dia da semana (seg a dom)
  const receitaPorDia = [0, 0, 0, 0, 0, 0, 0]
  data.forEach(l => {
    if (l.status === 'converted' && l.created_at) {
      const dia = new Date(l.created_at).getDay()
      receitaPorDia[dia] += Number(l.value || 0)
    }
  })
  // Reorganiza para começar na segunda
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const serie = [1,2,3,4,5,6,0].map(idx => receitaPorDia[idx])

  if (typeof Chart === 'undefined') {
    createAlternativeChart(canvas, serie)
    return
  }

  const chartData = {
    labels,
    datasets: [{
      label: 'Receita (R$)',
      data: serie,
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  }

  const config = {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' },
          ticks: {
            color: '#64748b',
            callback: v => 'R$ ' + Number(v).toLocaleString()
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748b' }
        }
      },
      interaction: { intersect: false, mode: 'index' },
      elements: { point: { hoverBackgroundColor: '#8b5cf6' } }
    }
  }

  new Chart(canvas, config)
}

function createAlternativeChart(canvasEl, data = [0,0,0,0,0,0,0]) {
  const container = canvasEl.parentNode
  if (!container) return

  const max = Math.max(...data, 1)

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.setAttribute('viewBox', '0 0 400 200')

  let pathData = ''
  data.forEach((value, index) => {
    const x = (index / (data.length - 1)) * 350 + 25
    const y = 180 - (value / max) * 150
    pathData += (index === 0 ? 'M' : 'L') + x + ',' + y
  })

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', pathData)
  path.setAttribute('stroke', '#8b5cf6')
  path.setAttribute('stroke-width', '3')
  path.setAttribute('fill', 'none')
  svg.appendChild(path)

  data.forEach((value, index) => {
    const x = (index / (data.length - 1)) * 350 + 25
    const y = 180 - (value / max) * 150
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', x)
    circle.setAttribute('cy', y)
    circle.setAttribute('r', '4')
    circle.setAttribute('fill', '#8b5cf6')
    svg.appendChild(circle)
  })

  container.replaceChild(svg, canvasEl)
}

// ===== ANIMAÇÕES DE ENTRADA =====
function initializeAnimations() {
  const cards = document.querySelectorAll('.bg-white')
  cards.forEach((card, index) => {
    card.style.opacity = '0'
    card.style.transform = 'translateY(20px)'
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease-out'
      card.style.opacity = '1'
      card.style.transform = 'translateY(0)'
    }, index * 100)
  })
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion) setTimeout(() => animateProgressBars(), 1000)
}

function animateProgressBars() {
  const progressBars = document.querySelectorAll('[data-progress]')
  progressBars.forEach(bar => {
    const finalWidth = bar.style.width || '0%'
    bar.style.width = '0%'
    bar.style.transition = 'width 1.5s ease-out'
    setTimeout(() => { bar.style.width = finalWidth }, 100)
  })
}

// ===== MICRO-INTERAÇÕES PREMIUM =====
function initializeMicroInteractions() {
  const kpiCards = document.querySelectorAll('.hover\\:shadow-md, .bg-white')
  kpiCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-4px) scale(1.02)'
      this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)'
      this.style.transition = 'all 0.3s ease-out'
    })
    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)'
      this.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
    })
  })
  const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary')
  buttons.forEach(button => button.addEventListener('click', createRippleEffect))
  const actionButtons = document.querySelectorAll('[class*="btn-"]')
  actionButtons.forEach(button => {
    button.addEventListener('click', function () {
      if (this.textContent.includes('Ligar') || this.textContent.includes('Email')) {
        simulateAction(this)
      }
    })
  })
}

function createRippleEffect(e) {
  const button = e.currentTarget
  const ripple = document.createElement('span')
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = e.clientX - rect.left - size / 2
  const y = e.clientY - rect.top - size / 2

  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = x + 'px'
  ripple.style.top = y + 'px'
  ripple.style.position = 'absolute'
  ripple.style.borderRadius = '50%'
  ripple.style.background = 'rgba(255, 255, 255, 0.6)'
  ripple.style.transform = 'scale(0)'
  ripple.style.animation = 'ripple 0.6s linear'
  ripple.style.pointerEvents = 'none'

  button.style.position = 'relative'
  button.style.overflow = 'hidden'
  button.appendChild(ripple)

  setTimeout(() => ripple.remove(), 800)
}

function simulateAction(button) {
  const originalText = button.textContent
  const originalBg = button.style.background

  button.textContent = '⏳ Processando...'
  button.style.background = '#6b7280'
  button.disabled = true

  setTimeout(() => {
    button.textContent = '✅ Concluído!'
    button.style.background = '#10b981'
    setTimeout(() => {
      button.textContent = originalText
      button.style.background = originalBg
      button.disabled = false
      if (originalText.includes('Ligar')) triggerMiniCelebration()
    }, 1500)
  }, 2000)
}

// ===== GAMIFICAÇÃO INTERATIVA =====
function initializeGamification() {
  const levelProgress = document.querySelector('.bg-gradient-premium')
  if (levelProgress) levelProgress.addEventListener('click', showLevelDetails)
  const streakElement = document.querySelector('.text-primary')
  if (streakElement && streakElement.textContent.includes('12 dias')) animateStreakCounter(streakElement)
  const badgeButton = document.querySelector('button[class*="btn-primary"]')
  if (badgeButton && badgeButton.textContent.includes('Conquistas')) badgeButton.addEventListener('click', showAchievements)
}

function animateStreakCounter(element) {
  let count = 0
  const target = 12
  const duration = 2000
  const increment = target / (duration / 50)

  const timer = setInterval(() => {
    count += increment
    if (count >= target) {
      count = target
      clearInterval(timer)
      element.classList.add('micro-bounce')
    }
    element.textContent = Math.floor(count) + ' dias'
  }, 50)
}

function showLevelDetails() {
  createModal('🏆 Level 7: Vendedor Expert', `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span>XP Atual:</span>
        <span class="font-bold text-secondary">2,400 / 3,000</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div class="bg-gradient-premium h-3 rounded-full" data-progress style="width: 80%"></div>
      </div>
      <div class="text-sm text-gray-600">
        <p>🎯 Próximo Level: <strong>Vendedor Master</strong></p>
        <p>📈 Faltam apenas 600 XP!</p>
        <p>💡 Dica: Complete 3 propostas para ganhar 200 XP cada</p>
      </div>
    </div>
  `)
}

function showAchievements() {
  const achievements = [
    { icon: '🔥', name: 'Streak Master', desc: '10 dias consecutivos', unlocked: true },
    { icon: '📞', name: 'Call Champion', desc: '50 ligações em um dia', unlocked: true },
    { icon: '💰', name: 'Revenue Rocket', desc: 'R$ 10k em uma semana', unlocked: false },
    { icon: '🎯', name: 'Precision Pro', desc: '90% taxa de conversão', unlocked: false },
    { icon: '⚡', name: 'Speed Demon', desc: '5 vendas em 1 hora', unlocked: false },
    { icon: '👑', name: 'Sales King', desc: 'Top 1 do mês', unlocked: false }
  ]

  const achievementsList = achievements.map(a => `
    <div class="flex items-center space-x-3 p-3 rounded-lg ${a.unlocked ? 'bg-green-50' : 'bg-gray-50'}">
      <span class="text-2xl ${a.unlocked ? '' : 'grayscale opacity-50'}">${a.icon}</span>
      <div class="flex-1">
        <p class="font-medium ${a.unlocked ? 'text-gray-900' : 'text-gray-500'}">${a.name}</p>
        <p class="text-sm text-gray-600">${a.desc}</p>
      </div>
      ${a.unlocked ? '<span class="text-green-600 text-sm font-semibold">✓ Desbloqueado</span>' : '<span class="text-gray-400 text-sm">🔒 Bloqueado</span>'}
    </div>
  `).join('')

  createModal('🏅 Suas Conquistas', `
    <div class="space-y-3 max-h-96 overflow-y-auto">
      ${achievementsList}
    </div>
  `)
}

// ===== CELEBRAÇÕES E FEEDBACK =====
function initializeCelebrations() {
  setTimeout(() => {
    if (Math.random() > 0.7) triggerAchievementUnlock()
  }, 3000)
}

function triggerMiniCelebration() {
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#8b5cf6', '#3b82f6', '#10b981'] })
  } else {
    showCelebrationAnimation()
  }
  if (navigator.vibrate) navigator.vibrate([100, 50, 100])
}

function triggerAchievementUnlock() {
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#ec4899'] })
  }
  showAchievementNotification('🔥 Streak Master Desbloqueado!', 'Você manteve sua sequência por 10 dias!')
}

function showCelebrationAnimation() {
  const celebration = document.createElement('div')
  celebration.className = 'fixed inset-0 pointer-events-none z-50'
  celebration.innerHTML = `
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div class="text-6xl animate-bounce">🎉</div>
    </div>
  `
  document.body.appendChild(celebration)
  setTimeout(() => celebration.remove(), 2000)
}

function showAchievementNotification(title, message) {
  const notification = document.createElement('div')
  notification.className = 'fixed top-4 right-4 bg-white rounded-xl p-4 shadow-lg border border-gray-200 z-50 transform translate-x-full transition-transform duration-500'
  notification.innerHTML = `
    <div class="flex items-start space-x-3">
      <div class="w-10 h-10 bg-gradient-premium rounded-full flex items-center justify-center">
        <span class="text-white text-lg">🏆</span>
      </div>
      <div class="flex-1">
        <p class="font-semibold text-gray-900">${title}</p>
        <p class="text-sm text-gray-600">${message}</p>
      </div>
      <button class="text-gray-400 hover:text-gray-600 close-btn" aria-label="Fechar notificação">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `
  document.body.appendChild(notification)

  const closeBtn = notification.querySelector('.close-btn')
  closeBtn?.addEventListener('click', () => notification.remove(), { once: true })

  setTimeout(() => { notification.style.transform = 'translateX(0)' }, 100)
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)'
    setTimeout(() => notification.remove(), 500)
  }, 5000)
}

// ===== ATUALIZAÇÕES EM TEMPO REAL =====
function startRealTimeUpdates() {
  stopRealTimeUpdates()
  kpiTimer = setInterval(renderKPIs, 30000)
  leadTimer = setInterval(renderLeadsTable, 45000)
}
function stopRealTimeUpdates() {
  if (kpiTimer) clearInterval(kpiTimer)
  if (leadTimer) clearInterval(leadTimer)
  kpiTimer = leadTimer = null
}

// ===== ESTILOS AUXILIARES (injetados) =====
const style = document.createElement('style')
style.textContent = `
  @keyframes ripple { to { transform: scale(4); opacity: 0; } }
  .grayscale { filter: grayscale(100%); }
  @keyframes micro-bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  .micro-bounce { animation: micro-bounce 0.6s ease-in-out; }
`
document.head.appendChild(style)

console.log('✨ ALSHAM 360° PRIMA - UI premium consolidado carregado!')
