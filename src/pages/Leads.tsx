import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, List, Kanban, Network, Sparkles, TrendingUp
} from 'lucide-react';
import { useLeadsAI } from '../hooks/useLeadsAI';
import AIInsightsPanel from '../components/leads/AIInsightsPanel';
import SmartFilters from '../components/leads/SmartFilters';
import LeadCard from '../components/leads/LeadCard';
import LeadsPipeline from '../components/leads/LeadsPipeline';
import PredictiveChart from '../components/leads/PredictiveChart';
import ActivityTimeline from '../components/leads/ActivityTimeline';
import RelationshipNetwork from '../components/leads/RelationshipNetwork';
import LeadActions from '../components/leads/LeadActions';
import { createLead, getActiveOrganization } from '../lib/supabase-full.js';
// import { toast } from 'sonner'; // Descomente caso use a lib sonner para toasts modernos

type ViewMode = 'grid' | 'list' | 'kanban' | 'network';

interface Lead {
  id: string;
  nome?: string;
  email?: string;
  empresa?: string;
  status?: string;
  score_ia?: number;
  origem?: string;
  ai_risk_score?: number;
  ai_conversion_probability?: number;
  ai_similar_leads?: { similarity: number; lead: Lead }[];
  ai_insights?: Array<{ title: string; description: string }>;
  ai_health_score?: number;
  ai_next_best_action?: string;
  first_name?: string;
  last_name?: string;
  // ...outros campos que você usar
}

interface LeadFilters {
  search?: string;
  status?: string;
  score?: 'hot' | 'warm' | 'cold' | 'ice' | 'all';
  source?: string;
  risk?: 'high' | 'medium' | 'low' | 'all';
  conversion?: 'vhigh' | 'high' | 'medium' | 'low' | 'all';
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  leads: Lead[];
}

