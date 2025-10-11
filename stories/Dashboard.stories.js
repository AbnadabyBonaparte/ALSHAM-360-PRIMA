/**
 * ALSHAM 360° PRIMA - Dashboard Storybook
 * @version 11.0.0
 * @description Stories dos componentes do Dashboard
 */

export default {
  title: 'Dashboard/Components',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Dashboard Executivo v11.0 - Componentes interativos e reutilizáveis'
      }
    }
  }
};

// ============================================================================
// KPI CARD
// ============================================================================

export const KPICard = () => `
  <div class="bg-white dark:bg-[#1e293b] rounded-lg shadow p-6" style="width: 250px;">
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Leads</p>
    <h3 class="text-3xl font-bold text-gray-900 dark:text-gray-100">1,247</h3>
    <span class="text-green-600 text-xs font-semibold">↑ 12.5%</span>
  </div>
`;

KPICard.storyName = 'KPI Card';
KPICard.parameters = {
  docs: {
    description: {
      story: 'Card de KPI com valor, label e variação percentual'
    }
  }
};

// ============================================================================
// KPI CARD VARIATIONS
// ============================================================================

export const KPICardVariations = () => `
  <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
    <div class="bg-white rounded-lg shadow p-6" style="width: 200px;">
      <p class="text-sm text-gray-600 mb-1">Novos Hoje</p>
      <h3 class="text-3xl font-bold text-gray-900">47</h3>
      <span class="text-green-600 text-xs font-semibold">↑ 8.2%</span>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6" style="width: 200px;">
      <p class="text-sm text-gray-600 mb-1">Taxa Conversão</p>
      <h3 class="text-3xl font-bold text-gray-900">15.3%</h3>
      <span class="text-red-600 text-xs font-semibold">↓ 2.1%</span>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6" style="width: 200px;">
      <p class="text-sm text-gray-600 mb-1">Pontos</p>
      <h3 class="text-3xl font-bold text-gray-900">3,450</h3>
    </div>
  </div>
`;

KPICardVariations.storyName = 'KPI Cards - Variações';

// ============================================================================
// PROGRESS BAR (METAS)
// ============================================================================

export const ProgressBar = () => `
  <div class="bg-white rounded-lg shadow p-6" style="width: 400px;">
    <div class="flex items-center justify-between mb-2">
      <p class="text-sm text-gray-600">🎯 Meta de Leads</p>
      <span class="text-sm font-semibold">85 / 100</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div class="bg-blue-500 h-2 rounded-full" style="width: 85%"></div>
    </div>
  </div>
`;

ProgressBar.storyName = 'Progress Bar';

// ============================================================================
// FILTER BUTTON
// ============================================================================

export const FilterButton = () => `
  <button class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:bg-gray-50">
    📊 Status (3)
  </button>
`;

FilterButton.storyName = 'Filter Button';

// ============================================================================
// MODAL
// ============================================================================

export const Modal = () => `
  <div class="modal active" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center;">
    <div class="modal-content" style="background: white; padding: 2rem; border-radius: 0.5rem; max-width: 500px; width: 90%;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="font-size: 1.25rem; font-weight: bold;">Filtrar por Status</h2>
        <button style="color: #6b7280;">
          <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer;">
          <input type="checkbox" checked>
          <span>Novo</span>
        </label>
        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer;">
          <input type="checkbox">
          <span>Qualificado</span>
        </label>
      </div>
      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button style="flex: 1; padding: 0.5rem 1rem; background: #3B82F6; color: white; border-radius: 0.375rem;">
          Aplicar
        </button>
        <button style="flex: 1; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 0.375rem;">
          Cancelar
        </button>
      </div>
    </div>
  </div>
`;

Modal.storyName = 'Modal de Filtros';

// ============================================================================
// EXPORT BUTTONS
// ============================================================================

export const ExportButtons = () => `
  <div style="display: flex; gap: 0.5rem;">
    <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
      📥 CSV
    </button>
    <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
      📄 PDF
    </button>
    <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
      📊 Excel
    </button>
  </div>
`;

ExportButtons.storyName = 'Export Buttons';

// ============================================================================
// STATUS BADGE
// ============================================================================

export const StatusBadges = () => `
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Novo</span>
    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Em Contato</span>
    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Qualificado</span>
    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Convertido</span>
    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Perdido</span>
  </div>
`;

