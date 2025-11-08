// src/pages/Leads.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, List, Kanban, Network, Plus, Download, 
  Upload, Filter, Settings, Sparkles, TrendingUp
} from 'lucide-react';
import { useLeadsAI } from '../hooks/useLeadsAI';
import AIInsightsPanel from '../components/leads/AIInsightsPanel';
import SmartFilters from '../components/leads/SmartFilters';
import LeadCard from '../components/leads/LeadCard';
import LeadsPipeline from '../components/leads/LeadsPipeline';
import PredictiveChart from '../components/leads/PredictiveChart';
import ActivityTimeline from '../components/leads/ActivityTimeline';
import RelationshipNetwork from '../components/leads/RelationshipNetwork';
import LeadScoreGauge from '../components/leads/LeadScoreGauge';

type ViewMode = 'grid' | 'list' | 'kanban' | 'network';

export default function Leads() {
  // ✅ CORREÇÃO: Usar os valores corretos do hook
  const { leads, loading, error } = useLeadsAI();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [filters, setFilters] = useState<any>({});

  // ✅ CORREÇÃO: Calcular analytics a partir dos leads
  const analytics = useMemo(() => {
    if (!leads || leads.length === 0) {
      return {
        total: 0,
        qualified: 0,
        hot: 0,
        atRisk: 0,
        healthScore: 0,
        conversionRate: 0
      };
    }

    const qualified = leads.filter((l: any) => l.status === 'qualified').length;
    const hot = leads.filter((l: any) => (l.score_ia || 0) >= 70).length;
    const atRisk = leads.filter((l: any) => (l.score_ia || 0) < 40).length;
    const avgScore = leads.reduce((sum: number, l: any) => sum + (l.score_ia || 50), 0) / leads.length;

    return {
      total: leads.length,
      qualified,
      hot,
      atRisk,
      healthScore: Math.round(avgScore),
      conversionRate: leads.length > 0 ? (qualified / leads.length) * 100 : 0
    };
  }, [leads]);

  // ✅ CORREÇÃO: Aplicar filtros localmente
  const filteredLeads = useMemo(() => {
    if (!leads || leads.length === 0) return [];
    
    let result = [...leads];

    // Aplicar filtros se existirem
    if (filters.status) {
      result = result.filter((l: any) => l.status === filters.status);
    }
    if (filters.minScore) {
      result = result.filter((l: any) => (l.score_ia || 0) >= filters.minScore);
    }

    return result;
  }, [leads, filters]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleDateString('pt-BR', { month: 'short' });
    });

    // Mock historical data (em produção, buscar do Supabase)
    const historical = [45, 52, 48, 61, 58, 67];
    const predictions = [72, 78, 85];

    return {
      labels: [...last6Months, 'Próx', '+2', '+3'],
      historical,
      predictions: [...historical.slice(-1), ...predictions]
    };
  }, []);

  // ✅ CORREÇÃO: Verificar se filteredLeads existe antes do forEach
  const pipelineStages = useMemo(() => {
    const stages = [
      { id: 'new', name: 'Novo', color: 'from-blue-500 to-indigo-500', leads: [] as any[] },
      { id: 'contacted', name: 'Contatado', color: 'from-purple-500 to-pink-500', leads: [] as any[] },
      { id: 'qualified', name: 'Qualificado', color: 'from-emerald-500 to-teal-500', leads: [] as any[] },
      { id: 'proposal', name: 'Proposta', color: 'from-orange-500 to-yellow-500', leads: [] as any[] },
      { id: 'negotiation', name: 'Negociação', color: 'from-cyan-500 to-blue-500', leads: [] as any[] },
    ];

    // ✅ CORREÇÃO: Guard clause
    if (!filteredLeads || !Array.isArray(filteredLeads)) {
      return stages;
    }

    filteredLeads.forEach((lead: any) => {
      const stage = stages.find(s => s.id === lead.status);
      if (stage) stage.leads.push(lead);
    });

    return stages;
  }, [filteredLeads]);

  // Prepare network data
  const networkData = useMemo(() => {
    if (!selectedLead) return { nodes: [], edges: [] };

    const nodes = [
      { id: selectedLead.id, label: `${selectedLead.first_name} ${selectedLead.last_name}`, type: 'lead' as const, value: selectedLead.score_ia || 50 },
    ];

    const edges: any[] = [];

    // Add similar leads
    if (selectedLead.ai_similar_leads) {
      selectedLead.ai_similar_leads.forEach((similar: any) => {
        nodes.push({
          id: similar.lead.id,
          label: `${similar.lead.first_name} ${similar.lead.last_name}`,
          type: 'lead' as const,
          value: similar.similarity
        });
        edges.push({
          from: selectedLead.id,
          to: similar.lead.id,
          strength: similar.similarity / 100
        });
      });
    }

    return { nodes, edges };
  }, [selectedLead]);

  // Activities mock data
  const activities = useMemo(() => {
    if (!selectedLead) return [];
    
    return [
      {
        id: '1',
        type: 'email' as const,
        title: 'Email enviado',
        description: 'Proposta comercial enviada com sucesso',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: 'João Silva',
        status: 'completed' as const
      },
      {
        id: '2',
        type: 'call' as const,
        title: 'Ligação agendada',
        description: 'Follow-up comercial - Discussão de features',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        user: 'Maria Santos',
        status: 'scheduled' as const
      },
      {
        id: '3',
        type: 'meeting' as const,
        title: 'Reunião realizada',
        description: 'Apresentação de demo do produto',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        user: 'Carlos Oliveira',
        status: 'completed' as const
      },
    ];
  }, [selectedLead]);

  // ✅ CORREÇÃO: Mostrar erro se houver
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] text-white p-8 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar leads</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            🎯 Leads Intelligence
          </h1>
          <p className="text-gray-400">Gestão inteligente com IA e previsões em tempo real</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-emerald-500 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-emerald-500 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Novo Lead
          </motion.button>
        </div>
      </div>

      {/* KPIs Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <div className="text-3xl font-bold text-white">{analytics.total}</div>
            <div className="text-xs text-gray-500 mt-1">leads no funil</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-400">Qualificados</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">{analytics.qualified}</div>
            <div className="text-xs text-emerald-500 mt-1">+{analytics.conversionRate.toFixed(1)}% taxa</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                🔥
              </div>
              <span className="text-sm text-gray-400">Quentes</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">{analytics.hot}</div>
            <div className="text-xs text-orange-500 mt-1">alta conversão</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                ⚠️
              </div>
              <span className="text-sm text-gray-400">Em Risco</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{analytics.atRisk}</div>
            <div className="text-xs text-yellow-500 mt-1">precisam atenção</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                💚
              </div>
              <span className="text-sm text-gray-400">Health Score</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{analytics.healthScore}%</div>
            <div className="text-xs text-purple-500 mt-1">saúde geral</div>
          </motion.div>
        </div>
      )}

      {/* View Mode Selector & Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          {[
            { mode: 'grid', icon: LayoutGrid, label: 'Grade' },
            { mode: 'list', icon: List, label: 'Lista' },
            { mode: 'kanban', icon: Kanban, label: 'Kanban' },
            { mode: 'network', icon: Network, label: 'Rede' },
          ].map(({ mode, icon: Icon, label }) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(mode as ViewMode)}
              className={`
                px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                ${viewMode === mode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </motion.button>
          ))}
        </div>

        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/20 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {showAIPanel ? 'Ocultar' : 'Mostrar'} IA Panel
        </button>
      </div>

      {/* Smart Filters */}
      <div className="mb-8">
        <SmartFilters 
          onFilterChange={setFilters}
          totalResults={filteredLeads.length}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - AI Insights (Optional) */}
        {showAIPanel && selectedLead && (
          <div className="lg:col-span-1 space-y-6">
            <AIInsightsPanel
              insights={selectedLead.ai_insights || []}
              conversionProb={selectedLead.ai_conversion_probability || 0}
              healthScore={selectedLead.ai_health_score || 0}
              riskScore={selectedLead.ai_risk_score || 0}
              nextAction={selectedLead.ai_next_best_action}
            />

            <ActivityTimeline activities={activities} maxItems={5} />

            <RelationshipNetwork
              nodes={networkData.nodes}
              edges={networkData.edges}
              centerNodeId={selectedLead.id}
            />
          </div>
        )}

        {/* Right Column - Leads Display */}
        <div className={showAIPanel && selectedLead ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === 'grid' && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filteredLeads.map((lead: any, index: number) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      delay={index * 0.05}
                      onView={(lead) => setSelectedLead(lead)}
                    />
                  ))}
                </motion.div>
              )}

              {viewMode === 'kanban' && (
                <motion.div
                  key="kanban"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LeadsPipeline stages={pipelineStages} />
                </motion.div>
              )}

              {viewMode === 'network' && selectedLead && (
                <motion.div
                  key="network"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RelationshipNetwork
                    nodes={networkData.nodes}
                    edges={networkData.edges}
                    centerNodeId={selectedLead.id}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Predictive Chart */}
      <div className="mt-8">
        <PredictiveChart
          historicalData={chartData.historical}
          predictions={chartData.predictions}
          labels={chartData.labels}
          title="Previsão de Conversões - Próximos 3 Meses"
          metric="conversões"
        />
      </div>
    </div>
  );
}