export default function Leads() {
  const { leads, loading, error, refetch } = useLeadsAI();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [organizationUnavailable, setOrganizationUnavailable] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔄 Leads carregados:', leads?.length || 0);
      console.log('📊 Leads:', leads);
    }
  }, [leads]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const orgId = await getActiveOrganization({ forceRefresh: false });
      if (mounted) {
        // FIX: expõe estado de autenticação/organização para feedback visual
        setOrganizationUnavailable(!orgId);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredLeads: Lead[] = useMemo(() => {
    if (!leads || leads.length === 0) return [];
    let result = [...leads];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(l =>
        (l.nome ?? '').toLowerCase().includes(searchLower) ||
        (l.email ?? '').toLowerCase().includes(searchLower) ||
        (l.empresa ?? '').toLowerCase().includes(searchLower)
      );
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(l => l.status === filters.status);
    }
    if (filters.score && filters.score !== 'all') {
      result = result.filter(l => {
        const s = l.score_ia ?? 0;
        switch (filters.score) {
          case 'hot': return s >= 80;
          case 'warm': return s >= 60 && s < 80;
          case 'cold': return s >= 40 && s < 60;
          case 'ice': return s < 40;
          default: return true;
        }
      });
    }
    if (filters.source && filters.source !== 'all') {
      result = result.filter(l => l.origem === filters.source);
    }
    if (filters.risk && filters.risk !== 'all') {
      result = result.filter(l => {
        const rs = l.ai_risk_score ?? 0;
        switch (filters.risk) {
          case 'high': return rs >= 60;
          case 'medium': return rs >= 30 && rs < 60;
          case 'low': return rs < 30;
          default: return true;
        }
      });
    }
    if (filters.conversion && filters.conversion !== 'all') {
      result = result.filter(l => {
        const conv = l.ai_conversion_probability ?? 0;
        switch (filters.conversion) {
          case 'vhigh': return conv >= 80;
          case 'high': return conv >= 60 && conv < 80;
          case 'medium': return conv >= 40 && conv < 60;
          case 'low': return conv < 40;
          default: return true;
        }
      });
    }
    if (import.meta.env.DEV) {
      console.log('🔍 Filtros aplicados:', filters);
      console.log('📊 Resultados filtrados:', result.length);
    }
    return result;
  }, [leads, filters]);

  const analytics = useMemo(() => {
    if (!leads || leads.length === 0) {
      return {
        total: 0, qualified: 0, hot: 0, atRisk: 0, healthScore: 0, conversionRate: 0
      };
    }
    const qualified = leads.filter(l => l.status === 'qualified' || l.status === 'qualificado').length;
    const hot = leads.filter(l => (l.score_ia ?? 0) >= 70).length;
    const atRisk = leads.filter(l => (l.score_ia ?? 0) < 40).length;
    const avgScore = leads.reduce((sum: number, l) => sum + (l.score_ia ?? 50), 0) / leads.length;
    return {
      total: leads.length,
      qualified,
      hot,
      atRisk,
      healthScore: Math.round(avgScore),
      conversionRate: leads.length > 0 ? (qualified / leads.length) * 100 : 0
    };
  }, [leads]);

  const pipelineStages: PipelineStage[] = useMemo(() => {
    const stages: PipelineStage[] = [
      { id: 'novo', name: 'Novo', color: 'from-[var(--accent-blue)] to-[var(--accent-indigo)]', leads: [] },
      { id: 'contacted', name: 'Contatado', color: 'from-[var(--accent-purple)] to-[var(--accent-pink)]', leads: [] },
      { id: 'qualified', name: 'Qualificado', color: 'from-[var(--accent-emerald)] to-[var(--accent-teal)]', leads: [] },
      { id: 'qualificado', name: 'Qualificado', color: 'from-[var(--accent-emerald)] to-[var(--accent-teal)]', leads: [] },
      { id: 'proposal', name: 'Proposta', color: 'from-[var(--accent-orange)] to-[var(--accent-yellow)]', leads: [] },
      { id: 'negotiation', name: 'Negociação', color: 'from-[var(--accent-cyan)] to-[var(--accent-blue)]', leads: [] },
      { id: 'won', name: 'Ganho', color: 'from-[var(--accent-green)] to-[var(--accent-emerald)]', leads: [] },
      { id: 'convertido', name: 'Convertido', color: 'from-[var(--accent-green)] to-[var(--accent-emerald)]', leads: [] },
    ];
    if (!filteredLeads || !Array.isArray(filteredLeads)) return stages;
    filteredLeads.forEach(l => {
      const stage = stages.find(s => s.id === (l.status ?? 'novo').toLowerCase());
      if (stage) stage.leads.push(l);
    });
    return stages.filter((s, i, arr) =>
      s.leads.length > 0 || !arr.slice(i + 1).some(other => other.name === s.name)
    );
  }, [filteredLeads]);

  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleDateString('pt-BR', { month: 'short' });
    });
    const historical = leads ? [45, 52, 48, 61, 58, 67] : [45, 52, 48, 61, 58, 67]; // Sugestão: aqui, implemente gráfico REAL extraindo Qtd por mês usando 'created_at'
    const predictions = [72, 78, 85];
    return {
      labels: [...last6Months, 'Próx', '+2', '+3'],
      historical,
      predictions: [...historical.slice(-1), ...predictions]
    };
  }, [leads]);

  const networkData = useMemo(() => {
    if (!selectedLead) return { nodes: [], edges: [] };
    const nodes = [
      {
        id: selectedLead.id,
        label: selectedLead.nome ?? `${selectedLead.first_name ?? ''} ${selectedLead.last_name ?? ''}`.trim(),
        type: 'lead' as const,
        value: selectedLead.score_ia ?? 50
      }
    ];
    const edges: any[] = [];
    if (selectedLead.ai_similar_leads) {
      selectedLead.ai_similar_leads.forEach(similar => {
        nodes.push({
          id: similar.lead.id,
          label: similar.lead.nome ?? `${similar.lead.first_name} ${similar.lead.last_name}`,
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
      }
    ]; // Mock de atividades de lead (ideal: trazer do backend no futuro!)
  }, [selectedLead]);

  const handleCreateLead = async (newLeadData: Partial<Lead>) => {
  try {
    const orgId = await getActiveOrganization();
    if (!orgId) {
      console.error('Organização ativa não encontrada. Abortando criação de lead.');
      return;
    }
    await createLead(orgId, newLeadData);
    await refetch?.();
    setIsCreateModalOpen(false); // Fechar modal após criar
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 230);
  } catch (err: any) {
    console.error(err);
  }
};

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] text-white p-8 flex items-center justify-center">
        <div role="alert" aria-live="assertive" className="bg-red-500/10 border border-red-500 rounded-xl p-6 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar leads</h2>
          <p className="text-gray-300">{error}</p>
          <button onClick={refetch} className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-white)] p-4 sm:p-6 lg:p-8 container-responsive"
      tabIndex={-1}
      aria-label="Painel de Leads"
    >
      {organizationUnavailable && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-[var(--accent-alert)]/40 bg-[var(--accent-alert)]/10 p-4 text-[var(--accent-alert)]"
        >
          <p className="font-semibold">Não encontramos uma organização ativa.</p>
          <p className="text-sm text-[color-mix(in srgb,var(--accent-alert) 70%,white)]">
            Faça login novamente ou selecione uma organização válida para carregar os dados de leads.
          </p>
        </div>
      )}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1
            className="text-[clamp(1.5rem,5vw,2.25rem)] font-bold mb-2 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-teal)] bg-clip-text text-transparent"
          >
            🎯 Leads Intelligence
          </h1>
          <p className="text-[clamp(0.75rem,3vw,1rem)] text-[var(--text-gray)]">Gestão inteligente com IA e previsões em tempo real</p>
        </div>
        <LeadActions
          leads={leads ?? []}
          onImport={() => {
            if (refetch) refetch();
          }}
          onExport={() => {}}
         onNewLead={() => setIsCreateModalOpen(true)}
        />
      </header>

      {!loading && (
        <section className="kpi-grid mb-6 sm:mb-8" aria-label="KPI de Leads">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[var(--neutral-900)] to-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-indigo)] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-white)]" aria-hidden="true" />
              </div>
              <span className="text-[clamp(0.875rem,3vw,1.125rem)] text-[var(--text-gray)]">Qualificados</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--accent-emerald)]">{analytics.qualified}</div>
            <div className="text-xs text-[var(--accent-emerald)] mt-1" aria-label="Taxa de conversão">
              +{analytics.conversionRate.toFixed(1)}% taxa
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[var(--neutral-900)] to-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-red)] flex items-center justify-center text-base sm:text-lg">
                🔥
              </div>
              <span className="text-[clamp(0.875rem,3vw,1.125rem)] text-[var(--text-gray)]">Quentes</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--accent-orange)]">{analytics.hot}</div>
            <div className="text-xs text-[var(--accent-orange)] mt-1">alta conversão</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[var(--neutral-900)] to-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--accent-yellow)] to-[var(--accent-orange)] flex items-center justify-center text-base sm:text-lg">
                ⚠️
              </div>
              <span className="text-[clamp(0.875rem,3vw,1.125rem)] text-[var(--text-gray)]">Em Risco</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--accent-yellow)]">{analytics.atRisk}</div>
            <div className="text-xs text-[var(--accent-yellow)] mt-1">precisam atenção</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[var(--neutral-900)] to-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] flex items-center justify-center text-base sm:text-lg">
                💚
              </div>
              <span className="text-[clamp(0.875rem,3vw,1.125rem)] text-[var(--text-gray)]">Health Score</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--accent-purple)]">{analytics.healthScore}%</div>
            <div className="text-xs text-[var(--accent-purple)] mt-1">saúde geral</div>
          </motion.div>
        </section>
      )}

      <nav className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6" role="navigation" aria-label="Seleção de visualização">
        <div className="theme-selector-container">
          {[
            { mode: 'grid', icon: LayoutGrid, label: 'Grade' },
            { mode: 'list', icon: List, label: 'Lista' },
            { mode: 'kanban', icon: Kanban, label: 'Kanban' },
            { mode: 'network', icon: Network, label: 'Rede' },
          ].map(({ mode, icon: Icon, label }) => (
            <motion.button
              key={mode}
              aria-pressed={viewMode === mode}
              onClick={() => setViewMode(mode as ViewMode)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                theme-selector-button
                ${viewMode === mode
                  ? 'bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-teal)] text-[var(--text-white)]'
                  : 'bg-[var(--neutral-900)] border border-[var(--neutral-800)] text-[var(--text-gray)] hover:text-[var(--text-white)] hover:border-[var(--neutral-700)]'
                }
              `}
              aria-label={`Visualizar em ${label}`}
            >
              <Icon className="theme-selector-icon" aria-hidden="true" />
              <span className="hidden sm:inline text-[clamp(0.875rem,3vw,1.125rem)] font-medium ml-2">{label}</span>
            </motion.button>
          ))}
        </div>
        <motion.button
          aria-pressed={showAIPanel}
          onClick={() => setShowAIPanel(!showAIPanel)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 text-[clamp(0.875rem,3vw,1.125rem)]
            ${showAIPanel
              ? 'bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-[var(--text-white)]'
              : 'bg-[var(--accent-purple-10)] border border-[var(--accent-purple-20)] text-[var(--accent-purple)] hover:bg-[var(--accent-purple-20)]'
            }
          `}
          aria-label={showAIPanel ? 'Ocultar IA Panel' : 'Mostrar IA Panel'}
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">{showAIPanel ? 'Ocultar' : 'Mostrar'} IA Panel</span>
          <span className="sm:hidden">IA</span>
        </motion.button>
      </nav>

      <section className="mb-6 sm:mb-8" aria-label="Filtros Inteligentes">
        <SmartFilters
          onFilterChange={setFilters}
          totalResults={filteredLeads.length}
        />
      </section>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showAIPanel && (
          <aside className="lg:col-span-1 space-y-6" aria-label="Insights Inteligência Artificial">
            <AIInsightsPanel
              insights={selectedLead?.ai_insights || []}
              conversionProb={selectedLead?.ai_conversion_probability || 0}
              healthScore={selectedLead?.ai_health_score || 0}
              riskScore={selectedLead?.ai_risk_score || 0}
              nextAction={selectedLead?.ai_next_best_action}
            />
            {selectedLead ? (
              <>
                <ActivityTimeline activities={activities} maxItems={5} />
                <RelationshipNetwork
                  nodes={networkData.nodes}
                  edges={networkData.edges}
                  centerNodeId={selectedLead.id}
                />
              </>
            ) : (
              <p className="text-[var(--text-gray)] text-[clamp(0.875rem,3vw,1.125rem)]" tabIndex={0}>Selecione um lead para ver atividades e rede.</p>
            )}
          </aside>
        )}
        <section className={showAIPanel ? 'lg:col-span-2' : 'lg:col-span-3'} aria-label="Leads">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--accent-emerald)] mb-4"></div>
              <p className="text-[var(--text-gray)] text-[clamp(0.875rem,3vw,1.125rem)]">Carregando leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-[var(--neutral-900)] border border-[var(--neutral-800)] rounded-2xl">
              <p className="text-xl sm:text-2xl text-[var(--text-gray)] mb-2">Nenhum lead encontrado</p>
              <p className="text-[clamp(0.875rem,3vw,1.125rem)] text-[var(--text-gray-500)]">Tente ajustar os filtros ou criar um novo lead</p>
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
                  role="list"
                >
                  {filteredLeads.map((lead, index) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      delay={index * 0.05}
                      onView={setSelectedLead}
                    />
                  ))} {/* Para listas grandes: use react-window para virtualização */}
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
                      // toast.info('Movendo lead...');
                    }}
                  />
                </motion.div>
              )}
              {viewMode === 'network' && (
                <motion.div
                  key="network"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {selectedLead ? (
                    <RelationshipNetwork
                      nodes={networkData.nodes}
                      edges={networkData.edges}
                      centerNodeId={selectedLead.id}
                    />
                  ) : <p className="text-[var(--text-gray)] text-[clamp(0.875rem,3vw,1.125rem)]">Selecione um lead para ver a rede.</p>}
                </motion.div>
              )}
              {viewMode === 'list' && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[var(--neutral-900)] border border-[var(--neutral-800)] rounded-2xl overflow-hidden overflow-x-auto"
                  tabIndex={0}
                  aria-label="Tabela de leads"
                >
                  <table className="w-full">
                    <thead className="bg-[var(--neutral-950)] border-b border-[var(--neutral-800)]">
                      <tr>
                        <th className="px-4 sm:px-6 py-4 text-left text-[clamp(0.875rem,3vw,1.125rem)] font-semibold text-[var(--text-gray)]">Nome</th>
                        <th className="px-4 sm:px-6 py-4 text-left text-[clamp(0.875rem,3vw,1.125rem)] font-semibold text-[var(--text-gray)]">Email</th>
                        <th className="px-4 sm:px-6 py-4 text-left text-[clamp(0.875rem,3vw,1.125rem)] font-semibold text-[var(--text-gray)] hidden sm:table-cell">Empresa</th>
                        <th className="px-4 sm:px-6 py-4 text-left text-[clamp(0.875rem,3vw,1.125rem)] font-semibold text-[var(--text-gray)]">Status</th>
                        <th className="px-4 sm:px-6 py-4 text-center text-[clamp(0.875rem,3vw,1.125rem)] font-semibold text-[var(--text-gray)]">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--neutral-800)]">
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="hover:bg-[var(--neutral-950)] cursor-pointer transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-4 text-[var(--text-white)] font-medium text-[clamp(0.875rem,3vw,1.125rem)]">{lead.nome ?? '-'}</td>
                          <td className="px-4 sm:px-6 py-4 text-[var(--text-gray)] text-[clamp(0.875rem,3vw,1.125rem)]">{lead.email ?? '-'}</td>
                          <td className="px-4 sm:px-6 py-4 text-[var(--text-gray)] text-[clamp(0.875rem,3vw,1.125rem)] hidden sm:table-cell">{lead.empresa ?? '-'}</td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="px-3 py-1 bg-[var(--accent-emerald-10)] text-[var(--accent-emerald)] rounded-full text-xs font-semibold">
                              {lead.status ?? 'novo'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-center">
                            <span className="text-[var(--accent-emerald)] font-bold text-[clamp(0.875rem,3vw,1.125rem)]">{lead.score_ia ?? 0}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </section>
      </main>

      <section className="mt-6 sm:mt-8" aria-label="Gráfico preditivo de conversões">
        <PredictiveChart
          historicalData={chartData.historical}
          predictions={chartData.predictions}
          labels={chartData.labels}
          title="Previsão de Conversões - Próximos 3 Meses"
          metric="conversões"
        />
      </section>

      {/* Modal de Criação de Lead */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateLead}
        orgId={currentOrgId}
        userId={currentUserId}
      />
    </div>
  );
}
      