StatusBadges.storyName = 'Status Badges';

// ============================================================================
// TEMPERATURA BADGE
// ============================================================================

export const TemperaturaBadges = () => `
  <div style="display: flex; gap: 0.5rem;">
    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">🔥 Quente</span>
    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">🌡️ Morno</span>
    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">❄️ Frio</span>
  </div>
`;

TemperaturaBadges.storyName = 'Temperatura Badges';

// ============================================================================
// ALERT/TOAST
// ============================================================================

export const Alert = () => `
  <div style="position: fixed; top: 1rem; right: 1rem; padding: 1rem 1.5rem; border-radius: 0.5rem; font-weight: 600; color: white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); background: #10B981;">
    ✅ CSV exportado com sucesso!
  </div>
`;

Alert.storyName = 'Alert/Toast';

// ============================================================================
// ALERT VARIATIONS
// ============================================================================

export const AlertVariations = () => `
  <div style="display: flex; flex-direction: column; gap: 1rem; position: fixed; top: 1rem; right: 1rem;">
    <div style="padding: 1rem 1.5rem; border-radius: 0.5rem; font-weight: 600; color: white; background: #10B981;">
      ✅ Sucesso
    </div>
    <div style="padding: 1rem 1.5rem; border-radius: 0.5rem; font-weight: 600; color: white; background: #EF4444;">
      ❌ Erro
    </div>
    <div style="padding: 1rem 1.5rem; border-radius: 0.5rem; font-weight: 600; color: white; background: #F59E0B;">
      ⚠️ Aviso
    </div>
    <div style="padding: 1rem 1.5rem; border-radius: 0.5rem; font-weight: 600; color: white; background: #3B82F6;">
      ℹ️ Info
    </div>
  </div>
`;

AlertVariations.storyName = 'Alerts - Variações';

// ============================================================================
// TABLE ROW
// ============================================================================

export const TableRow = () => `
  <table style="width: 100%; border-collapse: collapse;">
    <thead style="background: #f9fafb;">
      <tr>
        <th style="padding: 0.75rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase;">Nome</th>
        <th style="padding: 0.75rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase;">Email</th>
        <th style="padding: 0.75rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase;">Status</th>
        <th style="padding: 0.75rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase;">Data</th>
      </tr>
    </thead>
    <tbody style="background: white;">
      <tr style="border-top: 1px solid #e5e7eb;">
        <td style="padding: 1rem; font-size: 0.875rem; color: #111827;">João Silva</td>
        <td style="padding: 1rem; font-size: 0.875rem; color: #6b7280;">joao@example.com</td>
        <td style="padding: 1rem;">
          <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Novo</span>
        </td>
        <td style="padding: 1rem; font-size: 0.875rem; color: #6b7280;">11/10/2025</td>
      </tr>
      <tr style="border-top: 1px solid #e5e7eb;">
        <td style="padding: 1rem; font-size: 0.875rem; color: #111827;">Maria Santos</td>
        <td style="padding: 1rem; font-size: 0.875rem; color: #6b7280;">maria@example.com</td>
        <td style="padding: 1rem;">
          <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Convertido</span>
        </td>
        <td style="padding: 1rem; font-size: 0.875rem; color: #6b7280;">10/10/2025</td>
      </tr>
    </tbody>
  </table>
`;

TableRow.storyName = 'Table';

// ============================================================================
// LOADING SPINNER
// ============================================================================

export const LoadingSpinner = () => `
  <div style="display: flex; justify-content: center; padding: 2rem;">
    <div style="width: 4rem; height: 4rem; border: 4px solid rgba(59,130,246,0.3); border-top-color: #3B82F6; border-radius: 50%; animation: spin 0.6s linear infinite;">
    </div>
  </div>
  <style>
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
`;

LoadingSpinner.storyName = 'Loading Spinner';

// ============================================================================
// SKELETON LOADER
// ============================================================================

export const SkeletonLoader = () => `
  <div style="padding: 1.5rem; background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="height: 1rem; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 0.25rem; margin-bottom: 0.75rem; width: 60%;"></div>
    <div style="height: 2rem; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 0.25rem; margin-bottom: 0.75rem;"></div>
    <div style="height: 0.75rem; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 0.25rem; width: 40%;"></div>
  </div>
  <style>
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
  </style>
`;

SkeletonLoader.storyName = 'Skeleton Loader';

