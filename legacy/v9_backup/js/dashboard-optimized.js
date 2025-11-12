/**
 * 🎯 Dashboard Otimizado - Carregamento inteligente
 * Performance-first architecture
 */

import { createChart } from '../lib/chart-loader.js';
import { exportToPDF, exportToExcel } from '../lib/export-loader.js';

class DashboardOptimized {
  constructor() {
    this.charts = new Map();
    this.data = null;
    this.init();
  }

  async init() {
    // 1. Carregar dados críticos primeiro
    await this.loadCriticalData();
    
    // 2. Renderizar UI imediatamente
    this.renderUI();
    
    // 3. Observar gráficos com Intersection Observer
    this.observeCharts();
    
    // 4. Adicionar listeners de export
    this.setupExportButtons();
  }

  async loadCriticalData() {
    // Carrega apenas dados essenciais (KPIs, etc)
    console.log('📊 Carregando dados críticos...');
    // Seu código de carregamento aqui
  }

  renderUI() {
    // Renderiza estrutura sem gráficos pesados
    console.log('🎨 Renderizando UI...');
  }

  observeCharts() {
    // Lazy load charts com Intersection Observer
    const chartContainers = document.querySelectorAll('.chart-container');
    
    const observer = new IntersectionObserver(async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const chartId = entry.target.dataset.chartId;
          await this.loadChart(chartId);
          observer.unobserve(entry.target);
        }
      }
    }, {
      rootMargin: '50px' // Carrega 50px antes de aparecer
    });

    chartContainers.forEach(container => observer.observe(container));
  }

  async loadChart(chartId) {
    if (this.charts.has(chartId)) return;

    console.log(`📈 Carregando gráfico: ${chartId}`);
    
    const config = this.getChartConfig(chartId);
    const chart = await createChart(chartId, config);
    this.charts.set(chartId, chart);
  }

  getChartConfig(chartId) {
    // Retorna configuração do gráfico
    return {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: {}
    };
  }

  setupExportButtons() {
    // Botão PDF
    document.getElementById('export-pdf')?.addEventListener('click', async () => {
      console.log('📄 Exportando PDF...');
      await exportToPDF(this.data);
    });

    // Botão Excel
    document.getElementById('export-excel')?.addEventListener('click', async () => {
      console.log('📊 Exportando Excel...');
      await exportToExcel(this.data);
    });
  }
}

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardOptimized();
  });
} else {
  window.dashboardApp = new DashboardOptimized();
}

export default DashboardOptimized;
