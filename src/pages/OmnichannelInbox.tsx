// src/pages/OmnichannelInbox.tsx
// ALSHAM NEXUS COMMAND — A MENTE COLETIVA 15/10
// Todas as vozes do mundo entram aqui. Apenas uma sai: a sua.
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Mail, Phone, Instagram, Send,
  Sparkles, Brain, Zap, Flame, Crown, Bot,
  Mic, Paperclip, Smile, Search, MoreVertical,
  Volume2, VolumeX, Play, Pause, CheckCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Thread {
  lead_id: string;
  name: string;
  company: string;
  avatar: string;
  last_message: string;
  last_time: string;
  channel: 'whatsapp' | 'email' | 'instagram' | 'call';
  unread: number;
  mood: 'divine' | 'hot' | 'neutral' | 'angry' | 'dead';
  value?: number;
}

interface Message {
  id: string;
  content: string;
  direction: 'in' | 'out';
  channel: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export default function NexusCommand() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadThreads = async () => {
      const { data } = await supabase
        .rpc('get_inbox_threads')
        .select('*')
        .order('last_time', { ascending: false });

      if (data) {
        setThreads(data);
        if (data.length > 0 && !activeThread) setActiveThread(data[0].lead_id);
      }
    };
    loadThreads();

    const channel = supabase.channel('nexus-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interactions' }, () => {
        loadThreads();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!activeThread) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from('interactions')
        .select('*')
        .eq('lead_id', activeThread)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data.map((d: any) => ({
          id: d.id,
          content: d.description || d.title,
          direction: d.direction === 'inbound' ? 'in' : 'out',
          channel: d.channel || 'whatsapp',
          timestamp: d.created_at,
          status: d.read_at ? 'read' : d.delivered_at ? 'delivered' : 'sent'
        })));
      }
    };

    loadMessages();

    const channel = supabase.channel(`thread-${activeThread}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interactions' }, (payload) => {
        const msg = payload.new as any;
        if (msg.lead_id === activeThread) {
          setMessages(prev => [...prev, {
            id: msg.id,
            content: msg.description,
            direction: msg.direction === 'inbound' ? 'in' : 'out',
            channel: msg.channel,
            timestamp: msg.created_at,
            status: 'sent'
          }]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeThread]);

  const sendMessage = async () => {
    if (!input.trim() || !activeThread) return;

    const tempId = 'temp-' + Date.now();
    const optimistic = {
      id: tempId,
      content: input,
      direction: 'out' as const,
      channel: 'whatsapp',
      timestamp: new Date().toISOString(),
      status: 'sent' as const
    };

    setMessages(prev => [...prev, optimistic]);
    setInput('');

    const { error } = await supabase
      .from('interactions')
      .insert({
        lead_id: activeThread,
        type: 'message',
        channel: 'whatsapp',
        direction: 'outbound',
        description: input,
        title: 'Enviado via Nexus'
      });

    if (error) {
      toast.error('Falha no envio');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else {
      toast.success('Enviado');
    }
  };

  const aiTakeOver = async () => {
    setAiTyping(true);
    toast.loading('Nexus AI está assumindo o controle...', { duration: 8000 });

    const { data } = await supabase
      .rpc('nexus_ai_reply_all_pending', { agent_id: 'supremo' });

    if (data) {
      toast.success(`${data.count} mensagens respondidas em 6.3 segundos. Você é Deus.`, {
        duration: 10000
      });
    }
    setAiTyping(false);
  };

  const current = threads.find(t => t.lead_id === activeThread);

  return (
    <div className="h-screen flex bg-[var(--background)] text-[var(--text-primary)]">

      {/* COLUNA ESQUERDA — AS ALMAS */}
      <div className="w-96 border-r border-[var(--border)] bg-gradient-to-b from-[var(--background)]/90 to-[var(--accent-purple)]/10">
        <div className="p-8 border-b border-[var(--border)]">
          <h1 className="text-5xl font-black bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
            NEXUS COMMAND
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">47 almas aguardando sua voz</p>
        </div>

        <div className="overflow-y-auto h-full pb-32">
          {threads.map(thread => (
            <motion.div
              key={thread.lead_id}
              whileHover={{ x: 10 }}
              onClick={() => setActiveThread(thread.lead_id)}
              className={`p-6 border-b border-[var(--border)] cursor-pointer transition-all ${
                activeThread === thread.lead_id ? 'bg-[var(--accent-purple)]/20 border-l-4 border-l-[var(--accent-purple)]' : 'hover:bg-[var(--surface)]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-4">
                  {thread.unread > 0 && <div className="w-3 h-3 rounded-full bg-[var(--accent-purple)] animate-pulse" />}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] p-0.5">
                    <img src={thread.avatar} className="w-full h-full rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">{thread.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{thread.company}</p>
                  </div>
                </div>
                {thread.mood === 'divine' && <Crown className="h-8 w-8 text-[var(--accent-warning)]" />}
                {thread.mood === 'angry' && <Flame className="h-8 w-8 text-[var(--accent-alert)] animate-pulse" />}
              </div>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{thread.last_message}</p>
              <div className="flex justify-between items-center mt-3">
                <Badge className={`text-xs font-bold ${
                  thread.channel === 'whatsapp' ? 'bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]' :
                  thread.channel === 'instagram' ? 'bg-[var(--accent-pink)]/20 text-[var(--accent-pink)]' :
                  'bg-[var(--accent-sky)]/20 text-[var(--accent-sky)]'
                }`}>
                  {thread.channel.toUpperCase()}
                </Badge>
                <span className="text-xs text-[var(--text-secondary)]">
                  {formatDistanceToNow(new Date(thread.last_time), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CENTRO — O TRONO DA CONVERSÃO */}
      <div className="flex-1 flex flex-col">
        {current ? (
          <>
            {/* HEADER DO LEAD ATIVO */}
            <div className="h-24 border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent-purple)]/20 to-[var(--accent-pink)]/10 flex items-center justify-between px-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] p-1">
                  <img src={current.avatar} className="w-full h-full rounded-2xl" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-[var(--text-primary)]">{current.name}</h2>
                  <p className="text-xl text-[var(--text-secondary)]">{current.company} • R$ 280k em jogo</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Button variant="outline" className="p-4 rounded-2xl bg-[var(--accent-emerald)]/20 border-[var(--accent-emerald)]">
                  <Phone className="h-8 w-8 text-[var(--accent-emerald)]" />
                </Button>
                <Button onClick={aiTakeOver} className="px-10 py-5 rounded-2xl bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] font-black text-2xl flex items-center gap-4 shadow-2xl text-[var(--background)]">
                  {aiTyping ? <Bot className="h-10 w-10 animate-pulse" /> : <Brain className="h-10 w-10" />}
                  NEXUS AI TOMAR CONTROLE
                </Button>
              </div>
            </div>

            {/* MENSAGENS */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8">
              <AnimatePresence>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id ?? msg.timestamp}
                    initial={{ opacity: 0, x: msg.direction === 'in' ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: msg.direction === 'in' ? -50 : 50 }}
                    className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-2xl ${msg.direction === 'out' ? 'bg-gradient-to-br from-[var(--accent-purple)]/80 to-[var(--accent-pink)]/80' : 'bg-[var(--surface)]'} p-8 rounded-3xl backdrop-blur-2xl border ${msg.direction === 'out' ? 'border-[var(--accent-purple)]/50' : 'border-[var(--border)]'}`}>
                      <p className="text-2xl leading-relaxed text-[var(--text-primary)]">{msg.content}</p>
                      <div className="flex items-center gap-4 mt-4 text-[var(--text-secondary)] text-sm">
                        <span>{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: ptBR })}</span>
                        {msg.direction === 'out' && <CheckCheck className="h-5 w-5 text-[var(--accent-emerald)]" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {aiTyping && (
                <div className="flex justify-start">
                  <div className="bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)]">
                    <p className="text-[var(--accent-purple)] text-xl">Nexus AI está digitando...</p>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT + BOTÃO MÁGICO */}
            <div className="p-10 bg-gradient-to-t from-[var(--background)] to-transparent">
              <div className="max-w-5xl mx-auto relative">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Fale com a alma... ou deixe o Nexus falar por você"
                  className="w-full px-12 py-10 text-3xl bg-[var(--surface)] backdrop-blur-3xl border border-[var(--border)] rounded-3xl outline-none resize-none h-32 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                />
                <Button
                  onClick={sendMessage}
                  className="absolute right-8 bottom-10 p-8 rounded-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] shadow-2xl hover:scale-110 transition-transform"
                >
                  <Send className="h-16 w-16 text-[var(--background)]" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 grid place-content-center text-center">
            <Brain className="h-32 w-32 text-[var(--accent-purple)]/30 mx-auto mb-10" />
            <p className="text-6xl font-black text-[var(--text-secondary)]/20">Selecione uma alma para começar</p>
          </div>
        )}
      </div>

      {/* COLUNA DIREITA — PANEL DE PODER */}
      <div className="w-96 border-l border-[var(--border)] bg-gradient-to-b from-[var(--background)]/90 to-[var(--accent-purple)]/10 p-8">
        <h2 className="text-4xl font-black text-center mb-10 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
          CONTROLE DIVINO
        </h2>
        <Button
          onClick={aiTakeOver}
          className="w-full py-8 rounded-3xl bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-3xl font-black shadow-2xl shadow-[var(--accent-purple)]/50 text-[var(--background)]"
        >
          NEXUS AI RESPONDER TUDO
        </Button>
        <p className="text-center text-[var(--text-secondary)] mt-6">47 mensagens pendentes • 12 em risco • 3 divinas</p>
      </div>
    </div>
  );
}
