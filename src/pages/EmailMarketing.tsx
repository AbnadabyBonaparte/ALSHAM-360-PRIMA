// src/pages/EmailMarketing.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Email Marketing Alienígena 1000/1000
// Cada email é uma carta de amor que converte. A caixa de entrada é nossa.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EmailCampaign {
  id: string;
  assunto: string;
  enviados: number;
  abertos: number;
  cliques: number;
  bounces: number;
  unsubscribes: number;
  status: 'enviado' | 'agendado' | 'rascunho';
  data_envio: string;
}

interface EmailMetrics {
  totalEnviados: number;
  taxaAbertura: number;
  taxaCliques: number;
  totalListas: number;
  totalContatos: number;
  campanhas: EmailCampaign[];
}

export default function EmailMarketingPage() {
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeEmails() {
      try {
        const { data: campaigns } = await supabase
          .from('email_campaigns')
          .select('*')
          .order('id', { ascending: false });

        const { data: listas } = await supabase
          .from('email_listas')
          .select('id, total_contatos');

        if (campaigns) {
          const totalEnviados = campaigns.reduce((s, c) => s + (c.enviados || 0), 0);
          const totalAbertos = campaigns.reduce((s, c) => s + (c.abertos || 0), 0);
          const totalCliques = campaigns.reduce((s, c) => s + (c.cliques || 0), 0);
          const totalContatos = listas?.reduce((s, l) => s + (l.total_contatos || 0), 0) || 0;

          setMetrics({
            totalEnviados,
            taxaAbertura: totalEnviados > 0 ? (totalAbertos / totalEnviados) * 100 : 0,
            taxaCliques: totalAbertos > 0 ? (totalCliques / totalAbertos) * 100 : 0,
            totalListas: listas?.length || 0,
            totalContatos,
            campanhas: campaigns.map(c => ({
              id: c.id,
              assunto: c.assunto || 'Sem assunto',
              enviados: c.enviados || 0,
              abertos: c.abertos || 0,
              cliques: c.cliques || 0,
              bounces: c.bounces || 0,
              unsubscribes: c.unsubscribes || 0,
              status: c.status || 'rascunho',
              data_envio: c.data_envio || ''
            }))
          });
        } else {
          setMetrics({
            totalEnviados: 0,
            taxaAbertura: 0,
            taxaCliques: 0,
            totalListas: 0,
            totalContatos: 0,
            campanhas: []
          });
        }
      } catch (err) {
        console.error('Erro no Email Marketing Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeEmails();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-sky)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-sky)] font-light">Preparando disparos...</p>
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
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-1)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
            EMAIL MARKETING SUPREMO
          </h1>
          <p className="text-3xl text-[var(--text-secondary)] mt-6">
            Cada email é uma carta de amor que converte
          </p>
        </motion.div>

        {/* KPIs PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16 max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]"
          >
            <PaperAirplaneIcon className="w-16 h-16 text-[var(--accent-sky)] mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.totalEnviados || 0).toLocaleString()}</p>
            <p className="text-xl text-[var(--text-secondary)]">Emails Enviados</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]"
          >
            <EnvelopeOpenIcon className="w-16 h-16 text-[var(--accent-emerald)] mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.taxaAbertura || 0).toFixed(1)}%</p>
            <p className="text-xl text-[var(--text-secondary)]">Taxa de Abertura</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]"
          >
            <CursorArrowRaysIcon className="w-16 h-16 text-[var(--accent-purple)] mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.taxaCliques || 0).toFixed(1)}%</p>
            <p className="text-xl text-[var(--text-secondary)]">Taxa de Cliques</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]"
          >
            <ChartBarIcon className="w-16 h-16 text-[var(--accent-1)] mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{metrics?.totalListas || 0}</p>
            <p className="text-xl text-[var(--text-secondary)]">Listas Ativas</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]"
          >
            <UserGroupIcon className="w-16 h-16 text-[var(--accent-sky)] mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.totalContatos || 0).toLocaleString()}</p>
            <p className="text-xl text-[var(--text-secondary)]">Total Contatos</p>
          </motion.div>
        </div>

        {/* LISTA DE CAMPANHAS */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-1)] bg-clip-text text-transparent">
            Campanhas de Email
          </h2>

          {metrics?.campanhas.length === 0 ? (
            <div className="text-center py-20">
              <EnvelopeIcon className="w-32 h-32 text-[var(--text)]/30 mx-auto mb-8" />
              <p className="text-3xl text-[var(--text)]/50">Nenhuma campanha de email</p>
              <p className="text-xl text-[var(--text)]/40 mt-4">Crie sua primeira campanha de email</p>
            </div>
          ) : (
            <div className="space-y-6">
              {metrics?.campanhas.map((camp, i) => (
                <motion.div
                  key={camp.id}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-8 border border-[var(--border)] hover:border-[var(--accent-sky)]/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${
                        camp.status === 'enviado' ? 'bg-[var(--accent-emerald)]/20' :
                        camp.status === 'agendado' ? 'bg-[var(--accent-warning)]/20' : 'bg-[var(--text)]/10'
                      }`}>
                        <EnvelopeIcon className={`w-10 h-10 ${
                          camp.status === 'enviado' ? 'text-[var(--accent-emerald)]' :
                          camp.status === 'agendado' ? 'text-[var(--accent-warning)]' : 'text-[var(--text-secondary)]'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">{camp.assunto}</h3>
                        <p className="text-[var(--text-secondary)]">{camp.data_envio || 'Não agendado'} • {camp.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10 text-right">
                      <div>
                        <p className="text-2xl font-bold text-[var(--accent-sky)]">{camp.enviados.toLocaleString()}</p>
                        <p className="text-[var(--text)]/50">Enviados</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[var(--accent-emerald)]">
                          {camp.enviados > 0 ? ((camp.abertos / camp.enviados) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-[var(--text)]/50">Abertura</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[var(--accent-purple)]">
                          {camp.abertos > 0 ? ((camp.cliques / camp.abertos) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-[var(--text)]/50">CTR</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[var(--accent-alert)]">{camp.bounces}</p>
                        <p className="text-[var(--text)]/50">Bounces</p>
                      </div>
                    </div>
                  </div>
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
          className="text-center py-24 mt-20"
        >
          <SparklesIcon className="w-32 h-32 text-[var(--accent-sky)] mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-[var(--accent-sky)] max-w-4xl mx-auto">
            "A caixa de entrada é sagrada. Cada email aberto é uma porta aberta."
          </p>
          <p className="text-3xl text-[var(--text-secondary)] mt-8">
            — Citizen Supremo X.1, seu Mestre do Email
          </p>
        </motion.div>
      </div>
  );
}
