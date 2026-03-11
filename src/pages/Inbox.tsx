// src/pages/Inbox.tsx
// ALSHAM 360° PRIMA — Inbox (migrado para shadcn/ui)

import {
  Inbox,
  Mail,
  Phone,
  MessageCircle,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Paperclip
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/supabase/useAuthStore';
import { PageSkeleton, ErrorState } from '@/components/PageStates';
import { useEffect, useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
  const orgId = useAuthStore((s) => s.currentOrgId);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'whatsapp'>('all');

  const { data: messages = [], isLoading, error, refetch } = useQuery({
    queryKey: ['inbox', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Message[];
    },
    enabled: !!orgId,
  });

  useEffect(() => {
    const channel = supabase
      .channel('inbox-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const filtered = useMemo(() => {
    let result = messages;
    if (filter === 'unread') result = result.filter(m => !m.read);
    if (filter === 'high') result = result.filter(m => m.priority === 'high');
    if (filter === 'whatsapp') result = result.filter(m => m.channel === 'whatsapp');
    if (search) {
      result = result.filter(m =>
        m.from.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.body.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [messages, filter, search]);

  const unreadCount = messages.filter(m => !m.read).length;
  const highPriorityCount = messages.filter(m => m.priority === 'high').length;

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageCircle className="w-6 h-6 text-[var(--accent-emerald)]" />;
      case 'email': return <Mail className="w-6 h-6 text-[var(--accent-sky)]" />;
      case 'sms': return <Phone className="w-6 h-6 text-[var(--accent-sky)]" />;
      default: return <Inbox className="w-6 h-6 text-[var(--text-secondary)]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      {/* HEADER SUPREMO */}
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent-purple)]/20 via-[var(--background)] to-[var(--accent-sky)]/20 backdrop-blur-xl">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-8">
              <Inbox className="w-20 h-20 text-[var(--accent-sky)] animate-pulse" />
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-pink)] to-[var(--accent-sky)] bg-clip-text text-transparent">
                  Inbox Suprema
                </h1>
                <p className="text-3xl text-[var(--text-secondary)] mt-4">
                  {messages.length} mensagens • {unreadCount} não lidas • {highPriorityCount} urgentes
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-[var(--accent-emerald)]">
                99.7%
              </p>
              <p className="text-xl text-[var(--text-secondary)]">taxa de resposta em &lt; 5min</p>
            </div>
          </div>

          {/* FILTROS */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'ghost'}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${filter === 'all' ? 'bg-[var(--accent-sky)] text-[var(--text-primary)]' : 'bg-[var(--surface)]/10'}`}
            >
              Todas
            </Button>
            <Button
              onClick={() => setFilter('unread')}
              variant={filter === 'unread' ? 'default' : 'ghost'}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${filter === 'unread' ? 'bg-gradient-to-r from-[var(--accent-pink)] to-[var(--accent-purple)] text-[var(--text-primary)]' : 'bg-[var(--surface)]/10'}`}
            >
              Não lidas ({unreadCount})
            </Button>
            <Button
              onClick={() => setFilter('high')}
              variant={filter === 'high' ? 'default' : 'ghost'}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${filter === 'high' ? 'bg-gradient-to-r from-[var(--accent-alert)] to-[var(--accent-warning)] text-[var(--text-primary)]' : 'bg-[var(--surface)]/10'}`}
            >
              Urgentes ({highPriorityCount})
            </Button>
            <Button
              onClick={() => setFilter('whatsapp')}
              variant={filter === 'whatsapp' ? 'default' : 'ghost'}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${filter === 'whatsapp' ? 'bg-[var(--accent-emerald)] text-[var(--text-primary)]' : 'bg-[var(--surface)]/10'}`}
            >
              WhatsApp
            </Button>
          </div>

          {/* BUSCA */}
          <div className="mt-8 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-[var(--text-secondary)]" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar em todas as mensagens, contatos, assuntos..."
              className="w-full pl-20 pr-8 py-6 bg-[var(--surface)]/10 backdrop-blur-xl rounded-3xl text-2xl border border-[var(--border)] focus:border-[var(--accent-sky)]/70 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* MENSAGENS */}
      <div className="p-8 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-40">
            <Inbox className="w-40 h-40 text-[var(--text-secondary)] mx-auto mb-12" />
            <p className="text-5xl text-[var(--text-secondary)] font-light">
              {search ? 'Nenhum resultado encontrado' : 'Sua caixa está limpa'}
            </p>
            <p className="text-3xl text-[var(--text-secondary)] mt-8">
              {search ? 'Tente outro termo' : 'Parabéns pela organização'}
            </p>
          </div>
        ) : (
          <motion.div className="space-y-6">
            {filtered.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-3xl p-8 border-2 transition-all cursor-pointer ${
                  !msg.read
                    ? 'bg-gradient-to-r from-[var(--accent-purple)]/70 via-[var(--accent-pink)]/50 to-[var(--accent-purple)]/70 border-[var(--accent-purple)]/70 shadow-2xl shadow-[var(--accent-purple)]/20'
                    : 'bg-[var(--surface)]/5 border-[var(--border)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-sky)] to-[var(--accent-purple)] rounded-2xl flex items-center justify-center text-4xl font-bold text-[var(--text-primary)]">
                        {msg.from.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </div>
                      {msg.channel === 'whatsapp' && (
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--accent-emerald)] rounded-full flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-[var(--text-primary)]" />
                        </div>
                      )}
                      {!msg.read && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--accent-alert)] rounded-full flex items-center justify-center animate-pulse">
                          <AlertTriangle className="w-5 h-5 text-[var(--text-primary)]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-3xl font-bold text-[var(--text-primary)]">{msg.from}</h3>
                        {msg.channel !== 'email' && (
                          <Badge variant="outline" className="px-4 py-2 bg-[var(--surface)]/10 rounded-full text-sm font-medium">
                            {msg.channel.toUpperCase()}
                          </Badge>
                        )}
                        {msg.revenue_potential && (
                          <Badge className="px-4 py-2 bg-gradient-to-r from-[var(--accent-emerald)]/20 to-[var(--accent-emerald)]/20 border border-[var(--accent-emerald)]/50 rounded-full text-[var(--accent-emerald)] font-bold">
                            R$ {msg.revenue_potential.toLocaleString('pt-BR')} potencial
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl text-[var(--text-primary)] mb-4">{msg.subject}</p>
                      <p className="text-lg text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                        {msg.body}
                      </p>
                      <div className="flex items-center gap-6 mt-6 text-[var(--text-secondary)]">
                        <span className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          {formatDistanceToNow(new Date(msg.created_at), { locale: ptBR, addSuffix: true })}
                        </span>
                        {msg.has_attachment && <Paperclip className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="p-4 bg-[var(--surface)]/10 hover:bg-[var(--accent-sky)]/30 rounded-2xl transition-all group"
                  >
                    <Send className="w-8 h-8 text-[var(--text-primary)] group-hover:text-[var(--text-primary)]" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
