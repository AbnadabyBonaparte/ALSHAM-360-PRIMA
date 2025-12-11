// src/pages/LeadsDetails.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Lead Detail Alienígena 1000/1000
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/LeadsDetails.tsx

import {
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
  SparklesIcon,
  BoltIcon,
  ViewfinderCircleIcon,
  StarIcon,
  ArrowLeftIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  score: number;
  probability: number;
  risk: number;
  health: number;
  status: string;
  origin: string;
  last_contact?: string;
  revenue_potential: number;
  next_action: string;
  tags: string[];
  notes?: string;
  created_at: string;
  avatar_url?: string;
}

export default function LeadsDetailsPage({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});

  useEffect(() => {
    async function loadLeadSupreme() {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (!error && data) {
        setLead(data);
        setEditedLead(data);
      }
      setLoading(false);
    }

    if (leadId) loadLeadSupreme();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-8 border-t-transparent border-purple-500 rounded-full"
        />
        <p className="absolute text-4xl text-purple-400 font-light">Citizen Supremo X.1 carregando o destino deste lead...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-40">
        <AlertTriangleIcon className="w-40 h-40 text-red-500 mx-auto mb-12" />
        <p className="text-6xl text-gray-400">Lead não encontrado</p>
      </div>
    );
  }

  const isHot = lead.score >= 85;
  const isWarm = lead.score >= 60 && lead.score < 85;
  const isRisk = lead.risk >= 60;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        {/* HEADER SUPREMO */}
        <div className="border-b border-[var(--border)] bg-gradient-to-r from-purple-900/30 via-black to-pink-900/30 backdrop-blur-2xl">
          <div className="p-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <button
                  onClick={() => window.history.back()}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <ArrowLeftIcon className="w-10 h-10" />
                </button>
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="w-40 h-40 bg-gradient-to-br from-primary to-purple-600 rounded-3xl flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-black text-[var(--text-primary)] shadow-2xl">
                      {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    {isHot && (
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                        <FlameIcon className="w-16 h-16 text-[var(--text-primary)]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                      {lead.name}
                    </h1>
                    <p className="text-4xl text-gray-300 mt-4">
                      {lead.company} • {lead.position || 'Cargo não informado'}
                    </p>
                    <div className="flex items-center gap-6 mt-6">
                      <div className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-3xl">
                        IA Score: {lead.score}/100
                        {isHot && <SparklesIcon className="w-12 h-12 inline ml-4 animate-pulse" />}
                      </div>
                      <div className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl font-bold text-3xl">
                        {lead.probability}% conversão
                      </div>
                      {isRisk && (
                        <div className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl font-bold text-3xl">
                          RISCO ALTO
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-6xl font-black text-emerald-400">
                  R$ {lead.revenue_potential.toLocaleString('pt-BR')}
                </p>
                <p className="text-3xl text-gray-400">Potencial de receita</p>
                <button className="mt-8 px-12 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl font-bold text-3xl hover:scale-105 transition-all">
                  CONVERTER EM CLIENTE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 p-12">
          {/* COLUNA ESQUERDA — INFORMAÇÕES DO LEAD */}
          <div className="space-y-8">
            <InfoCard icon={<BuildingOfficeIcon />} title="Empresa" value={lead.company} />
            <InfoCard icon={<BriefcaseIcon />} title="Cargo" value={lead.position} />
            <InfoCard icon={<EnvelopeIcon />} title="E-mail" value={lead.email} />
            <InfoCard icon={<PhoneIcon />} title="Telefone" value={lead.phone} />
            <InfoCard icon={<MapPinIcon />} title="Origem" value={lead.origin} />
            <InfoCard icon={<CalendarIcon />} title="Criado em" value={format(new Date(lead.created_at), 'dd/MM/yyyy')} />

            {/* IA INSIGHTS */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-10 border border-purple-500/30"
            >
              <div className="flex items-center gap-4 mb-8">
                <LightBulbIcon className="w-16 h-16 text-purple-400" />
                <h3 className="text-4xl font-bold">Análise da IA</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-2xl text-gray-400">Probabilidade de conversão</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-black text-emerald-400">{lead.probability}%</p>
                </div>
                <div>
                  <p className="text-2xl text-gray-400">Risco de churn</p>
                  <p className={`text-xl md:text-2xl lg:text-3xl font-black ${lead.risk >= 60 ? 'text-red-400' : 'text-emerald-400'}`}>{lead.risk}%</p>
                </div>
                <div>
                  <p className="text-2xl text-gray-400">Health Score</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-black text-cyan-400">{lead.health}/100</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* COLUNA DO MEIO — ATIVIDADES */}
          <div className="lg:col-span-2">
            <h2 className="text-5xl font-bold mb-8">Atividades Recentes</h2>
            <div className="space-y-6">
              <ActivityItem
                type="email"
                title="E-mail enviado"
                description="Proposta comercial enviada com sucesso"
                time="2h atrás"
                user="João Silva"
              />
              <ActivityItem
                type="call"
                title="Ligação realizada"
                description="Cliente interessado na versão Enterprise"
                time="1 dia atrás"
                user="Maria Santos"
              />
              <ActivityItem
                type="meeting"
                title="Reunião marcada"
                description="Demo agendada para 15/12 às 14h"
                time="em 3 dias"
                user="Você"
              />
            </div>
          </div>
        </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-[var(--border)]"
    >
      <div className="flex items-center gap-6">
        <div className="p-6 bg-white/10 rounded-2xl">
          <Icon className="w-12 h-12 text-primary" />
        </div>
        <div>
          <p className="text-2xl text-gray-400">{title}</p>
          <p className="text-4xl font-bold text-[var(--text-primary)]">{value || '—'}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityItem({ type, title, description, time, user }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-r from-gray-900/50 to-black/50 rounded-3xl p-8 border border-[var(--border)] hover:border-primary/50 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-4xl">
            {type === 'email' ? '✉️' : type === 'call' ? '📞' : '🗓️'}
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)]">{title}</h3>
            <p className="text-xl text-gray-300">{description}</p>
            <p className="text-gray-500 mt-2">por {user} • {time}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