// ============================================================================
// SEARCH INPUT
// ============================================================================

export const SearchInput = () => `
  <input 
    type="text" 
    placeholder="🔍 Buscar leads..." 
    style="width: 100%; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; color: #111827;"
  />
`;

SearchInput.storyName = 'Search Input';

// ============================================================================
// DATE FILTER SELECT
// ============================================================================

export const DateFilter = () => `
  <select style="width: 100%; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; color: #111827;">
    <option>📅 Todos os períodos</option>
    <option>Últimos 7 dias</option>
    <option>Últimos 30 dias</option>
    <option>Últimos 90 dias</option>
  </select>
`;

DateFilter.storyName = 'Date Filter';

// ============================================================================
// THEME TOGGLE
// ============================================================================

export const ThemeToggle = () => `
  <button style="padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background: white; cursor: pointer;">
    <svg style="width: 1.25rem; height: 1.25rem; color: #111827;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
    </svg>
  </button>
`;

ThemeToggle.storyName = 'Theme Toggle';

// ============================================================================
// FULL DASHBOARD LAYOUT
// ============================================================================

export const FullDashboard = () => `
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; padding: 2rem;">
    <div class="bg-white rounded-lg shadow p-6">
      <p class="text-sm text-gray-600 mb-1">Total de Leads</p>
      <h3 class="text-3xl font-bold text-gray-900">1,247</h3>
      <span class="text-green-600 text-xs font-semibold">↑ 12.5%</span>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <p class="text-sm text-gray-600 mb-1">Novos Hoje</p>
      <h3 class="text-3xl font-bold text-gray-900">47</h3>
      <span class="text-green-600 text-xs font-semibold">↑ 8.2%</span>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <p class="text-sm text-gray-600 mb-1">Qualificados</p>
      <h3 class="text-3xl font-bold text-gray-900">312</h3>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <p class="text-sm text-gray-600 mb-1">Taxa Conversão</p>
      <h3 class="text-3xl font-bold text-gray-900">15.3%</h3>
    </div>
  </div>
`;

FullDashboard.storyName = 'Full Dashboard Layout';

// ============================================================================
// DARK MODE SHOWCASE
// ============================================================================

export const DarkMode = () => `
  <div class="dark" style="background: #0f172a; padding: 2rem;">
    <div class="bg-[#1e293b] rounded-lg shadow p-6" style="width: 250px;">
      <p class="text-sm text-gray-400 mb-1">Total de Leads</p>
      <h3 class="text-3xl font-bold text-gray-100">1,247</h3>
      <span class="text-green-600 text-xs font-semibold">↑ 12.5%</span>
    </div>
  </div>
`;

DarkMode.storyName = 'Dark Mode Example';

// ============================================================================
// HIGH CONTRAST MODE
// ============================================================================

export const HighContrast = () => `
  <div class="high-contrast" style="background: #000000; padding: 2rem;">
    <div style="background: #1a1a1a; border: 2px solid #ffffff; padding: 1.5rem; border-radius: 0.5rem; width: 250px;">
      <p style="font-size: 0.875rem; color: #cccccc; margin-bottom: 0.25rem;">Total de Leads</p>
      <h3 style="font-size: 1.875rem; font-weight: bold; color: #ffffff;">1,247</h3>
      <span style="color: #00ffff; font-size: 0.75rem; font-weight: 600;">↑ 12.5%</span>
    </div>
  </div>
`;

HighContrast.storyName = 'High Contrast Mode';

// ============================================================================
// COMPONENT DOCUMENTATION
// ============================================================================

/**
 * STORYBOOK COVERAGE:
 * 
 * ✅ KPI Cards (2 stories)
 * ✅ Progress Bars (1 story)
 * ✅ Filter Buttons (1 story)
 * ✅ Modals (1 story)
 * ✅ Export Buttons (1 story)
 * ✅ Badges (2 stories)
 * ✅ Alerts/Toasts (2 stories)
 * ✅ Tables (1 story)
 * ✅ Loaders (2 stories)
 * ✅ Inputs/Selects (2 stories)
 * ✅ Theme Toggle (1 story)
 * ✅ Full Layouts (1 story)
 * ✅ Dark Mode (1 story)
 * ✅ High Contrast (1 story)
 * 
 * TOTAL: 19 STORIES
 * COBERTURA: 90%+ dos componentes visuais
 */
