// src/pages/Leads.tsx
import { useState, useMemo, useEffect } from 'react';
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
import LeadActions from '../components/leads/LeadActions';

type ViewMode = 'grid' | 'list' | 'kanban' | 'network';

export default function Leads() {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 FIX 1: CARREGAR LEADS DO BANCO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const { leads, loading, error, refetch } = useLeadsAI();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showAIPanel, setShowAIPanel] = useState(false); // 🔧 FIX: Começa fechado
  const [filters, setFilters] = useState<any>({});

  // 🔧 FIX: Log para debug
  useEffect(() => {
    console.log('🔄 Leads carregados:', leads?.length || 0);
    console.log('📊 Leads:', leads);
  }, [leads]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 FIX 2: FILTROS FUNCIONANDO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const filteredLeads = useMemo(() => {
    if (!leads || leads.length === 0) return [];
    
    let result = [...leads];

    // Busca por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((l: any) => 
        l.nome?.toLowerCase().includes(searchLower) ||
        l.email?.toLowerCase().includes(searchLower) ||
        l.empresa?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de status
    if (filters.status && filters.status !== 'all') {
      result = result.filter((l: any) => l.status === filters.status);
    }

    // Filtro de score
    if (filters.score && filters.score !== 'all') {
      switch (filters.score) {
        case 'hot':
          result = result.filter((l: any) => (l.score_ia || 0) >= 80);
          break;
        case 'warm':
          result = result.filter((l: any) => (l.score_ia || 0) >= 60 && (l.score_ia || 0) < 80);
          break;
        case 'cold':
          result = result.filter((l: any) => (l.score_ia || 0) >= 40 && (l.score_ia || 0) < 60);
          break;
        case 'ice':
          result = result.filter((l: any) => (l.score_ia || 0) < 40);
          break;
      }
    }

    // Filtro de origem
    if (filters.source && filters.source !== 'all') {
      result = result.filter((l: any) => l.origem === filters.source);
    }

    // Filtro de risco
    if (filters.risk && filters.risk !== 'all') {
      const riskScore = (l: any) => l.ai_risk_score || 0;
      switch (filters.risk) {
        case 'high':
          result = result.filter((l: any) => riskScore(l) >= 60);
          break;
        case 'medium':
          result = result.filter((l: any) => riskScore(l) >= 30 && riskScore(l) < 60);
          break;
        case 'low':
          result = result.filter((l: any) => riskScore(l) < 30);
          break;
      }
    }

    // Filtro de conversão
    if (filters.conversion && filters.conversion !== 'all') {
      const convProb = (l: any) => l.ai_conversion_probability || 0;
      switch (filters.conversion) {
        case 'vhigh':
          result = result.filter((l: any) => convProb(l) >= 80);
          break;
        case 'high':
          result = result.filter((l: any) => convProb(l) >= 60 && convProb(l) < 80);
          break;
        case 'medium':
          result = result.filter((l: any) => convProb(l) >= 40 && convProb(l) < 60);
          break;
        case 'low':
          result = result.filter((l: any) => convProb(l) < 40);
          break;
      }
    }

    console.log('🔍 Filtros aplicados:', filters);
    console.log('📊 Resultados filtrados:', result.length);

    return result;
  }, [leads, filters]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 ANALYTICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    const qualified = leads.filter((l: any) => 
      l.status === 'qualified' || l.status === 'qualificado'
    ).length;
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 FIX 3: KANBAN COM STAGES CORRETOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const pipelineStages = useMemo(() => {
    const stages = [
      { id: 'novo', name: 'Novo', color: 'from-blue-500 to-indigo-500', leads: [] as any[] },
      { id: 'contacted', name: 'Contatado', color: 'from-purple-500 to-pink-500', leads: [] as any[] },
      { id: 'qualified', name: 'Qualificado', color: 'from-emerald-500 to-teal-500', leads: [] as any[] },
      { id: 'qualificado', name: 'Qualificado', color: 'from-emerald-500 to-teal-500', leads: [] as any[] },
      { id: 'proposal', name: 'Proposta', color: 'from-orange-500 to-yellow-500', leads: [] as any[] },
      { id: 'negotiation', name: 'Negociação', color: 'from-cyan-500 to-blue-500', leads: [] as any[] },
      { id: 'won', name: 'Ganho', color: 'from-green-500 to-emerald-500', leads: [] as any[] },
      { id: 'convertido', name: 'Convertido', color: 'from-green-500 to-emerald-500', leads: [] as any[] },
    ];

    if (!filteredLeads || !Array.isArray(filteredLeads)) {
      return stages;
    }

    filteredLeads.forEach((lead: any) => {
      const stage = stages.find(s => s.id === (lead.status || 'novo').toLowerCase());
      if (stage) stage.leads.push(lead);
    });

    // Remover stages vazios duplicados
    return stages.filter((s, i, arr) => 
      s.leads.length > 0 || !arr.slice(i + 1).some(other => other.name === s.name)
    );
  }, [filteredLeads]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleDateString('pt-BR', { month: 'short' });
    });

    const historical = [45, 52, 48, 61, 58, 67];
    const predictions = [72, 78, 85];

    return {
      labels: [...last6Months, 'Próx', '+2', '+3'],
      historical,
      predictions: [...historical.slice(-1), ...predictions]
    };
  }, []);

  // Prepare network data
  const networkData = useMemo(() => {
    if (!selectedLead) return { nodes: [], edges: [] };

    const nodes = [
      { 
        id: selectedLead.id, 
        label: selectedLead.nome || `${selectedLead.first_name || ''} ${selectedLead.last_name || ''}`.trim(), 
        type: 'lead' as const, 
        value: selectedLead.score_ia || 50 
      },
    ];

    const edges: any[] = [];

    if (selectedLead.ai_similar_leads) {
      selectedLead.ai_similar_leads.forEach((similar: any) => {
        nodes.push({
          id: similar.lead.id,
          label: similar.lead.nome || `${similar.lead.first_name} ${similar.lead.last_name}`,
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 FIX 4: CRIAR NOVO LEAD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleCreateLead = () => {
    // TODO: Implementar modal de criação
    alert('Funcionalidade de criar lead será implementada em breve!');
  };

  // Error state
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
    <div className="min-h-screen bg-[var(--bg-dark)] text-white p-4 sm:p-6 lg:p-8 container-responsive">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            🎯 Leads Intelligence
          </h1>
          <p className="text-sm sm:text-base text-gray-400">Gestão inteligente com IA e previsões em tempo real</p>
        </div>

        <LeadActions 
          leads={leads || []}
          onImport={() => {
            console.log('📥 Importar concluído, recarregando...');
            if (refetch) refetch();
          }}
          onExport={() => {
            console.log('📤 Exportar concluído!');
          }}
          onNewLead={handleCreateLead}
        />
      </div>

      {/* Analytics Cards */}
      {!loading && (
        <div className="kpi-grid mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-gray-400">Total</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{analytics.total}</div>
            <div className="text-xs text-gray-500 mt-1">leads no funil</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-gray-400">Qualificados</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{analytics.qualified}</div>
            <div className="text-xs text-emerald-500 mt-1">+{analytics.conversionRate.toFixed(1)}% taxa</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-base sm:text-lg">
                🔥
              </div>
              <span className="text-xs sm:text-sm text-gray-400">Quentes</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-400">{analytics.hot}</div>
            <div className="text-xs text-orange-500 mt-1">alta conversão</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-base sm:text-lg">
                ⚠️
              </div>
              <span className="text-xs sm:text-sm text-gray-400">Em Risco</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{analytics.atRisk}</div>
            <div className="text-xs text-yellow-500 mt-1">precisam atenção</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-base sm:text-lg">
                💚
              </div>
              <span className="text-xs sm:text-sm text-gray-400">Health Score</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">{analytics.healthScore}%</div>
            <div className="text-xs text-purple-500 mt-1">saúde geral</div>
          </motion.div>
        </div>
      )}

      {/* View Mode Selector & AI Panel Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="theme-selector-container">
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
                theme-selector-button
                ${viewMode === mode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                  : 'bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-white hover:border-neutral-700'
                }
              `}
            >
              <Icon className="theme-selector-icon" />
              <span className="hidden sm:inline text-sm font-medium ml-2">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* 🔧 FIX 5: BOTÃO MOSTRAR IA PANEL */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAIPanel(!showAIPanel)}
          className={`
            px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm sm:text-base
            ${showAIPanel
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20'
            }
          `}
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">{showAIPanel ? 'Ocultar' : 'Mostrar'} IA Panel</span>
          <span className="sm:hidden">IA</span>
        </motion.button>
      </div>

      {/* Smart Filters */}
      <div className="mb-6 sm:mb-8">
        <SmartFilters 
          onFilterChange={setFilters}
          totalResults={filteredLeads.length}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🔧 FIX 6: IA PANEL SEM PRECISAR DE LEAD SELECIONADO */}
        {showAIPanel && (
          <div className="lg:col-span-1 space-y-6">
            <AIInsightsPanel
              insights={selectedLead?.ai_insights || []}
              conversionProb={selectedLead?.ai_conversion_probability || 0}
              healthScore={selectedLead?.ai_health_score || 0}
              riskScore={selectedLead?.ai_risk_score || 0}
              nextAction={selectedLead?.ai_next_best_action}
            />

            {selectedLead && (
              <>
                <ActivityTimeline activities={activities} maxItems={5} />
                <RelationshipNetwork
                  nodes={networkData.nodes}
                  edges={networkData.edges}
                  centerNodeId={selectedLead.id}
                />
              </>
            )}
          </div>
        )}

        {/* Right Column - Leads Display */}
        <div className={showAIPanel ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-gray-400">Carregando leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <p className="text-xl sm:text-2xl text-gray-400 mb-2">Nenhum lead encontrado</p>
              <p className="text-sm text-gray-500">Tente ajustar os filtros ou criar um novo lead</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === 'grid' && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="leads-grid"
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
                  <LeadsPipeline 
                    stages={pipelineStages}
                    onLeadMove={(leadId, newStageId) => {
                      console.log(`Lead ${leadId} movido para ${newStageId}`);
                      // TODO: Atualizar no banco
                    }}
                  />
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

              {viewMode === 'list' && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto"
                >
                  <table className="w-full">
                    <thead className="bg-neutral-950 border-b border-neutral-800">
                      <tr>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-400">Nome</th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-400">Email</th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-400 hidden sm:table-cell">Empresa</th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-400">Status</th>
                        <th className="px-4 sm:px-6 py-4 text-center text-xs sm:text-sm font-semibold text-gray-400">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {filteredLeads.map((lead: any) => (
                        <tr 
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="hover:bg-neutral-950 cursor-pointer transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-4 text-white font-medium text-sm">{lead.nome || '-'}</td>
                          <td className="px-4 sm:px-6 py-4 text-gray-400 text-sm">{lead.email || '-'}</td>
                          <td className="px-4 sm:px-6 py-4 text-gray-400 text-sm hidden sm:table-cell">{lead.empresa || '-'}</td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">
                              {lead.status || 'novo'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-center">
                            <span className="text-emerald-400 font-bold text-sm">{lead.score_ia || 0}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Predictive Chart */}
      <div className="mt-6 sm:mt-8">
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
