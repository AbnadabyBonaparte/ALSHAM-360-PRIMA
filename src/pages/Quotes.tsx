// src/pages/Quotes.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Cotações Alienígena 1000/1000
// Onde o dinheiro ganha forma. Onde o cliente diz SIM.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Quotes.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
import { 
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  UserGroupIcon,
  CalendarIcon,
  TagIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
      case 'approved': return { color: 'from-emerald-500 to-teal-600', label: 'Aprovada', icon: CheckCircleIcon };
      case 'sent': return { color: 'from-blue-500 to-cyan-600', label: 'Enviada', icon: ClockIcon };
      case 'viewed': return { color: 'from-purple-500 to-pink-600', label: 'Visualizada', icon: SparklesIcon };
      case 'rejected': return { color: 'from-red-500 to-orange-600', label: 'Rejeitada', icon: XIcon };
      case 'expired': return { color: 'from-gray-500 to-gray-600', label: 'Expirada', icon: CalendarIcon };
      default: return { color: 'from-yellow-500 to-amber-600', label: 'Rascunho', icon: DocumentTextIcon };
    }
  };

  return (
    <LayoutSupremo title="Cotações Supremas">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-9xl font-black bg-gradient-to-r from-emerald-400 via-cyan-500 to-yellow-600 bg-clip-text text-transparent">
            COTAÇÕES SUPREMAS
          </h1>
          <p className="text-6xl text-gray-300 mt-12 font-light">
            R$ {stats.totalValue.toLocaleString('pt-BR')} em propostas
          </p>
          <p className="text-5xl text-emerald-400 mt-6">
            R$ {stats.approvedValue.toLocaleString('pt-BR')} já convertidas • {stats.conversionRate}% taxa
          </p>
        </motion.div>

        {/* GRID DE COTAÇÕES */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap- gap-10">
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
                <div className={`absolute -top-top-6 -right-6 z-20 px-8 py-4 rounded-full font-black text-2xl shadow-2xl bg-gradient-to-r ${config.color}`}>
                  {config.label}
                  <Icon className="w-10 h-10 inline ml-4" />
                </div>

                <div className={`bg-gradient-to-br ${config.color} rounded-3xl p-1`}>
                  <div className="bg-black rounded-3xl p-10 h-full">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-4xl font-black text-white">{quote.number}</p>
                        <p className="text-2xl text-gray-300 mt-2">{quote.client_name}</p>
                        <p className="text-xl text-gray-400">{quote.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-6xl font-black text-emerald-400">
                          R$ {quote.value.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-2xl text-gray-400 mt-4">
                          {quote.conversion_probability}% chance
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <UserIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-xl text-gray-300">{quote.owner}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <CalendarIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-xl text-gray-300">
                          Válida até {format(new Date(quote.validity_date), "dd/MM/yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <TagIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-xl text-gray-300">{quote.items_count} itens</span>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-4 mt-10">
                      <button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-8 py-5 rounded-2xl font-bold text-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-3">
                        <ArrowDownTrayIcon className="w-8 h-8" />
                        Baixar PDF
                      </button>
                      <button className="flex-1 bg-white/10 hover:bg-white/20 px-8 py-5 rounded-2xl font-bold text-2xl transition-all border border-white/20 flex items-center justify-center gap-3">
                        <PrinterIcon className="w-8 h-8" />
                        Imprimir
                      </button>
                    </div>
                  </div>
                </div>
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
          <CurrencyDollarIcon className="w-64 h-64 text-emerald-500 mx-auto mb-16 animate-pulse" />
          <p className="text-text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-600">
            O DINHEIRO FALA
          </p>
          <p className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 mt-8">
            E A COTAÇÃO RESPONDE
          </p>
          <p className="text-5xl text-gray-400 mt-24">
            — Citizen Supremo X.1
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
