/**
 * 🎯 Dashboard v12.0 - Lazy Loading Architecture
 * Performance-first dashboard com carregamento sob demanda
 * 
 * @author AbnadabyBonaparte
 * @since 2025-10-14
 * @version 12.0.0
 */

import { createChart, observeCharts, preloadChartJS } from '../lib/chart-loader.js';
import { exportToPDF, exportToExcel, setupExportButtons } from '../lib/export-loader.js';

class DashboardV12 {
  constructor() {
    this.charts = new Map();
    this.data = null;
    this.init();
  }

  async init() {
    console.log('🎯 [Dashboard v12] Inicializando...');

    // 1. Carregar dados críticos
    await this.loadCriticalData();
    
    // 2. Renderizar UI básica
    this.renderUI();
    
    // 3. Setup lazy loading de gráficos
    this.setupLazyCharts();
    
    // 4. Setup botões de export
    this.setupExports();
    
    // 5. Preload Chart.js em idle time (opcional)
    preloadChartJS();
    
    console.log('✅ [Dashboard v12] Inicializado com sucesso!');
  }

  async loadCriticalData() {
    console.log('📊 [Dashboard v12] Carregando dados críticos...');
    
    // Implementar carregamento via Supabase
    // Por enquanto, dados mock
    this.data = {
      leads: [],
      kpis: {},
      charts: {}
    };
  }

  renderUI() {
    console.log('🎨 [Dashboard v12] Renderizando UI...');
    
    // Renderizar KPIs, filtros, etc
    // Sem gráficos pesados ainda
  }

  setupLazyCharts() {
    console.log('📊 [Dashboard v12] Configurando lazy loading de gráficos...');
    
    // Observa containers de gráficos
    observeCharts('.chart-container', async (chartId) => {
      await this.loadChart(chartId);
    });
  }

  async loadChart(chartId) {
    if (this.charts.has(chartId)) {
      console.log(`⚠️ [Dashboard v12] Gráfico #${chartId} já carregado`);
      return;
    }

    console.log(`📊 [Dashboard v12] Carregando gráfico #${chartId}...`);

    const config = this.getChartConfig(chartId);
    
    try {
      const chart = await createChart(chartId, config);
      this.charts.set(chartId, chart);
      console.log(`✅ [Dashboard v12] Gráfico #${chartId} carregado!`);
    } catch (error) {
      console.error(`❌ [Dashboard v12] Erro ao carregar #${chartId}:`, error);
    }
  }

  getChartConfig(chartId) {
    // Retorna configuração específica de cada gráfico
    const configs = {
      'status-chart': {
        type: 'doughnut',
        data: {
          labels: ['Novo', 'Qualificado', 'Proposta', 'Ganho'],
          datasets: [{
            data: [30, 25, 20, 25],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#22C55E']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      },
      'daily-chart': {
        type: 'line',
        data: {
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Novos Leads',
            data: [12, 19, 15, 17, 14, 20, 18],
            borderColor: '#3B82F6',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
      // Adicionar outros gráficos...
    };

    return configs[chartId] || { type: 'bar', data: {}, options: {} };
  }

  setupExports() {
    console.log('📄 [Dashboard v12] Configurando exports...');
    
    // Setup automático via data-attributes
    setupExportButtons('[data-export]');
    
    // Ou manualmente:
    document.getElementById('export-pdf')?.addEventListener('click', async () => {
      await exportToPDF(this.data.leads, 'leads-report.pdf', {
        title: 'Relatório de Leads - ALSHAM 360°'
      });
    });

    document.getElementById('export-excel')?.addEventListener('click', async () => {
      await exportToExcel(this.data.leads, 'leads-report.xlsx', {
        sheetName: 'Leads'
      });
    });
  }

  // Métodos auxiliares
  showLoading() {
    document.getElementById('loading-indicator')?.classList.remove('hidden');
  }

  hideLoading() {
    document.getElementById('loading-indicator')?.classList.add('hidden');
  }

  showToast(message, type = 'info') {
    // Implementar toast notification
    console.log(`[Toast ${type}]:`, message);
  }
}

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardV12();
  });
} else {
  window.dashboardApp = new DashboardV12();
}

export default DashboardV12;
