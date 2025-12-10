// src/pages/CallCenter.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Call Center Alienígena 1000/1000
// Cada ligação é uma conexão humana. A voz que fecha negócios.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
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
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
          const emAndamento = calls.filter(c => c.status === 'em_andamento');
          const encerradas = calls.filter(c => c.status === 'encerrada');
          const perdidas = calls.filter(c => c.status === 'perdida');
          const tempoMedio = encerradas.length > 0
            ? encerradas.reduce((s, c) => s + (c.duracao || 0), 0) / encerradas.length
            : 0;

          setMetrics({
            atendentesAtivos: 5,
            ligacoesHoje: calls.length,
            emAndamento: emAndamento.length,
            taxaAtendimento: calls.length > 0
              ? ((calls.length - perdidas.length) / calls.length) * 100
              : 100,
            tempoMedioLigacao: tempoMedio,
            calls: calls.map(c => ({
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
      <LayoutSupremo title="Call Center Supremo">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-blue-500 rounded-full"
          />
          <p className="absolute text-4xl text-blue-400 font-light">Conectando linhas...</p>
        </div>
      </LayoutSupremo>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <LayoutSupremo title="Call Center Supremo">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
            CALL CENTER SUPREMO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
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
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-3xl p-8 border border-blue-500/50 shadow-2xl shadow-blue-500/20">
              <div className="flex items-center justify-center gap-4 mb-4">
                <SignalIcon className="w-8 h-8 text-blue-400 animate-pulse" />
                <span className="text-2xl font-bold text-blue-400">LIGAÇÕES AO VIVO</span>
              </div>
              <p className="text-center text-6xl font-black text-white">{metrics.emAndamento}</p>
            </div>
          </motion.div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12 max-w-7xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 rounded-2xl p-6 border border-blue-500/30">
            <UserGroupIcon className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.atendentesAtivos || 0}</p>
            <p className="text-gray-400">Atendentes</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <PhoneIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.ligacoesHoje || 0}</p>
            <p className="text-gray-400">Ligações Hoje</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <PhoneIcon className="w-12 h-12 text-green-400 mb-3 animate-pulse" />
            <p className="text-4xl font-black text-white">{metrics?.emAndamento || 0}</p>
            <p className="text-gray-400">Em Andamento</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <ClockIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-4xl font-black text-white">{formatDuration(metrics?.tempoMedioLigacao || 0)}</p>
            <p className="text-gray-400">Tempo Médio</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-emerald-900/60 to-teal-900/60 rounded-2xl p-6 border border-emerald-500/30">
            <PhoneArrowDownLeftIcon className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="text-4xl font-black text-white">{(metrics?.taxaAtendimento || 0).toFixed(0)}%</p>
            <p className="text-gray-400">Atendimento</p>
          </motion.div>
        </div>

        {/* LISTA DE LIGAÇÕES */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Histórico de Ligações
          </h2>

          {metrics?.calls.length === 0 ? (
            <div className="text-center py-20">
              <PhoneIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhuma ligação registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics?.calls.map((call, i) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-xl p-5 border transition-all ${
                    call.status === 'em_andamento'
                      ? 'border-green-500/50 shadow-lg shadow-green-500/10'
                      : 'border-white/10 hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        call.tipo === 'entrada' ? 'bg-green-500/20' : 'bg-blue-500/20'
                      }`}>
                        {call.tipo === 'entrada'
                          ? <PhoneArrowDownLeftIcon className="w-6 h-6 text-green-400" />
                          : <PhoneArrowUpRightIcon className="w-6 h-6 text-blue-400" />
                        }
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{call.contato}</h3>
                        <p className="text-gray-400 text-sm">{call.numero}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-gray-400">{call.atendente}</div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatDuration(call.duracao)}</p>
                        <p className="text-gray-500 text-sm">
                          {call.inicio ? format(new Date(call.inicio), "HH:mm") : '-'}
                        </p>
                      </div>
                      {call.gravacao && (
                        <MicrophoneIcon className="w-5 h-5 text-purple-400" title="Gravado" />
                      )}
                      <div className={`px-3 py-1 rounded-full text-sm capitalize ${
                        call.status === 'em_andamento' ? 'bg-green-500/20 text-green-400' :
                        call.status === 'encerrada' ? 'bg-gray-500/20 text-gray-400' :
                        call.status === 'perdida' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {call.status.replace('_', ' ')}
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
          className="text-center py-24 mt-16"
        >
          <SparklesIcon className="w-32 h-32 text-blue-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-blue-300 max-w-4xl mx-auto">
            "A voz humana ainda é a arma mais poderosa de vendas. Use-a com sabedoria."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Supervisor de Call Center
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
