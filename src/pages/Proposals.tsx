// src/pages/Proposals.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Propostas Alienígenas 1000/1000
// 100% CSS Variables + shadcn/ui

import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Proposal {
  id: string;
  titulo: string;
  cliente: string;
  valor: number;
  status: 'rascunho' | 'enviada' | 'visualizada' | 'aceita' | 'recusada' | 'expirada';
  data_envio: string;
  data_expiracao: string;
  probabilidade: number;
}

interface ProposalMetrics {
  totalPropostas: number;
  valorTotal: number;
  aceitas: number;
  taxaAceitacao: number;
  propostas: Proposal[];
}

export default function ProposalsPage() {
  const [metrics, setMetrics] = useState<ProposalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeProposals() {
      try {
        const { data: propostas } = await supabase
          .from('propostas')
          .select('*')
          .order('id', { ascending: false });

        if (propostas) {
          const aceitas = propostas.filter(p => p.status === 'aceita').length;
          const enviadas = propostas.filter(p => ['enviada', 'visualizada', 'aceita', 'recusada'].includes(p.status)).length;

          setMetrics({
            totalPropostas: propostas.length,
            valorTotal: propostas.reduce((s, p) => s + (p.valor || 0), 0),
            aceitas,
            taxaAceitacao: enviadas > 0 ? (aceitas / enviadas) * 100 : 0,
            propostas: propostas.map(p => ({
              id: p.id,
              titulo: p.titulo || 'Proposta',
              cliente: p.cliente || 'Cliente',
              valor: p.valor || 0,
              status: p.status || 'rascunho',
              data_envio: p.data_envio || '',
              data_expiracao: p.data_expiracao || '',
              probabilidade: p.probabilidade || 50
            }))
          });
        } else {
          setMetrics({
            totalPropostas: 0,
            valorTotal: 0,
            aceitas: 0,
            taxaAceitacao: 0,
            propostas: []
          });
        }
      } catch (err) {
        console.error('Erro nas Propostas Supremas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeProposals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-emerald)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-emerald)] font-light">Preparando propostas...</p>
      </div>
    );
  }

  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element }> = {
    rascunho: { variant: 'secondary', icon: <DocumentTextIcon className="w-4 h-4" /> },
    enviada: { variant: 'default', icon: <PaperAirplaneIcon className="w-4 h-4" /> },
    visualizada: { variant: 'outline', icon: <ClockIcon className="w-4 h-4" /> },
    aceita: { variant: 'default', icon: <CheckCircleIcon className="w-4 h-4" /> },
    recusada: { variant: 'destructive', icon: <XCircleIcon className="w-4 h-4" /> },
    expirada: { variant: 'outline', icon: <ClockIcon className="w-4 h-4" /> }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
          PROPOSTAS SUPREMAS
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Cada proposta é uma oferta irrecusável
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-6">
            <DocumentTextIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.totalPropostas || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Propostas</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/30">
          <CardContent className="p-6">
            <CurrencyDollarIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {((metrics?.valorTotal || 0) / 1000).toFixed(0)}k</p>
            <p className="text-[var(--text-secondary)]">Valor Total</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-6">
            <CheckCircleIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.aceitas || 0}</p>
            <p className="text-[var(--text-secondary)]">Aceitas</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-sky)]/10 border-[var(--accent-sky)]/30">
          <CardContent className="p-6">
            <ArrowTrendingUpIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{(metrics?.taxaAceitacao || 0).toFixed(0)}%</p>
            <p className="text-[var(--text-secondary)]">Taxa Aceitação</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE PROPOSTAS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-sky)] bg-clip-text text-transparent">
          Pipeline de Propostas
        </h2>

        {metrics?.propostas.length === 0 ? (
          <div className="text-center py-20">
            <DocumentTextIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhuma proposta cadastrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics?.propostas.map((proposta, i) => {
              const config = statusConfig[proposta.status];
              return (
                <motion.div
                  key={proposta.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-[var(--surface)]/60 border-[var(--border)] hover:border-[var(--accent-emerald)]/50 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="p-3 rounded-xl bg-[var(--accent-emerald)]/10">
                            <span className="text-[var(--accent-emerald)]">{config.icon}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[var(--text)]">{proposta.titulo}</h3>
                            <p className="text-[var(--text-secondary)]">{proposta.cliente}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[var(--accent-emerald)]">R$ {proposta.valor.toLocaleString('pt-BR')}</p>
                            <p className="text-[var(--text-secondary)] text-sm">Valor</p>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-bold text-[var(--text)]">{proposta.probabilidade}%</p>
                            <p className="text-[var(--text-secondary)] text-sm">Probabilidade</p>
                          </div>

                          <Badge variant={config.variant} className="capitalize">
                            {proposta.status}
                          </Badge>
                        </div>
                      </div>

                      {/* BARRA DE PROBABILIDADE */}
                      <div className="mt-4">
                        <Progress 
                          value={proposta.probabilidade} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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
          "Uma proposta perfeita não vende. Ela faz o cliente implorar para comprar."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Closer Alienígena
        </p>
      </motion.div>
    </div>
  );
}
