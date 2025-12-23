// src/pages/CallCenter.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Call Center Alienígena 1000/1000
// Cada ligação é uma conexão humana. A voz que fecha negócios.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import {
  PhoneIcon,
  PhoneArrowDownLeftIcon,
  PhoneArrowUpRightIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  SignalIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Call {
  id: string;
  tipo: 'entrada' | 'saida';
  numero: string;
  contato: string;
  atendente: string;
  status: 'em_andamento' | 'encerrada' | 'perdida' | 'voicemail';
  duracao: number;
  inicio: string;
  gravacao: boolean;
}

interface CallMetrics {
  atendentesAtivos: number;
  ligacoesHoje: number;
  emAndamento: number;
  taxaAtendimento: number;
  tempoMedioLigacao: number;
  calls: Call[];
}

export default function CallCenterPage() {
  const [metrics, setMetrics] = useState<CallMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeCallCenter() {
      try {
        const { data: calls } = await supabase
          .from('call_center')
          .select('*')
          .order('inicio', { ascending: false })
          .limit(50);

        if (calls) {
          const emAndamento = calls.filter((c: any) => c.status === 'em_andamento');
          const encerradas = calls.filter((c: any) => c.status === 'encerrada');
          const perdidas = calls.filter((c: any) => c.status === 'perdida');
          const tempoMedio = encerradas.length > 0
            ? encerradas.reduce((s: number, c: any) => s + (c.duracao || 0), 0) / encerradas.length
            : 0;

          setMetrics({
            atendentesAtivos: 5,
            ligacoesHoje: calls.length,
            emAndamento: emAndamento.length,
            taxaAtendimento: calls.length > 0
              ? ((calls.length - perdidas.length) / calls.length) * 100
              : 100,
            tempoMedioLigacao: tempoMedio,
            calls: calls.map((c: any) => ({
              id: c.id,
              tipo: c.tipo || 'entrada',
              numero: c.numero || '',
              contato: c.contato || 'Desconhecido',
              atendente: c.atendente || '',
              status: c.status || 'encerrada',
              duracao: c.duracao || 0,
              inicio: c.inicio || '',
              gravacao: c.gravacao || false
            }))
          });
        } else {
          setMetrics({
            atendentesAtivos: 0,
            ligacoesHoje: 0,
            emAndamento: 0,
            taxaAtendimento: 0,
            tempoMedioLigacao: 0,
            calls: []
          });
        }
      } catch (err) {
        console.error('Erro no Call Center Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeCallCenter();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-sky)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-sky)] font-light">Conectando linhas...</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-purple)] to-[var(--accent-1)] bg-clip-text text-transparent">
          CALL CENTER SUPREMO
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          A voz que fecha negócios e encanta clientes
        </p>
      </motion.div>

      {/* STATUS AO VIVO */}
      {metrics && metrics.emAndamento > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--accent-sky)]/50 shadow-2xl shadow-[var(--accent-sky)]/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <SignalIcon className="w-8 h-8 text-[var(--accent-sky)] animate-pulse" />
                <span className="text-2xl font-bold text-[var(--accent-sky)]">LIGAÇÕES AO VIVO</span>
              </div>
              <p className="text-center text-6xl font-black text-[var(--text-primary)]">{metrics.emAndamento}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12 max-w-7xl mx-auto">
        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <UserGroupIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.atendentesAtivos || 0}</p>
            <p className="text-[var(--text-secondary)]">Atendentes</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <PhoneIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.ligacoesHoje || 0}</p>
            <p className="text-[var(--text-secondary)]">Ligações Hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <PhoneIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3 animate-pulse" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.emAndamento || 0}</p>
            <p className="text-[var(--text-secondary)]">Em Andamento</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <ClockIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{formatDuration(metrics?.tempoMedioLigacao || 0)}</p>
            <p className="text-[var(--text-secondary)]">Tempo Médio</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <PhoneArrowDownLeftIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.taxaAtendimento || 0).toFixed(0)}%</p>
            <p className="text-[var(--text-secondary)]">Atendimento</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE LIGAÇÕES */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          Histórico de Ligações
        </h2>

        {metrics?.calls.length === 0 ? (
          <div className="text-center py-20">
            <PhoneIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhuma ligação registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics?.calls.map((call, i) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-[var(--surface)]/60 backdrop-blur-xl rounded-xl p-5 border transition-all ${
                  call.status === 'em_andamento'
                    ? 'border-[var(--accent-emerald)]/50 shadow-lg shadow-[var(--accent-emerald)]/10'
                    : 'border-[var(--border)] hover:border-[var(--accent-sky)]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      call.tipo === 'entrada' ? 'bg-[var(--accent-emerald)]/20' : 'bg-[var(--accent-sky)]/20'
                    }`}>
                      {call.tipo === 'entrada'
                        ? <PhoneArrowDownLeftIcon className="w-6 h-6 text-[var(--accent-emerald)]" />
                        : <PhoneArrowUpRightIcon className="w-6 h-6 text-[var(--accent-sky)]" />
                      }
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">{call.contato}</h3>
                      <p className="text-[var(--text-secondary)] text-sm">{call.numero}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-[var(--text-secondary)]">{call.atendente}</div>
                    <div className="text-right">
                      <p className="text-[var(--text-primary)] font-medium">{formatDuration(call.duracao)}</p>
                      <p className="text-[var(--text-secondary)] text-sm">
                        {call.inicio ? format(new Date(call.inicio), "HH:mm") : '-'}
                      </p>
                    </div>
                    {call.gravacao && (
                      <MicrophoneIcon className="w-5 h-5 text-[var(--accent-purple)]" title="Gravado" />
                    )}
                    <Badge className={`capitalize ${
                      call.status === 'em_andamento' ? 'bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]' :
                      call.status === 'encerrada' ? 'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)]' :
                      call.status === 'perdida' ? 'bg-[var(--accent-alert)]/20 text-[var(--accent-alert)]' :
                      'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]'
                    }`}>
                      {call.status.replace('_', ' ')}
                    </Badge>
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
        className="text-center py-24 mt-16"
      >
        <SparklesIcon className="w-32 h-32 text-[var(--accent-sky)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-sky)] max-w-4xl mx-auto">
          "A voz humana ainda é a arma mais poderosa de vendas. Use-a com sabedoria."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Supervisor de Call Center
        </p>
      </motion.div>
    </div>
  );
}
