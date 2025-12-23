// src/pages/Quotes.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Cotações Alienígena 1000/1000
// 100% CSS Variables + shadcn/ui

import { 
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  PrinterIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Quote {
  id: string;
  number: string;
  client_name: string;
  company: string;
  value: number;
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired';
  validity_date: string;
  created_at: string;
  items_count: number;
  conversion_probability: number;
  owner: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeQuotes() {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setQuotes(data.map((q: any) => ({
          id: q.id,
          number: q.quote_number || `COT-${q.id.slice(0, 8).toUpperCase()}`,
          client_name: q.client_name || 'Cliente Supremo',
          company: q.company || 'Empresa X',
          value: q.total_value || 0,
          status: q.status || 'draft',
          validity_date: q.validity_date || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          created_at: q.created_at,
          items_count: q.items?.length || 0,
          conversion_probability: q.ai_conversion_probability || 0,
          owner: q.owner_name || 'Você'
        })));
      }
      setLoading(false);
    }

    loadSupremeQuotes();
  }, []);

  const stats = {
    totalValue: quotes.reduce((s, q) => s + q.value, 0),
    approvedValue: quotes.filter(q => q.status === 'approved').reduce((s, q) => s + q.value, 0),
    pendingValue: quotes.filter(q => ['sent', 'viewed'].includes(q.status)).reduce((s, q) => s + q.value, 0),
    conversionRate: quotes.length ? Math.round(quotes.filter(q => q.status === 'approved').length / quotes.length * 100) : 0
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved': return { variant: 'default' as const, label: 'Aprovada', icon: CheckCircleIcon };
      case 'sent': return { variant: 'secondary' as const, label: 'Enviada', icon: ClockIcon };
      case 'viewed': return { variant: 'outline' as const, label: 'Visualizada', icon: SparklesIcon };
      case 'rejected': return { variant: 'destructive' as const, label: 'Rejeitada', icon: XCircleIcon };
      case 'expired': return { variant: 'secondary' as const, label: 'Expirada', icon: CalendarIcon };
      default: return { variant: 'outline' as const, label: 'Rascunho', icon: DocumentTextIcon };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-emerald)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-emerald)] font-light">Carregando cotações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-warning)] bg-clip-text text-transparent">
          COTAÇÕES SUPREMAS
        </h1>
        <p className="text-6xl text-[var(--text-secondary)] mt-12 font-light">
          R$ {stats.totalValue.toLocaleString('pt-BR')} em propostas
        </p>
        <p className="text-5xl text-[var(--accent-emerald)] mt-6">
          R$ {stats.approvedValue.toLocaleString('pt-BR')} já convertidas • {stats.conversionRate}% taxa
        </p>
      </motion.div>

      {/* GRID DE COTAÇÕES */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {quotes.map((quote, i) => {
          const config = getStatusConfig(quote.status);
          const Icon = config.icon;

          return (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="group relative"
            >
              {/* Badge de status */}
              <div className="absolute -top-6 -right-6 z-20">
                <Badge variant={config.variant} className="px-4 py-2 text-lg font-black shadow-2xl">
                  {config.label}
                  <Icon className="w-5 h-5 ml-2" />
                </Badge>
              </div>

              <Card className="bg-[var(--surface)]/70 border-[var(--border)] overflow-hidden">
                <CardContent className="p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-4xl font-black text-[var(--text)]">{quote.number}</p>
                      <p className="text-2xl text-[var(--text-secondary)] mt-2">{quote.client_name}</p>
                      <p className="text-xl text-[var(--text-secondary)]/60">{quote.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-6xl font-black text-[var(--accent-emerald)]">
                        R$ {quote.value.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-2xl text-[var(--text-secondary)] mt-4">
                        {quote.conversion_probability}% chance
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <UserIcon className="w-8 h-8 text-[var(--text-secondary)]" />
                      <span className="text-xl text-[var(--text-secondary)]">{quote.owner}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CalendarIcon className="w-8 h-8 text-[var(--text-secondary)]" />
                      <span className="text-xl text-[var(--text-secondary)]">
                        Válida até {format(new Date(quote.validity_date), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <TagIcon className="w-8 h-8 text-[var(--text-secondary)]" />
                      <span className="text-xl text-[var(--text-secondary)]">{quote.items_count} itens</span>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-4 mt-10">
                    <Button className="flex-1 py-5 text-xl font-bold">
                      <ArrowDownTrayIcon className="w-6 h-6 mr-2" />
                      Baixar PDF
                    </Button>
                    <Button variant="outline" className="flex-1 py-5 text-xl font-bold">
                      <PrinterIcon className="w-6 h-6 mr-2" />
                      Imprimir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* MENSAGEM FINAL DA IA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center py-40 mt-32"
      >
        <CurrencyDollarIcon className="w-64 h-64 text-[var(--accent-emerald)] mx-auto mb-16 animate-pulse" />
        <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-purple)]">
          O DINHEIRO FALA
        </p>
        <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-pink)] to-[var(--accent-warning)] mt-8">
          E A COTAÇÃO RESPONDE
        </p>
        <p className="text-5xl text-[var(--text-secondary)] mt-24">
          — Citizen Supremo X.1
        </p>
      </motion.div>
    </div>
  );
}
