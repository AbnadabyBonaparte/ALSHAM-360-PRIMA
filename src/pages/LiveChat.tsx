// src/pages/LiveChat.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Live Chat Alienígena 1000/1000
// Atendimento em tempo real. Cada conversa é uma oportunidade de encantamento.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  SignalIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatSession {
  id: string;
  visitante: string;
  atendente: string | null;
  status: 'na_fila' | 'ativo' | 'encerrado';
  mensagens: number;
  inicio: string;
  duracao: number;
  satisfacao: number | null;
  pagina_origem: string;
}

interface ChatMetrics {
  atendentesOnline: number;
  chatsAtivos: number;
  naFila: number;
  tempoMedioEspera: number;
  satisfacaoMedia: number;
  chats: ChatSession[];
}

export default function LiveChatPage() {
  const [metrics, setMetrics] = useState<ChatMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeChat() {
      try {
        const { data: chats } = await supabase
          .from('live_chats')
          .select('*')
          .order('inicio', { ascending: false });

        const { data: atendentes } = await supabase
          .from('atendentes')
          .select('id')
          .eq('status', 'online');

        if (chats) {
          const ativos = chats.filter(c => c.status === 'ativo');
          const naFila = chats.filter(c => c.status === 'na_fila');
          const encerrados = chats.filter(c => c.status === 'encerrado' && c.satisfacao);
          const satisfacaoMedia = encerrados.length > 0
            ? encerrados.reduce((s, c) => s + c.satisfacao, 0) / encerrados.length
            : 0;

          setMetrics({
            atendentesOnline: atendentes?.length || 0,
            chatsAtivos: ativos.length,
            naFila: naFila.length,
            tempoMedioEspera: 2, // minutos
            satisfacaoMedia: satisfacaoMedia * 20, // Converte 1-5 para %
            chats: chats.slice(0, 20).map(c => ({
              id: c.id,
              visitante: c.visitante || 'Visitante',
              atendente: c.atendente || null,
              status: c.status || 'na_fila',
              mensagens: c.mensagens || 0,
              inicio: c.inicio || '',
              duracao: c.duracao || 0,
              satisfacao: c.satisfacao || null,
              pagina_origem: c.pagina_origem || '/'
            }))
          });
        } else {
          setMetrics({
            atendentesOnline: 0,
            chatsAtivos: 0,
            naFila: 0,
            tempoMedioEspera: 0,
            satisfacaoMedia: 0,
            chats: []
          });
        }
      } catch (err) {
        console.error('Erro no Live Chat Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeChat();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-green-500 rounded-full"
        />
        <p className="absolute text-4xl text-green-400 font-light">Conectando ao chat...</p>
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
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            LIVE CHAT SUPREMO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Atendimento em tempo real, encantamento instantâneo
          </p>
        </motion.div>

        {/* STATUS EM TEMPO REAL */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-3xl p-8 border border-green-500/30">
            <div className="flex items-center justify-center gap-3 mb-6">
              <SignalIcon className="w-8 h-8 text-green-400 animate-pulse" />
              <span className="text-2xl font-bold text-green-400">STATUS AO VIVO</span>
            </div>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-6xl font-black text-[var(--text-primary)]">{metrics?.atendentesOnline || 0}</p>
                <p className="text-gray-400">Atendentes Online</p>
              </div>
              <div>
                <p className="text-6xl font-black text-green-400">{metrics?.chatsAtivos || 0}</p>
                <p className="text-gray-400">Chats Ativos</p>
              </div>
              <div>
                <p className="text-6xl font-black text-yellow-400">{metrics?.naFila || 0}</p>
                <p className="text-gray-400">Na Fila</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.chats.length || 0}</p>
            <p className="text-gray-400">Total Hoje</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 rounded-2xl p-6 border border-blue-500/30">
            <ClockIcon className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.tempoMedioEspera || 0}min</p>
            <p className="text-gray-400">Tempo Espera</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <BoltIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">30s</p>
            <p className="text-gray-400">Resposta Média</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-pink-900/60 to-rose-900/60 rounded-2xl p-6 border border-pink-500/30">
            <HeartIcon className="w-12 h-12 text-pink-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.satisfacaoMedia || 0).toFixed(0)}%</p>
            <p className="text-gray-400">Satisfação</p>
          </motion.div>
        </div>

        {/* LISTA DE CHATS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Conversas Recentes
          </h2>

          {metrics?.chats.length === 0 ? (
            <div className="text-center py-20">
              <ChatBubbleLeftRightIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhuma conversa ativa</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics?.chats.map((chat, i) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    chat.status === 'ativo'
                      ? 'border-green-500/50 shadow-lg shadow-green-500/10'
                      : chat.status === 'na_fila'
                      ? 'border-yellow-500/50'
                      : 'border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        chat.status === 'ativo' ? 'bg-green-400 animate-pulse' :
                        chat.status === 'na_fila' ? 'bg-yellow-400 animate-pulse' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{chat.visitante}</h3>
                        <p className="text-gray-400 text-sm">{chat.pagina_origem}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {chat.atendente && (
                        <div className="text-gray-400">
                          Atendido por <span className="text-[var(--text-primary)] font-medium">{chat.atendente}</span>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-[var(--text-primary)] font-medium">{chat.mensagens} mensagens</p>
                        <p className="text-gray-500 text-sm">
                          {chat.inicio ? format(new Date(chat.inicio), "HH:mm", { locale: ptBR }) : '-'}
                          {chat.duracao > 0 && ` • ${chat.duracao}min`}
                        </p>
                      </div>
                      {chat.satisfacao && (
                        <div className={`px-3 py-1 rounded-full ${
                          chat.satisfacao >= 4 ? 'bg-green-500/20 text-green-400' :
                          chat.satisfacao >= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {chat.satisfacao}/5
                        </div>
                      )}
                      <div className={`px-3 py-1 rounded-full text-sm capitalize ${
                        chat.status === 'ativo' ? 'bg-green-500/20 text-green-400' :
                        chat.status === 'na_fila' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {chat.status.replace('_', ' ')}
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
          <SparklesIcon className="w-32 h-32 text-green-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-green-300 max-w-4xl mx-auto">
            "Cada segundo conta. Velocidade de resposta é velocidade de conversão."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Comandante de Chat
          </p>
        </motion.div>
      </div>
  );
}
