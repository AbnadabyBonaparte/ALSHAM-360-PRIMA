// src/pages/Inbox.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Inbox Alienígena 1000/1000
// A caixa de entrada que entende você melhor que você mesmo.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Inbox.tsx

import { 
  InboxIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  from: string;
  from_email: string;
  subject: string;
  body: string;
  channel: 'email' | 'whatsapp' | 'sms' | 'chat';
  created_at: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  has_attachment: boolean;
  revenue_potential?: number;
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filtered, setFiltered] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'whatsapp'>('all');

  useEffect(() => {
    async function loadSupremeInbox() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setMessages(data);
        setFiltered(data);
      }
      setLoading(false);
    }

    loadSupremeInbox();

    // Realtime total
    const channel = supabase
      .channel('inbox-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        loadSupremeInbox();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtro + busca
  useEffect(() => {
    let filtered = messages;

    if (filter === 'unread') filtered = filtered.filter(m => !m.read);
    if (filter === 'high') filtered = filtered.filter(m => m.priority === 'high');
    if (filter === 'whatsapp') filtered = filtered.filter(m => m.channel === 'whatsapp');

    if (search) {
      filtered = filtered.filter(m => 
        m.from.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.body.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(filtered);
  }, [messages, filter, search]);

  const unreadCount = messages.filter(m => !m.read).length;
  const highPriorityCount = messages.filter(m => m.priority === 'high').length;

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-400" />;
      case 'email': return <EnvelopeIcon className="w-6 h-6 text-blue-400" />;
      case 'sms': return <PhoneIcon className="w-6 h-6 text-cyan-400" />;
      default: return <InboxIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        {/* HEADER SUPREMO */}
        <div className="border-b border-[var(--border)] bg-gradient-to-r from-purple-900/20 via-black to-cyan-900/20 backdrop-blur-xl">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-8">
                <InboxIcon className="w-20 h-20 text-primary animate-pulse" />
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                    Inbox Suprema
                  </h1>
                  <p className="text-3xl text-gray-300 mt-4">
                    {messages.length} mensagens • {unreadCount} não lidas • {highPriorityCount} urgentes
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-emerald-400">
                  99.7%
                </p>
                <p className="text-xl text-gray-400">taxa de resposta em &lt; 5min</p>
              </div>
            </div>

            {/* FILTROS */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${filter === 'all' ? 'bg-primary text-[var(--text-primary)]' : 'bg-white/10'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${filter === 'unread' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-[var(--text-primary)]' : 'bg-white/10'}`}
              >
                Não lidas ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${filter === 'high' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-[var(--text-primary)]' : 'bg-white/10'}`}
              >
                Urgentes ({highPriorityCount})
              </button>
              <button
                onClick={() => setFilter('whatsapp')}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${filter === 'whatsapp' ? 'bg-green-500 text-[var(--text-primary)]' : 'bg-white/10'}`}
              >
                WhatsApp
              </button>
            </div>

            {/* BUSCA */}
            <div className="mt-8 relative">
              <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar em todas as mensagens, contatos, assuntos..."
                className="w-full pl-20 pr-8 py-6 bg-white/10 backdrop-blur-xl rounded-3xl text-2xl border border-white/20 focus:border-primary/70 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* MENSAGENS */}
        <div className="p-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-3xl h-40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-40">
              <InboxIcon className="w-40 h-40 text-gray-600 mx-auto mb-12" />
              <p className="text-5xl text-gray-400 font-light">
                {search ? 'Nenhum resultado encontrado' : 'Sua caixa está limpa'}
              </p>
              <p className="text-3xl text-gray-500 mt-8">
                {search ? 'Tente outro termo' : 'Parabéns pela organização'}
              </p>
            </div>
          ) : (
            <motion.div className="space-y-6">
              {filtered.map((filtered.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative rounded-3xl p-8 border-2 transition-all cursor-pointer ${
                    !msg.read 
                      ? 'bg-gradient-to-r from-purple-900/70 via-pink-900/50 to-purple-900/70 border-purple-500/70 shadow-2xl shadow-purple-500/20' 
                      : 'bg-white/5 border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-[var(--text-primary)]">
                          {msg.from.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                        {msg.channel === 'whatsapp' && (
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-[var(--text-primary)]" />
                          </div>
                        )}
                        {!msg.read && (
                          <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                            <ExclamationTriangleIcon className="w-5 h-5 text-[var(--text-primary)]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-3xl font-bold text-[var(--text-primary)]">{msg.from}</h3>
                          {msg.channel !== 'email' && (
                            <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium">
                              {msg.channel.toUpperCase()}
                            </span>
                          )}
                          {msg.revenue_potential && (
                            <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-full text-green-400 font-bold">
                              R$ {msg.revenue_potential.toLocaleString('pt-BR')} potencial
                            </span>
                          )}
                        </div>
                        <p className="text-2xl text-gray-200 mb-4">{msg.subject}</p>
                        <p className="text-lg text-gray-400 line-clamp-3 leading-relaxed">
                          {msg.body}
                        </p>
                        <div className="flex items-center gap-6 mt-6 text-gray-500">
                          <span className="flex items-center gap-2">
                            <ClockIcon className="w-5 h-5" />
                            {formatDistanceToNow(new Date(msg.created_at), { locale: ptBR, addSuffix: true })}
                          </span>
                          {msg.has_attachment && <PaperClipIcon className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    <button className="p-4 bg-white/10 hover:bg-primary/30 rounded-2xl transition-all group">
                      <PaperAirplaneIcon className="w-8 h-8 text-[var(--text-primary)] group-hover:text-[var(--text-primary)]" />
                    </button>
                  </div>
                </motion.div>
              ))))}
            </motion.div>
          )}
        </div>
      </div>
    
  );
}
