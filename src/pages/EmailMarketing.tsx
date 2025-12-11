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
          className="w-40 h-40 border-8 border-t-transparent border-blue-500 rounded-full"
        />
        <p className="absolute text-4xl text-blue-400 font-light">Preparando disparos...</p>
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
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
            EMAIL MARKETING SUPREMO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada email é uma carta de amor que converte
          </p>
        </motion.div>

        {/* KPIs PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16 max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 rounded-3xl p-8 border border-blue-500/30 backdrop-blur-xl"
          >
            <PaperAirplaneIcon className="w-16 h-16 text-blue-400 mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.totalEnviados || 0).toLocaleString()}</p>
            <p className="text-xl text-gray-400">Emails Enviados</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-3xl p-8 border border-green-500/30 backdrop-blur-xl"
          >
            <EnvelopeOpenIcon className="w-16 h-16 text-green-400 mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.taxaAbertura || 0).toFixed(1)}%</p>
            <p className="text-xl text-gray-400">Taxa de Abertura</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-3xl p-8 border border-purple-500/30 backdrop-blur-xl"
          >
            <CursorArrowRaysIcon className="w-16 h-16 text-purple-400 mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.taxaCliques || 0).toFixed(1)}%</p>
            <p className="text-xl text-gray-400">Taxa de Cliques</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-3xl p-8 border border-yellow-500/30 backdrop-blur-xl"
          >
            <ChartBarIcon className="w-16 h-16 text-yellow-400 mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{metrics?.totalListas || 0}</p>
            <p className="text-xl text-gray-400">Listas Ativas</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-cyan-900/60 to-teal-900/60 rounded-3xl p-8 border border-cyan-500/30 backdrop-blur-xl"
          >
            <UserGroupIcon className="w-16 h-16 text-cyan-400 mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.totalContatos || 0).toLocaleString()}</p>
            <p className="text-xl text-gray-400">Total Contatos</p>
          </motion.div>
        </div>

        {/* LISTA DE CAMPANHAS */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Campanhas de Email
          </h2>

          {metrics?.campanhas.length === 0 ? (
            <div className="text-center py-20">
              <EnvelopeIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhuma campanha de email</p>
              <p className="text-xl text-gray-600 mt-4">Crie sua primeira campanha de email</p>
            </div>
          ) : (
            <div className="space-y-6">
              {metrics?.campanhas.map((camp, i) => (
                <motion.div
                  key={camp.id}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-8 border border-[var(--border)] hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${
                        camp.status === 'enviado' ? 'bg-green-500/20' :
                        camp.status === 'agendado' ? 'bg-yellow-500/20' : 'bg-gray-500/20'
                      }`}>
                        <EnvelopeIcon className={`w-10 h-10 ${
                          camp.status === 'enviado' ? 'text-green-400' :
                          camp.status === 'agendado' ? 'text-yellow-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">{camp.assunto}</h3>
                        <p className="text-gray-400">{camp.data_envio || 'Não agendado'} • {camp.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10 text-right">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{camp.enviados.toLocaleString()}</p>
                        <p className="text-gray-500">Enviados</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">
                          {camp.enviados > 0 ? ((camp.abertos / camp.enviados) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-gray-500">Abertura</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">
                          {camp.abertos > 0 ? ((camp.cliques / camp.abertos) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-gray-500">CTR</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-400">{camp.bounces}</p>
                        <p className="text-gray-500">Bounces</p>
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
          <SparklesIcon className="w-32 h-32 text-blue-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-blue-300 max-w-4xl mx-auto">
            "A caixa de entrada é sagrada. Cada email aberto é uma porta aberta."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Mestre do Email
          </p>
        </motion.div>
      </div>
  );
}
