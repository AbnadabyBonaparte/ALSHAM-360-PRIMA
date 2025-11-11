// src/pages/LeadsDetails.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getLead,
  updateLead,
  deleteLead,
  subscribeLeads,
  getLeadInteractions,
  createAuditLog,
  getActiveOrganization
} from "../lib/supabase";
import { 
  Loader2, 
  Edit, 
  Trash, 
  Save, 
  X, 
  TrendingUp, 
  Activity, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Target,
  AlertCircle,
  ArrowLeft,
  Building2,
  Tag
} from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  source?: string;
  location?: string;
  deal_value?: number;
  created_at: string;
  updated_at: string;
  last_contact?: string;
  tags?: string[];
  notes?: string;
}

interface Interaction {
  id: string;
  lead_id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task';
  description: string;
  created_at: string;
  created_by: string;
  metadata?: Record<string, any>;
}

interface LeadsDetailsProps {
  leadId?: string;
  onBack?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 COMPONENTE PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function LeadsDetails({ leadId: propLeadId, onBack }: LeadsDetailsProps) {
  // ✅ HOOKS DE NAVEGAÇÃO
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ PEGA leadId de 3 FONTES (prioridade: props > params > location.state)
  const leadId = propLeadId || params.id || (location.state as any)?.leadId;

  // ✅ STATES
  const [lead, setLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
  const [saving, setSaving] = useState(false);
  const [organizationUnavailable, setOrganizationUnavailable] = useState(false);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📡 FETCH INICIAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    let mounted = true;

    const fetchLead = async () => {
      try {
        console.log('🔍 LeadsDetails - leadId recebido:', leadId);

        // ✅ VALIDAÇÃO ROBUSTA
        if (!leadId || leadId === 'undefined' || leadId === 'null' || leadId.trim() === '') {
          throw new Error('Identificador de lead inválido ou ausente');
        }
        
        // ✅ VALIDAÇÃO DE FORMATO UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(leadId.trim())) {
          throw new Error(`Formato de ID inválido: "${leadId}". Esperado UUID v4.`);
        }

        setLoading(true);
        setError(null);

        // ✅ VERIFICA ORGANIZAÇÃO
        const orgId = await getActiveOrganization();
        if (!orgId) {
          if (mounted) {
            setOrganizationUnavailable(true);
          }
          throw new Error('Organização ativa não encontrada');
        }
        
        if (mounted) {
          setOrganizationUnavailable(false);
        }

        console.log('📊 Buscando lead:', leadId, '| Org:', orgId);

        // ✅ BUSCA DADOS EM PARALELO
        const [leadResult, interactionsResult] = await Promise.all([
          getLead(leadId),
          getLeadInteractions(leadId)
        ]);

        if (leadResult.error) {
          throw new Error(leadResult.error.message || 'Erro ao buscar lead');
        }
        
        if (!leadResult.data) {
          throw new Error('Lead não encontrado no banco de dados');
        }

        if (interactionsResult.error) {
          console.warn('⚠️ Erro ao buscar interações:', interactionsResult.error);
        }

        if (mounted) {
          setLead(leadResult.data);
          setInteractions(interactionsResult.data || []);
          setEditedLead(leadResult.data);
          console.log('✅ Lead carregado com sucesso:', leadResult.data.name);
        }

        // ✅ AUDIT LOG (não bloqueia em caso de erro)
        try {
          await createAuditLog({
            action: 'lead_viewed',
            table_name: 'leads_crm',
            record_id: leadId,
            changes: { viewed_at: new Date().toISOString() }
          });
        } catch (auditErr) {
          console.warn('⚠️ Erro ao criar audit log:', auditErr);
        }

      } catch (err: any) {
        console.error('❌ Erro ao carregar lead:', err);
        if (mounted) {
          setError(err.message || 'Erro desconhecido ao carregar lead');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (leadId) {
      fetchLead();
    } else {
      setError('Nenhum ID de lead fornecido');
      setLoading(false);
    }

    // ✅ REALTIME SUBSCRIPTION
    const unsubscribe = leadId ? subscribeLeads((payload) => {
      if (payload.new?.id === leadId) {
        console.log('📡 Lead atualizado via realtime:', payload.new);
        if (mounted) {
          setLead(payload.new as Lead);
          setEditedLead(payload.new as Lead);
        }
      }
    }) : undefined;

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [leadId]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 KPIs MEMOIZADOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const kpis = useMemo(() => {
    if (!lead) return null;

    const score = lead.score || 0;
    const interactionsCount = interactions.length;
    const conversionProbability = Math.min(Math.round(score * 1.5), 100);
    const daysSinceContact = lead.last_contact 
      ? Math.floor((Date.now() - new Date(lead.last_contact).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      score,
      interactionsCount,
      conversionProbability,
      daysSinceContact,
      dealValue: lead.deal_value || 0,
      status: lead.status
    };
  }, [lead, interactions]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✏️ HANDLERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleSave = useCallback(async () => {
    if (!lead || !leadId) return;

    try {
      setSaving(true);
      console.log('💾 Salvando lead:', editedLead);

      const { error: updateError } = await updateLead(leadId, editedLead);
      if (updateError) throw updateError;

      await createAuditLog({
        action: 'lead_updated',
        table_name: 'leads_crm',
        record_id: leadId,
        changes: editedLead
      });

      setLead({ ...lead, ...editedLead });
      setIsEditing(false);
      console.log('✅ Lead salvo com sucesso!');

    } catch (err: any) {
      console.error('❌ Erro ao salvar:', err);
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [lead, leadId, editedLead]);

  const handleBack = useCallback(() => {
    console.log('🔙 Voltando...');
    
    if (onBack) {
      onBack();
      return;
    }
    
    // ✅ Tenta voltar no histórico
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // ✅ Fallback: redireciona para /leads
      navigate('/leads');
    }
  }, [onBack, navigate]);

  const handleDelete = useCallback(async () => {
    if (!leadId) return;
    if (!confirm(`Tem certeza que deseja excluir o lead "${lead?.name}"?`)) return;

    try {
      console.log('🗑️ Deletando lead:', leadId);
      const { error: deleteError } = await deleteLead(leadId);
      if (deleteError) throw deleteError;

      alert('Lead excluído com sucesso!');
      handleBack();
    } catch (err: any) {
      console.error('❌ Erro ao deletar:', err);
      alert(`Erro ao deletar: ${err.message}`);
    }
  }, [leadId, lead, handleBack]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎨 RENDERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[var(--bg-dark)] gap-4">
        <Loader2 className="animate-spin h-12 w-12 text-[var(--accent-emerald)]" />
        <p className="text-white/60 text-sm">Carregando detalhes do lead...</p>
      </div>
    );
  }

  if (organizationUnavailable) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[var(--bg-dark)] text-white px-6 text-center gap-4">
        <AlertCircle className="h-16 w-16 text-[var(--accent-alert)]" />
        <h1 className="text-2xl font-bold">Organização não encontrada</h1>
        <p className="max-w-md text-sm text-white/70">
          Faça login novamente ou selecione uma organização válida para visualizar os detalhes do lead.
        </p>
        <button 
          onClick={handleBack}
          className="mt-4 px-6 py-3 bg-[var(--accent-emerald)] rounded-lg hover:opacity-80 transition"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[var(--bg-dark)] text-white px-6 text-center gap-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold">Erro ao carregar lead</h1>
        <p className="text-red-400 max-w-md">{error || 'Lead não encontrado'}</p>
        <div className="flex gap-3">
          <button 
            onClick={handleBack}
            className="px-6 py-3 bg-[var(--accent-emerald)] rounded-lg hover:opacity-80 transition"
          >
            Voltar para Leads
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[var(--surface)] rounded-lg hover:opacity-80 transition"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="min-h-screen bg-[var(--bg-dark)] text-white p-4 sm:p-8"
    >
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 🎯 HEADER */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-[var(--surface)] rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{lead.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {lead.company && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Building2 className="h-3 w-3" />
                  {lead.company}
                </span>
              )}
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lead.status)}`}>
                {getStatusLabel(lead.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-emerald)] rounded-lg hover:opacity-80 disabled:opacity-50 transition"
              >
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                Salvar
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedLead(lead);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 rounded-lg hover:opacity-80 transition"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-sky)] rounded-lg hover:opacity-80 transition"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:opacity-80 transition"
              >
                <Trash className="h-4 w-4" />
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 📊 KPIS */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard 
            icon={<Target />} 
            label="Score" 
            value={kpis.score.toString()} 
            color="emerald"
          />
          <KPICard 
            icon={<TrendingUp />} 
            label="Conversão" 
            value={`${kpis.conversionProbability}%`} 
            color="sky"
          />
          <KPICard 
            icon={<Activity />} 
            label="Interações" 
            value={kpis.interactionsCount.toString()} 
            color="fuchsia"
          />
          <KPICard 
            icon={<DollarSign />} 
            label="Valor" 
            value={`R$ ${(kpis.dealValue / 1000).toFixed(1)}K`} 
            color="amber"
          />
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 📝 PERFIL */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl mb-8 border border-[var(--border)]">
        <h2 className="text-xl font-semibold mb-4">Perfil do Lead</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <InfoField
            icon={<Mail />}
            label="Email"
            value={isEditing ? undefined : lead.email}
            isEditing={isEditing}
            onChange={(value) => setEditedLead({ ...editedLead, email: value })}
            editValue={editedLead.email}
          />
          <InfoField
            icon={<Phone />}
            label="Telefone"
            value={isEditing ? undefined : (lead.phone || 'Não informado')}
            isEditing={isEditing}
            onChange={(value) => setEditedLead({ ...editedLead, phone: value })}
            editValue={editedLead.phone}
          />
          <InfoField
            icon={<Briefcase />}
            label="Cargo"
            value={isEditing ? undefined : (lead.position || 'Não informado')}
            isEditing={isEditing}
            onChange={(value) => setEditedLead({ ...editedLead, position: value })}
            editValue={editedLead.position}
          />
          <InfoField
            icon={<MapPin />}
            label="Localização"
            value={isEditing ? undefined : (lead.location || 'Não informada')}
            isEditing={isEditing}
            onChange={(value) => setEditedLead({ ...editedLead, location: value })}
            editValue={editedLead.location}
          />
        </div>

        {lead.notes && (
          <div className="mt-4 p-4 bg-[var(--bg-dark)]/50 rounded-lg">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        {lead.tags && lead.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {lead.tags.map((tag, index) => (
              <span 
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] rounded-full text-xs"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 📅 TIMELINE */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)]">
        <h2 className="text-xl font-semibold mb-4">Timeline de Interações</h2>
        
        <AnimatePresence>
          {interactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nenhuma interação registrada</p>
          ) : (
            <div className="space-y-3">
              {interactions.map((interaction, index) => (
                <motion.div
                  key={interaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 bg-[var(--bg-dark)]/50 rounded-lg hover:bg-[var(--bg-dark)]/70 transition"
                >
                  <div className="p-2 bg-[var(--accent-emerald)]/20 rounded-lg flex-shrink-0">
                    <Calendar className="h-4 w-4 text-[var(--accent-emerald)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-medium capitalize">{interaction.type}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(interaction.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{interaction.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧩 SUB-COMPONENTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function KPICard({ icon, label, value, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: 'emerald' | 'sky' | 'fuchsia' | 'amber';
}) {
  const colorClass = `var(--accent-${color})`;
  
  return (
    <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent-emerald)]/50 transition-all hover:scale-[1.02]">
      <div className="flex items-center gap-2 mb-2" style={{ color: colorClass }}>
        {icon}
        <span className="text-xs uppercase tracking-wider text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function InfoField({ 
  icon, 
  label, 
  value, 
  isEditing, 
  onChange, 
  editValue 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value?: string; 
  isEditing: boolean; 
  onChange?: (value: string) => void; 
  editValue?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-[var(--accent-emerald)]/10 rounded-lg text-[var(--accent-emerald)] flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <label className="text-xs uppercase tracking-wider text-gray-400 block mb-1">
          {label}
        </label>
        {isEditing ? (
          <input
            type="text"
            value={editValue || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-emerald)] focus:ring-2 focus:ring-[var(--accent-emerald)]/20 outline-none transition"
            placeholder={`Digite ${label.toLowerCase()}...`}
          />
        ) : (
          <p className="text-sm break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛠️ HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getStatusColor(status: Lead['status']): string {
  const colors = {
    new: 'bg-blue-500/20 text-blue-400',
    contacted: 'bg-yellow-500/20 text-yellow-400',
    qualified: 'bg-green-500/20 text-green-400',
    proposal: 'bg-purple-500/20 text-purple-400',
    negotiation: 'bg-orange-500/20 text-orange-400',
    won: 'bg-emerald-500/20 text-emerald-400',
    lost: 'bg-red-500/20 text-red-400'
  };
  return colors[status] || colors.new;
}

function getStatusLabel(status: Lead['status']): string {
  const labels = {
    new: 'Novo',
    contacted: 'Contatado',
    qualified: 'Qualificado',
    proposal: 'Proposta',
    negotiation: 'Negociação',
    won: 'Ganho',
    lost: 'Perdido'
  };
  return labels[status] || status;
}
