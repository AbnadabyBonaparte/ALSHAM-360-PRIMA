// src/pages/Contracts.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Contratos Alienígenas 1000/1000
// 100% CSS Variables + shadcn/ui

import {
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  SparklesIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Contract {
  id: string;
  titulo: string;
  cliente: string;
  tipo: string;
  valor_mensal: number;
  valor_total: number;
  status: 'rascunho' | 'em_revisao' | 'assinado' | 'ativo' | 'expirado' | 'cancelado';
  data_inicio: string;
  data_fim: string;
  renovacao_automatica: boolean;
}

interface ContractMetrics {
  totalContratos: number;
  ativos: number;
  valorRecorrente: number;
  valorTotal: number;
  contratos: Contract[];
}

export default function ContractsPage() {
  const [metrics, setMetrics] = useState<ContractMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeContracts() {
      try {
        const { data: contratos } = await supabase
          .from('contratos')
          .select('*')
          .order('id', { ascending: false });

        if (contratos) {
          const ativos = contratos.filter(c => c.status === 'ativo');
          const valorRecorrente = ativos.reduce((s, c) => s + (c.valor_mensal || 0), 0);

          setMetrics({
            totalContratos: contratos.length,
            ativos: ativos.length,
            valorRecorrente,
            valorTotal: contratos.reduce((s, c) => s + (c.valor_total || 0), 0),
            contratos: contratos.map(c => ({
              id: c.id,
              titulo: c.titulo || 'Contrato',
              cliente: c.cliente || 'Cliente',
              tipo: c.tipo || 'Serviço',
              valor_mensal: c.valor_mensal || 0,
              valor_total: c.valor_total || 0,
              status: c.status || 'rascunho',
              data_inicio: c.data_inicio || '',
              data_fim: c.data_fim || '',
              renovacao_automatica: c.renovacao_automatica || false
            }))
          });
        } else {
          setMetrics({
            totalContratos: 0,
            ativos: 0,
            valorRecorrente: 0,
            valorTotal: 0,
            contratos: []
          });
        }
      } catch (err) {
        console.error('Erro nos Contratos Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeContracts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-sky)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-sky)] font-light">Analisando contratos...</p>
      </div>
    );
  }

  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    rascunho: { variant: 'secondary' },
    em_revisao: { variant: 'outline' },
    assinado: { variant: 'default' },
    ativo: { variant: 'default' },
    expirado: { variant: 'outline' },
    cancelado: { variant: 'destructive' }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-sky)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
          CONTRATOS SUPREMOS
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Cada contrato é uma fortaleza jurídica blindada
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--accent-sky)]/10 border-[var(--accent-sky)]/30">
          <CardContent className="p-6">
            <DocumentDuplicateIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.totalContratos || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Contratos</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-6">
            <ShieldCheckIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.ativos || 0}</p>
            <p className="text-[var(--text-secondary)]">Ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-purple)]/10 border-[var(--accent-purple)]/30">
          <CardContent className="p-6">
            <CurrencyDollarIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {((metrics?.valorRecorrente || 0) / 1000).toFixed(0)}k/mês</p>
            <p className="text-[var(--text-secondary)]">Recorrente</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/30">
          <CardContent className="p-6">
            <CurrencyDollarIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {((metrics?.valorTotal || 0) / 1000000).toFixed(1)}M</p>
            <p className="text-[var(--text-secondary)]">Valor Total</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE CONTRATOS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
          Gestão de Contratos
        </h2>

        {metrics?.contratos.length === 0 ? (
          <div className="text-center py-20">
            <DocumentDuplicateIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhum contrato cadastrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics?.contratos.map((contrato, i) => {
              const config = statusConfig[contrato.status];
              const diasRestantes = contrato.data_fim
                ? differenceInDays(new Date(contrato.data_fim), new Date())
                : 0;

              return (
                <motion.div
                  key={contrato.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`bg-[var(--surface)]/60 border transition-all ${
                    contrato.status === 'ativo' ? 'border-[var(--accent-emerald)]/30 hover:border-[var(--accent-emerald)]/50' :
                    'border-[var(--border)] hover:border-[var(--accent-sky)]/50'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="p-4 bg-[var(--accent-sky)]/20 rounded-2xl">
                            <DocumentDuplicateIcon className="w-8 h-8 text-[var(--accent-sky)]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[var(--text)]">{contrato.titulo}</h3>
                            <p className="text-[var(--text-secondary)]">{contrato.cliente} • {contrato.tipo}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-xl font-bold text-[var(--text)]">R$ {contrato.valor_mensal.toLocaleString('pt-BR')}</p>
                            <p className="text-[var(--text-secondary)] text-sm">/mês</p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-[var(--text-secondary)]">
                              {contrato.data_inicio ? format(new Date(contrato.data_inicio), 'dd/MM/yy') : '-'} →{' '}
                              {contrato.data_fim ? format(new Date(contrato.data_fim), 'dd/MM/yy') : '-'}
                            </p>
                            {contrato.status === 'ativo' && diasRestantes <= 30 && diasRestantes > 0 && (
                              <p className="text-[var(--accent-warning)] text-sm font-medium">Expira em {diasRestantes} dias</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {contrato.renovacao_automatica && (
                              <div className="p-2 bg-[var(--accent-sky)]/20 rounded-lg" title="Renovação automática">
                                <CheckBadgeIcon className="w-5 h-5 text-[var(--accent-sky)]" />
                              </div>
                            )}
                            <Badge variant={config.variant} className="capitalize">
                              {contrato.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
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
        <SparklesIcon className="w-32 h-32 text-[var(--accent-sky)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-sky)] max-w-4xl mx-auto">
          "Um contrato bem redigido é a diferença entre lucro e prejuízo."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Conselheiro Jurídico
        </p>
      </motion.div>
    </div>
  );
}
