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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
      case 'whatsapp': return <ChatBubbleLeftRightIcon className="w-6 h-6 text-[var(--accent-1)]" />;
      case 'email': return <EnvelopeIcon className="w-6 h-6 text-[var(--accent-2)]" />;
      case 'sms': return <PhoneIcon className="w-6 h-6 text-[var(--accent-3)]" />;
      default: return <InboxIcon className="w-6 h-6 text-[var(--text-2)]" />;
    }
  };

  return (

      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        {/* HEADER SUPREMO */}
        <Card className="border-b border-[var(--border)] bg-[var(--grad-primary)] backdrop-blur-xl">
          <CardContent className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-8">
                <InboxIcon className="w-20 h-20 text-[var(--accent-1)] animate-pulse" />
                <div>
                  <CardTitle className="text-xl md:text-2xl lg:text-3xl font-black bg-[var(--grad-primary)] bg-clip-text text-transparent">
                    Inbox Suprema
                  </CardTitle>
                  <p className="text-3xl text-[var(--text-2)] mt-4">
                    {messages.length} mensagens • {unreadCount} não lidas • {highPriorityCount} urgentes
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-[var(--accent-1)]">
                  99.7%
                </p>
                <p className="text-xl text-[var(--text-2)]">taxa de resposta em &lt; 5min</p>
              </div>
            </div>

            {/* FILTROS */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                size="lg"
                className="px-8 py-4 text-lg"
              >
                Todas
              </Button>
              <Button
                onClick={() => setFilter('unread')}
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="lg"
                className="px-8 py-4 text-lg"
              >
                Não lidas ({unreadCount})
              </Button>
              <Button
                onClick={() => setFilter('high')}
                variant={filter === 'high' ? 'destructive' : 'outline'}
                size="lg"
                className="px-8 py-4 text-lg"
              >
                Urgentes ({highPriorityCount})
              </Button>
              <Button
                onClick={() => setFilter('whatsapp')}
                variant={filter === 'whatsapp' ? 'default' : 'outline'}
                size="lg"
                className="px-8 py-4 text-lg"
              >
                WhatsApp
              </Button>
            </div>

            {/* BUSCA */}
            <div className="mt-8 relative">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar em todas as mensagens, contatos, assuntos..."
                className="pl-16 pr-8 py-6 text-2xl"
              />
              <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-[var(--text-muted)]" />
            </div>
          </CardContent>
        </Card>

        {/* MENSAGENS */}
        <div className="p-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="bg-[var(--surface)] border-[var(--border)]">
                  <CardContent className="p-8">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-[var(--surface-elev)] rounded-2xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-8 bg-[var(--surface-elev)] rounded w-1/4"></div>
                          <div className="h-6 bg-[var(--surface-elev)] rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-[var(--surface-elev)] rounded w-3/4"></div>
                        <div className="h-4 bg-[var(--surface-elev)] rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="text-center py-40 bg-[var(--surface)] border-[var(--border)]">
              <CardContent>
                <InboxIcon className="w-40 h-40 text-[var(--text-muted)] mx-auto mb-12" />
                <p className="text-5xl text-[var(--text-2)] font-light">
                  {search ? 'Nenhum resultado encontrado' : 'Sua caixa está limpa'}
                </p>
                <p className="text-3xl text-[var(--text-muted)] mt-8">
                  {search ? 'Tente outro termo' : 'Parabéns pela organização'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div className="space-y-6">
              {filtered.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className={`relative border-2 transition-all cursor-pointer ${
                    !msg.read
                      ? 'bg-[var(--surface-glass)] border-[var(--accent-1)] shadow-2xl'
                      : 'bg-[var(--surface)] border-[var(--border)]'
                  }`}>
                    <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <Avatar className="w-20 h-20">
                            <AvatarFallback className="bg-[var(--grad-primary)] text-4xl font-bold">
                              {msg.from.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {msg.channel === 'whatsapp' && (
                            <div className="absolute -bottom-2 -right-2">
                              <Avatar className="w-10 h-10 bg-[var(--accent-1)]">
                                <AvatarFallback className="bg-[var(--accent-1)]">
                                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-[var(--text)]" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                          {!msg.read && (
                            <div className="absolute -top-3 -right-3">
                              <Avatar className="w-8 h-8 bg-[var(--accent-alert)] animate-pulse">
                                <AvatarFallback className="bg-[var(--accent-alert)]">
                                  <ExclamationTriangleIcon className="w-5 h-5 text-[var(--text)]" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-3xl font-bold text-[var(--text)]">{msg.from}</h3>
                            {msg.channel !== 'email' && (
                              <Badge variant="outline">
                                {msg.channel.toUpperCase()}
                              </Badge>
                            )}
                            {msg.revenue_potential && (
                              <Badge variant="default" className="bg-[var(--accent-1)]">
                                R$ {msg.revenue_potential.toLocaleString('pt-BR')} potencial
                              </Badge>
                            )}
                          </div>
                          <p className="text-2xl text-[var(--text-2)] mb-4">{msg.subject}</p>
                          <p className="text-lg text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                            {msg.body}
                          </p>
                          <div className="flex items-center gap-6 mt-6 text-[var(--text-muted)]">
                            <span className="flex items-center gap-2">
                              <ClockIcon className="w-5 h-5" />
                              {formatDistanceToNow(new Date(msg.created_at), { locale: ptBR, addSuffix: true })}
                            </span>
                            {msg.has_attachment && <PaperAirplaneIcon className="w-5 h-5" />}
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="lg" className="p-4">
                        <PaperAirplaneIcon className="w-8 h-8" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    
  );
}
