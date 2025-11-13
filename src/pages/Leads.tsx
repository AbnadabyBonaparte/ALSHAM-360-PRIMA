import { useMemo } from "react";
import { getLeads, type Lead } from "../lib/leads";

interface LeadsProps {
  onNavigateToDetails: (leadId: string) => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

interface LeadsProps {
  onNavigateToDetails: (leadId: string) => void;
}

export default function Leads({ onNavigateToDetails }: LeadsProps) {
  const { leads, loading, error, refetch } = useLeadsAI();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [organizationUnavailable, setOrganizationUnavailable] = useState(false);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    onNavigateToDetails(lead.id);
  };

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
        // FIX: Evita tentativa de criação sem escopo de organização válido
        console.error('Organização ativa não encontrada. Abortando criação de lead.');
        return;
      }
      await createLead(orgId, newLeadData);
      await refetch?.();
      // toast.success('Lead criado com sucesso!'); // Se usar biblioteca de toast
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 230); // Ajuda feedback
    } catch (err: any) {
      // toast.error('Erro ao criar lead: ' + err.message); // Se usar biblioteca de toast
      console.error(err);
    }
  };

  return map[status];
}

export default function Leads({ onNavigateToDetails }: LeadsProps) {
  const leads = useMemo(() => getLeads(), []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3">
        <div>
          <p className="uppercase text-xs tracking-widest text-emerald-400/70">
            CRM • Inteligência Comercial
          </p>
          <h1 className="text-3xl font-bold text-white">Leads estratégicos</h1>
        </div>
        <p className="text-sm text-gray-400 max-w-3xl">
          Acompanhe a temperatura de cada oportunidade, próximas ações e o potencial de receita
          diretamente do núcleo ALSHAM 360°. Clique em um lead para abrir o painel mestre-detalhe e
          sincronizar com Supabase em tempo real.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {leads.map((lead) => (
          <article
            key={lead.id}
            className="group rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur transition hover:border-emerald-400/60 hover:bg-emerald-400/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{lead.nome}</h2>
                <p className="text-sm text-gray-400">{lead.empresa}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(lead.status)}`}>
                {lead.status.replace("-", " ")}
              </span>
            </div>

            <dl className="mt-6 space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <dt>Valor potencial</dt>
                <dd className="font-semibold text-emerald-300">{formatCurrency(lead.valorPotencial)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Score</dt>
                <dd>{lead.score}%</dd>
              </div>
              <div className="flex justify-between">
                <dt>Origem</dt>
                <dd className="text-right text-gray-400">{lead.origem}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => onNavigateToDetails(lead.id)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
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
                      onView={handleLeadClick}
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
                          onClick={() => handleLeadClick(lead)}
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
    </div>
  );
}
