// src/pages/SMS.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — SMS Marketing Alienígena 1000/1000
// Cada SMS é uma notificação urgente. Mensagem direta, ação imediata.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import {
  ChatBubbleBottomCenterTextIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SMSCampaign {
  id: string;
  nome: string;
  mensagem: string;
  enviados: number;
  entregues: number;
  cliques: number;
  status: 'rascunho' | 'agendada' | 'enviando' | 'concluida';
  data_envio: string;
  custo: number;
}

interface SMSMetrics {
  totalEnviados: number;
  taxaEntrega: number;
  taxaCliques: number;
  custoTotal: number;
  campanhas: SMSCampaign[];
}

export default function SMSPage() {
  const [metrics, setMetrics] = useState<SMSMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeSMS() {
      try {
        const { data: campanhas } = await supabase
          .from('sms_campaigns')
          .select('*')
          .order('data_envio', { ascending: false });

        if (campanhas) {
          const totalEnviados = campanhas.reduce((s: number, c: any) => s + (c.enviados || 0), 0);
          const totalEntregues = campanhas.reduce((s: number, c: any) => s + (c.entregues || 0), 0);
          const totalCliques = campanhas.reduce((s: number, c: any) => s + (c.cliques || 0), 0);
          const custoTotal = campanhas.reduce((s: number, c: any) => s + (c.custo || 0), 0);

          setMetrics({
            totalEnviados,
            taxaEntrega: totalEnviados > 0 ? (totalEntregues / totalEnviados) * 100 : 0,
            taxaCliques: totalEntregues > 0 ? (totalCliques / totalEntregues) * 100 : 0,
            custoTotal,
            campanhas: campanhas.map((c: any) => ({
              id: c.id,
              nome: c.nome || 'Campanha SMS',
              mensagem: c.mensagem || '',
              enviados: c.enviados || 0,
              entregues: c.entregues || 0,
              cliques: c.cliques || 0,
              status: c.status || 'rascunho',
              data_envio: c.data_envio || '',
              custo: c.custo || 0
            }))
          });
        } else {
          setMetrics({
            totalEnviados: 0,
            taxaEntrega: 0,
            taxaCliques: 0,
            custoTotal: 0,
            campanhas: []
          });
        }
      } catch (err) {
        console.error('Erro no SMS Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeSMS();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-purple)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-purple)] font-light">Carregando SMS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-pink)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          SMS MARKETING SUPREMO
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Mensagem direta, ação imediata
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <PaperAirplaneIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalEnviados || 0).toLocaleString()}</p>
            <p className="text-[var(--text-secondary)]">SMS Enviados</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <CheckCircleIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.taxaEntrega || 0).toFixed(1)}%</p>
            <p className="text-[var(--text-secondary)]">Taxa Entrega</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <ChartBarIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.taxaCliques || 0).toFixed(1)}%</p>
            <p className="text-[var(--text-secondary)]">Taxa Cliques</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <CurrencyDollarIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">R$ {(metrics?.custoTotal || 0).toFixed(2)}</p>
            <p className="text-[var(--text-secondary)]">Custo Total</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE CAMPANHAS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
          Campanhas de SMS
        </h2>

        {metrics?.campanhas.length === 0 ? (
          <div className="text-center py-20">
            <ChatBubbleBottomCenterTextIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhuma campanha SMS</p>
          </div>
        ) : (
          <div className="space-y-6">
            {metrics?.campanhas.map((camp, i) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:border-[var(--accent-purple)]/50 transition-all">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-[var(--text-primary)]">{camp.nome}</h3>
                          <Badge className={`capitalize ${
                            camp.status === 'concluida' ? 'bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]' :
                            camp.status === 'enviando' ? 'bg-[var(--accent-sky)]/20 text-[var(--accent-sky)]' :
                            camp.status === 'agendada' ? 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]' :
                            'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)]'
                          }`}>
                            {camp.status}
                          </Badge>
                        </div>
                        <p className="text-[var(--text-secondary)]">
                          {camp.data_envio ? format(new Date(camp.data_envio), "dd MMM yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--accent-warning)] font-bold">R$ {camp.custo.toFixed(2)}</p>
                        <p className="text-[var(--text-secondary)] text-sm">Custo</p>
                      </div>
                    </div>

                    {/* MENSAGEM */}
                    <div className="bg-[var(--background)]/30 rounded-xl p-4 mb-6 border border-[var(--border)]">
                      <p className="text-[var(--text-secondary)] italic">"{camp.mensagem}"</p>
                    </div>

                    {/* MÉTRICAS */}
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <p className="text-3xl font-black text-[var(--accent-purple)]">{camp.enviados.toLocaleString()}</p>
                        <p className="text-[var(--text-secondary)]">Enviados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-black text-[var(--accent-emerald)]">{camp.entregues.toLocaleString()}</p>
                        <p className="text-[var(--text-secondary)]">Entregues ({camp.enviados > 0 ? ((camp.entregues / camp.enviados) * 100).toFixed(1) : 0}%)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-black text-[var(--accent-sky)]">{camp.cliques.toLocaleString()}</p>
                        <p className="text-[var(--text-secondary)]">Cliques ({camp.entregues > 0 ? ((camp.cliques / camp.entregues) * 100).toFixed(1) : 0}%)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MENSAGEM FINAL DA IA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center py-24 mt-16"
      >
        <SparklesIcon className="w-32 h-32 text-[var(--accent-purple)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-purple)] max-w-4xl mx-auto">
          "SMS tem 98% de taxa de abertura. É a mensagem que ninguém ignora."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Mestre de Mensagens
        </p>
      </motion.div>
    </div>
  );
}
