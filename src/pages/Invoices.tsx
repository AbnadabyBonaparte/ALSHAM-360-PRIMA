// src/pages/Invoices.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Faturas Alienígenas 1000/1000
// 100% CSS Variables + shadcn/ui

import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BanknotesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Invoice {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  status: 'rascunho' | 'enviada' | 'paga' | 'atrasada' | 'cancelada';
  data_emissao: string;
  data_vencimento: string;
  data_pagamento: string | null;
}

interface InvoiceMetrics {
  totalFaturas: number;
  valorEmitido: number;
  valorRecebido: number;
  valorPendente: number;
  atrasadas: number;
  faturas: Invoice[];
}

export default function InvoicesPage() {
  const [metrics, setMetrics] = useState<InvoiceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeInvoices() {
      try {
        const { data: faturas } = await supabase
          .from('faturas')
          .select('*')
          .order('data_emissao', { ascending: false });

        if (faturas) {
          const pagas = faturas.filter(f => f.status === 'paga');
          const pendentes = faturas.filter(f => ['enviada', 'atrasada'].includes(f.status));
          const atrasadas = faturas.filter(f => f.status === 'atrasada');

          setMetrics({
            totalFaturas: faturas.length,
            valorEmitido: faturas.reduce((s, f) => s + (f.valor || 0), 0),
            valorRecebido: pagas.reduce((s, f) => s + (f.valor || 0), 0),
            valorPendente: pendentes.reduce((s, f) => s + (f.valor || 0), 0),
            atrasadas: atrasadas.length,
            faturas: faturas.map(f => ({
              id: f.id,
              numero: f.numero || `#${f.id}`,
              cliente: f.cliente || 'Cliente',
              valor: f.valor || 0,
              status: f.status || 'rascunho',
              data_emissao: f.data_emissao || '',
              data_vencimento: f.data_vencimento || '',
              data_pagamento: f.data_pagamento || null
            }))
          });
        } else {
          setMetrics({
            totalFaturas: 0,
            valorEmitido: 0,
            valorRecebido: 0,
            valorPendente: 0,
            atrasadas: 0,
            faturas: []
          });
        }
      } catch (err) {
        console.error('Erro nas Faturas Supremas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeInvoices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-emerald)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-emerald)] font-light">Contando dinheiro...</p>
      </div>
    );
  }

  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element }> = {
    rascunho: { variant: 'secondary', icon: <DocumentTextIcon className="w-4 h-4" /> },
    enviada: { variant: 'outline', icon: <ClockIcon className="w-4 h-4" /> },
    paga: { variant: 'default', icon: <CheckCircleIcon className="w-4 h-4" /> },
    atrasada: { variant: 'destructive', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
    cancelada: { variant: 'secondary', icon: <ArrowPathIcon className="w-4 h-4" /> }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-emerald)] to-[var(--accent-sky)] bg-clip-text text-transparent">
          FATURAS SUPREMAS
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Cada fatura é dinheiro garantido no seu bolso
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12 max-w-7xl mx-auto">
        <Card className="bg-[var(--surface)]/60 border-[var(--border)]">
          <CardContent className="p-6">
            <DocumentTextIcon className="w-12 h-12 text-[var(--text-secondary)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.totalFaturas || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Faturas</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-sky)]/10 border-[var(--accent-sky)]/30">
          <CardContent className="p-6">
            <BanknotesIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {((metrics?.valorEmitido || 0) / 1000).toFixed(0)}k</p>
            <p className="text-[var(--text-secondary)]">Emitido</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-6">
            <CheckCircleIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {((metrics?.valorRecebido || 0) / 1000).toFixed(0)}k</p>
            <p className="text-[var(--text-secondary)]">Recebido</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/30">
          <CardContent className="p-6">
            <ClockIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {((metrics?.valorPendente || 0) / 1000).toFixed(0)}k</p>
            <p className="text-[var(--text-secondary)]">Pendente</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-alert)]/10 border-[var(--accent-alert)]/30">
          <CardContent className="p-6">
            <ExclamationTriangleIcon className="w-12 h-12 text-[var(--accent-alert)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.atrasadas || 0}</p>
            <p className="text-[var(--text-secondary)]">Atrasadas</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE FATURAS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-sky)] bg-clip-text text-transparent">
          Registro de Faturas
        </h2>

        {metrics?.faturas.length === 0 ? (
          <div className="text-center py-20">
            <DocumentTextIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhuma fatura cadastrada</p>
          </div>
        ) : (
          <Card className="bg-[var(--surface)]/60 border-[var(--border)]">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--border)]">
                  <TableHead className="text-[var(--text-secondary)]">Fatura</TableHead>
                  <TableHead className="text-[var(--text-secondary)]">Cliente</TableHead>
                  <TableHead className="text-right text-[var(--text-secondary)]">Valor</TableHead>
                  <TableHead className="text-center text-[var(--text-secondary)]">Emissão</TableHead>
                  <TableHead className="text-center text-[var(--text-secondary)]">Vencimento</TableHead>
                  <TableHead className="text-center text-[var(--text-secondary)]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics?.faturas.map((fatura, i) => {
                  const config = statusConfig[fatura.status];
                  const diasAtraso = fatura.status === 'atrasada' && fatura.data_vencimento
                    ? differenceInDays(new Date(), new Date(fatura.data_vencimento))
                    : 0;

                  return (
                    <motion.tr
                      key={fatura.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-[var(--border)] hover:bg-[var(--surface-strong)]/50 transition-colors"
                    >
                      <TableCell className="font-mono font-bold text-[var(--text)]">{fatura.numero}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{fatura.cliente}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-xl font-bold text-[var(--accent-emerald)]">
                          R$ {fatura.valor.toLocaleString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-[var(--text-secondary)]">
                        {fatura.data_emissao ? format(new Date(fatura.data_emissao), 'dd/MM/yy') : '-'}
                      </TableCell>
                      <TableCell className="text-center text-[var(--text-secondary)]">
                        {fatura.data_vencimento ? format(new Date(fatura.data_vencimento), 'dd/MM/yy') : '-'}
                        {diasAtraso > 0 && (
                          <span className="block text-[var(--accent-alert)] text-xs">{diasAtraso} dias atraso</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={config.variant} className="gap-2 capitalize">
                          {config.icon}
                          {fatura.status}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
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
          "Fatura enviada é dinheiro a caminho. Fatura paga é império crescendo."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Tesoureiro Alienígena
        </p>
      </motion.div>
    </div>
  );
}
