// src/pages/Compliance.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Compliance Alienígena 1000/1000
// Cada regra seguida é uma fortaleza. Compliance que blinda o império.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import {
  ShieldCheckIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ScaleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComplianceItem {
  id: string;
  nome: string;
  categoria: 'lgpd' | 'financeiro' | 'trabalhista' | 'ambiental' | 'fiscal' | 'outro';
  status: 'conforme' | 'atencao' | 'nao_conforme' | 'em_analise';
  ultima_auditoria: string;
  proxima_auditoria: string;
  responsavel: string;
  risco: 'baixo' | 'medio' | 'alto' | 'critico';
}

interface ComplianceMetrics {
  totalItens: number;
  conformes: number;
  atencao: number;
  naoConformes: number;
  taxaConformidade: number;
  itens: ComplianceItem[];
}

export default function CompliancePage() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeCompliance() {
      try {
        const { data: itens } = await supabase
          .from('compliance')
          .select('*')
          .order('risco', { ascending: false });

        if (itens) {
          const conformes = itens.filter((i: any) => i.status === 'conforme').length;
          const atencao = itens.filter((i: any) => i.status === 'atencao').length;
          const naoConformes = itens.filter((i: any) => i.status === 'nao_conforme').length;

          setMetrics({
            totalItens: itens.length,
            conformes,
            atencao,
            naoConformes,
            taxaConformidade: itens.length > 0 ? (conformes / itens.length) * 100 : 0,
            itens: itens.map((i: any) => ({
              id: i.id,
              nome: i.nome || 'Item de Compliance',
              categoria: i.categoria || 'outro',
              status: i.status || 'em_analise',
              ultima_auditoria: i.ultima_auditoria || '',
              proxima_auditoria: i.proxima_auditoria || '',
              responsavel: i.responsavel || '',
              risco: i.risco || 'baixo'
            }))
          });
        } else {
          setMetrics({
            totalItens: 0,
            conformes: 0,
            atencao: 0,
            naoConformes: 0,
            taxaConformidade: 0,
            itens: []
          });
        }
      } catch (err) {
        console.error('Erro no Compliance Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeCompliance();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-sky)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-sky)] font-light">Verificando conformidade...</p>
      </div>
    );
  }

  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element }> = {
    conforme: { variant: 'default', icon: <CheckCircleIcon className="w-5 h-5" /> },
    atencao: { variant: 'outline', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
    nao_conforme: { variant: 'destructive', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
    em_analise: { variant: 'secondary', icon: <ClockIcon className="w-5 h-5" /> }
  };

  const riscoConfig: Record<string, { bg: string; text: string }> = {
    baixo: { bg: 'bg-[var(--accent-emerald)]/20', text: 'text-[var(--accent-emerald)]' },
    medio: { bg: 'bg-[var(--accent-warning)]/20', text: 'text-[var(--accent-warning)]' },
    alto: { bg: 'bg-[var(--accent-alert)]/20', text: 'text-[var(--accent-alert)]' },
    critico: { bg: 'bg-[var(--accent-alert)]/30', text: 'text-[var(--accent-alert)]' }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-purple)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          COMPLIANCE SUPREMO
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Cada regra seguida é uma fortaleza blindada
        </p>
      </motion.div>

      {/* SCORE DE CONFORMIDADE */}
      <Card className={`max-w-md mx-auto mb-12 ${
        (metrics?.taxaConformidade || 0) >= 90 ? 'bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]' :
        (metrics?.taxaConformidade || 0) >= 70 ? 'bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]' :
        'bg-[var(--accent-alert)]/10 border-[var(--accent-alert)]'
      } border-4`}>
        <CardContent className="p-8 text-center">
          <ShieldCheckIcon className={`w-20 h-20 mx-auto mb-4 ${
            (metrics?.taxaConformidade || 0) >= 90 ? 'text-[var(--accent-emerald)]' :
            (metrics?.taxaConformidade || 0) >= 70 ? 'text-[var(--accent-warning)]' :
            'text-[var(--accent-alert)]'
          }`} />
          <p className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--text-primary)]">{(metrics?.taxaConformidade || 0).toFixed(0)}%</p>
          <p className="text-2xl text-[var(--text-secondary)] mt-2">Taxa de Conformidade</p>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--surface)]/60 border-[var(--border)]">
          <CardContent className="p-6">
            <DocumentCheckIcon className="w-12 h-12 text-[var(--text-secondary)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalItens || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Itens</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-6">
            <CheckCircleIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.conformes || 0}</p>
            <p className="text-[var(--text-secondary)]">Conformes</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/30">
          <CardContent className="p-6">
            <ExclamationTriangleIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.atencao || 0}</p>
            <p className="text-[var(--text-secondary)]">Atenção</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-alert)]/10 border-[var(--accent-alert)]/30">
          <CardContent className="p-6">
            <ExclamationTriangleIcon className="w-12 h-12 text-[var(--accent-alert)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.naoConformes || 0}</p>
            <p className="text-[var(--text-secondary)]">Não Conformes</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE ITENS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          Checklist de Compliance
        </h2>

        {metrics?.itens.length === 0 ? (
          <div className="text-center py-20">
            <ShieldCheckIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhum item de compliance</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics?.itens.map((item, i) => {
              const statConfig = statusConfig[item.status];
              const riskConfig = riscoConfig[item.risco];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`bg-[var(--surface)]/60 backdrop-blur-xl border transition-all ${
                    item.status === 'nao_conforme' ? 'border-[var(--accent-alert)]/50' :
                    item.status === 'atencao' ? 'border-[var(--accent-warning)]/50' :
                    'border-[var(--border)]'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="p-3 rounded-xl bg-[var(--background)]/40">
                            {statConfig.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">{item.nome}</h3>
                            <p className="text-[var(--text-secondary)] text-sm">
                              {item.categoria.toUpperCase()} • Responsável: {item.responsavel || 'Não definido'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[var(--text-secondary)] text-sm">Última Auditoria</p>
                            <p className="text-[var(--text-primary)]">
                              {item.ultima_auditoria ? format(new Date(item.ultima_auditoria), 'dd/MM/yy') : '-'}
                            </p>
                          </div>
                          <Badge className={`${riskConfig.bg} ${riskConfig.text} text-sm capitalize`}>
                            Risco {item.risco}
                          </Badge>
                          <Badge variant={statConfig.variant} className="font-medium capitalize flex items-center gap-2">
                            {statConfig.icon}
                            {item.status.replace('_', ' ')}
                          </Badge>
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
          "Compliance não é custo. É investimento em reputação e sustentabilidade."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Guardião da Conformidade
        </p>
      </motion.div>
    </div>
  );
}
