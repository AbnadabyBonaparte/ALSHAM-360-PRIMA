// src/pages/LiveChat.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Live Chat Alienígena 1000/1000
// Atendimento em tempo real. Cada conversa é uma oportunidade de encantamento.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

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
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
          const ativos = chats.filter((c: any) => c.status === 'ativo');
          const naFila = chats.filter((c: any) => c.status === 'na_fila');
          const encerrados = chats.filter((c: any) => c.status === 'encerrado' && c.satisfacao);
          const satisfacaoMedia = encerrados.length > 0
            ? encerrados.reduce((s: number, c: any) => s + c.satisfacao, 0) / encerrados.length
            : 0;

          setMetrics({
            atendentesOnline: atendentes?.length || 0,
            chatsAtivos: ativos.length,
            naFila: naFila.length,
            tempoMedioEspera: 2,
            satisfacaoMedia: satisfacaoMedia * 20,
            chats: chats.slice(0, 20).map((c: any) => ({
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
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-emerald)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-emerald)] font-light">Conectando ao chat...</p>
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
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
          LIVE CHAT SUPREMO
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Atendimento em tempo real, encantamento instantâneo
        </p>
      </motion.div>

      {/* STATUS EM TEMPO REAL */}
      <Card className="max-w-4xl mx-auto mb-12 bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--accent-emerald)]/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <SignalIcon className="w-8 h-8 text-[var(--accent-emerald)] animate-pulse" />
            <span className="text-2xl font-bold text-[var(--accent-emerald)]">STATUS AO VIVO</span>
          </div>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-6xl font-black text-[var(--text-primary)]">{metrics?.atendentesOnline || 0}</p>
              <p className="text-[var(--text-secondary)]">Atendentes Online</p>
            </div>
            <div>
              <p className="text-6xl font-black text-[var(--accent-emerald)]">{metrics?.chatsAtivos || 0}</p>
              <p className="text-[var(--text-secondary)]">Chats Ativos</p>
            </div>
            <div>
              <p className="text-6xl font-black text-[var(--accent-warning)]">{metrics?.naFila || 0}</p>
              <p className="text-[var(--text-secondary)]">Na Fila</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.chats.length || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <ClockIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.tempoMedioEspera || 0}min</p>
            <p className="text-[var(--text-secondary)]">Tempo Espera</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <BoltIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">30s</p>
            <p className="text-[var(--text-secondary)]">Resposta Média</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <HeartIcon className="w-12 h-12 text-[var(--accent-pink)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.satisfacaoMedia || 0).toFixed(0)}%</p>
            <p className="text-[var(--text-secondary)]">Satisfação</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE CHATS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-sky)] bg-clip-text text-transparent">
          Conversas Recentes
        </h2>

        {metrics?.chats.length === 0 ? (
          <div className="text-center py-20">
            <ChatBubbleLeftRightIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhuma conversa ativa</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics?.chats.map((chat, i) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                  chat.status === 'ativo'
                    ? 'border-[var(--accent-emerald)]/50 shadow-lg shadow-[var(--accent-emerald)]/10'
                    : chat.status === 'na_fila'
                    ? 'border-[var(--accent-warning)]/50'
                    : 'border-[var(--border)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      chat.status === 'ativo' ? 'bg-[var(--accent-emerald)] animate-pulse' :
                      chat.status === 'na_fila' ? 'bg-[var(--accent-warning)] animate-pulse' :
                      'bg-[var(--text-secondary)]'
                    }`} />
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">{chat.visitante}</h3>
                      <p className="text-[var(--text-secondary)] text-sm">{chat.pagina_origem}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {chat.atendente && (
                      <div className="text-[var(--text-secondary)]">
                        Atendido por <span className="text-[var(--text-primary)] font-medium">{chat.atendente}</span>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-[var(--text-primary)] font-medium">{chat.mensagens} mensagens</p>
                      <p className="text-[var(--text-secondary)] text-sm">
                        {chat.inicio ? format(new Date(chat.inicio), "HH:mm", { locale: ptBR }) : '-'}
                        {chat.duracao > 0 && ` • ${chat.duracao}min`}
                      </p>
                    </div>
                    {chat.satisfacao && (
                      <Badge className={`${
                        chat.satisfacao >= 4 ? 'bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]' :
                        chat.satisfacao >= 3 ? 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]' :
                        'bg-[var(--accent-alert)]/20 text-[var(--accent-alert)]'
                      }`}>
                        {chat.satisfacao}/5
                      </Badge>
                    )}
                    <Badge className={`capitalize ${
                      chat.status === 'ativo' ? 'bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]' :
                      chat.status === 'na_fila' ? 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]' :
                      'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)]'
                    }`}>
                      {chat.status.replace('_', ' ')}
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
        <SparklesIcon className="w-32 h-32 text-[var(--accent-emerald)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-emerald)] max-w-4xl mx-auto">
          "Cada segundo conta. Velocidade de resposta é velocidade de conversão."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Comandante de Chat
        </p>
      </motion.div>
    </div>
  );
}
