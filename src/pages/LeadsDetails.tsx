// src/pages/LeadsDetails.tsx
// ALSHAM 360° PRIMA — Lead Detail (migrado para shadcn/ui)

import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Zap,
  Crosshair,
  Star,
  ArrowLeft,
  Pencil,
  Download,
  X,
  AlertTriangle,
  Trophy,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
          className="w-32 h-32 border-8 border-t-transparent border-[var(--accent-purple)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-purple)] font-light">Carregando lead...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-40">
        <AlertTriangle className="w-40 h-40 text-[var(--accent-alert)] mx-auto mb-12" />
        <p className="text-2xl sm:text-3xl text-[var(--text-secondary)]">Lead não encontrado</p>
      </div>
    );
  }

  const isHot = lead.score >= 85;
  const isWarm = lead.score >= 60 && lead.score < 85;
  const isRisk = lead.risk >= 60;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        {/* HEADER SUPREMO */}
        <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent-purple)]/30 via-[var(--background)] to-[var(--accent-pink)]/30 backdrop-blur-2xl">
          <div className="p-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Button
                  onClick={() => window.history.back()}
                  variant="ghost"
                  size="icon"
                  className="h-16 w-16 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-strong)]"
                >
                  <ArrowLeft className="w-10 h-10" />
                </Button>
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="w-40 h-40 bg-gradient-to-br from-[var(--accent-sky)] to-[var(--accent-purple)] rounded-3xl flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-black text-[var(--text-primary)] shadow-2xl">
                      {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    {isHot && (
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-[var(--accent-warning)] to-[var(--accent-alert)] rounded-full flex items-center justify-center animate-pulse">
                        <Flame className="w-16 h-16 text-[var(--text-primary)]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-purple)] bg-clip-text text-transparent">
                      {lead.name}
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] mt-4">
                      {lead.company} • {lead.position || 'Cargo não informado'}
                    </p>
                    <div className="flex items-center gap-6 mt-6">
                      <Badge className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-[var(--text-primary)] border-0 font-semibold text-sm sm:text-base md:text-lg">
                        IA Score: {lead.score}/100
                        {isHot && <Sparkles className="w-12 h-12 inline ml-4 animate-pulse" />}
                      </Badge>
                      <Badge className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-sky)] text-[var(--text-primary)] border-0 font-semibold text-sm sm:text-base md:text-lg">
                        {lead.probability}% conversão
                      </Badge>
                      {isRisk && (
                        <Badge className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-[var(--accent-alert)] to-[var(--accent-warning)] text-[var(--text-primary)] border-0 font-semibold text-sm sm:text-base md:text-lg">
                          RISCO ALTO
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--accent-emerald)]">
                  R$ {lead.revenue_potential.toLocaleString('pt-BR')}
                </p>
                <p className="text-base sm:text-lg text-[var(--text-secondary)]">Potencial de receita</p>
                <Button className="mt-8 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-sky)] hover:opacity-90 text-[var(--text-primary)] rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg">
                  CONVERTER EM CLIENTE
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 p-12">
          {/* COLUNA ESQUERDA — INFORMAÇÕES DO LEAD */}
          <div className="space-y-8">
            <InfoCard icon={<Building2 />} title="Empresa" value={lead.company} />
            <InfoCard icon={<Briefcase />} title="Cargo" value={lead.position} />
            <InfoCard icon={<Mail />} title="E-mail" value={lead.email} />
            <InfoCard icon={<Phone />} title="Telefone" value={lead.phone} />
            <InfoCard icon={<MapPin />} title="Origem" value={lead.origin} />
            <InfoCard icon={<Calendar />} title="Criado em" value={format(new Date(lead.created_at), 'dd/MM/yyyy')} />

            {/* IA INSIGHTS */}
            <Card className="bg-gradient-to-br from-[var(--accent-purple)]/50 to-[var(--accent-pink)]/50 border-[var(--accent-purple)]/30 rounded-3xl backdrop-blur-xl">
              <CardContent className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <Lightbulb className="w-16 h-16 text-[var(--accent-purple)]" />
                  <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Análise da IA</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-base sm:text-lg text-[var(--text-secondary)]">Probabilidade de conversão</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--accent-emerald)]">{lead.probability}%</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg text-[var(--text-secondary)]">Risco de churn</p>
                    <p className={`text-xl md:text-2xl lg:text-3xl font-black ${lead.risk >= 60 ? 'text-[var(--accent-alert)]' : 'text-[var(--accent-emerald)]'}`}>{lead.risk}%</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg text-[var(--text-secondary)]">Health Score</p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--accent-sky)]">{lead.health}/100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUNA DO MEIO — ATIVIDADES */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">Atividades Recentes</h2>
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
    <Card className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-strong)] border-[var(--border)] rounded-3xl hover:scale-105 transition-all">
      <CardContent className="p-8">
        <div className="flex items-center gap-6">
          <div className="p-6 bg-[var(--surface-strong)] rounded-2xl">
            <Icon className="w-12 h-12 text-[var(--accent-sky)]" />
          </div>
          <div>
            <p className="text-base sm:text-lg text-[var(--text-secondary)]">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{value || '—'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ type, title, description, time, user }: any) {
  return (
    <Card className="bg-gradient-to-r from-[var(--surface)]/70 to-[var(--background)]/70 border-[var(--border)] hover:border-[var(--accent-sky)]/50 rounded-3xl transition-all">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-sky)] to-[var(--accent-purple)] rounded-2xl flex items-center justify-center text-4xl">
              {type === 'email' ? '✉️' : type === 'call' ? '📞' : '🗓️'}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{title}</h3>
              <p className="text-base sm:text-lg text-[var(--text-secondary)]">{description}</p>
              <p className="text-[var(--text-secondary)]/70 mt-2">por {user} • {time}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
