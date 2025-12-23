// src/pages/Partners.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Parceiros Alienígenas 1000/1000
// 100% CSS Variables + shadcn/ui

import {
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  ChartBarIcon,
  GlobeAltIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Partner {
  id: string;
  nome: string;
  tipo: 'tecnologia' | 'distribuidor' | 'integrador' | 'revendedor' | 'estrategico';
  nivel: 'bronze' | 'prata' | 'ouro' | 'platina';
  status: 'ativo' | 'inativo' | 'prospect';
  receita_gerada: number;
  deals_conjuntos: number;
  nota_satisfacao: number;
  contato: string;
  pais: string;
}

interface PartnerMetrics {
  totalParceiros: number;
  ativos: number;
  receitaTotal: number;
  dealsConjuntos: number;
  parceiros: Partner[];
}

export default function PartnersPage() {
  const [metrics, setMetrics] = useState<PartnerMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremePartners() {
      try {
        const { data: parceiros } = await supabase
          .from('parceiros')
          .select('*')
          .order('receita_gerada', { ascending: false });

        if (parceiros) {
          const ativos = parceiros.filter(p => p.status === 'ativo').length;
          const receitaTotal = parceiros.reduce((s, p) => s + (p.receita_gerada || 0), 0);
          const dealsConjuntos = parceiros.reduce((s, p) => s + (p.deals_conjuntos || 0), 0);

          setMetrics({
            totalParceiros: parceiros.length,
            ativos,
            receitaTotal,
            dealsConjuntos,
            parceiros: parceiros.map(p => ({
              id: p.id,
              nome: p.nome || 'Parceiro',
              tipo: p.tipo || 'estrategico',
              nivel: p.nivel || 'bronze',
              status: p.status || 'prospect',
              receita_gerada: p.receita_gerada || 0,
              deals_conjuntos: p.deals_conjuntos || 0,
              nota_satisfacao: p.nota_satisfacao || 0,
              contato: p.contato || '',
              pais: p.pais || 'Brasil'
            }))
          });
        } else {
          setMetrics({
            totalParceiros: 0,
            ativos: 0,
            receitaTotal: 0,
            dealsConjuntos: 0,
            parceiros: []
          });
        }
      } catch (err) {
        console.error('Erro nos Parceiros Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremePartners();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-sky)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-sky)] font-light">Conectando alianças...</p>
      </div>
    );
  }

  const nivelConfig: Record<string, { bg: string; border: string }> = {
    bronze: { bg: 'from-[var(--accent-warning)]/40 to-[var(--accent-warning)]/20', border: 'border-[var(--accent-warning)]/30' },
    prata: { bg: 'from-[var(--text-secondary)]/40 to-[var(--text-secondary)]/20', border: 'border-[var(--text-secondary)]/30' },
    ouro: { bg: 'from-[var(--accent-warning)]/40 to-[var(--accent-warning)]/20', border: 'border-[var(--accent-warning)]/30' },
    platina: { bg: 'from-[var(--accent-sky)]/40 to-[var(--accent-sky)]/20', border: 'border-[var(--accent-sky)]/30' }
  };

  const tipoLabel: Record<string, string> = {
    tecnologia: 'Tecnologia',
    distribuidor: 'Distribuidor',
    integrador: 'Integrador',
    revendedor: 'Revendedor',
    estrategico: 'Estratégico'
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-sky)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          PARCEIROS SUPREMOS
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Cada parceiro é uma aliança estratégica invencível
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--accent-sky)]/10 border-[var(--accent-sky)]/30">
          <CardContent className="p-6">
            <BuildingOffice2Icon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.totalParceiros || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Parceiros</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-6">
            <StarIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.ativos || 0}</p>
            <p className="text-[var(--text-secondary)]">Ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/30">
          <CardContent className="p-6">
            <CurrencyDollarIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {((metrics?.receitaTotal || 0) / 1000000).toFixed(1)}M</p>
            <p className="text-[var(--text-secondary)]">Receita Gerada</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-purple)]/10 border-[var(--accent-purple)]/30">
          <CardContent className="p-6">
            <ChartBarIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.dealsConjuntos || 0}</p>
            <p className="text-[var(--text-secondary)]">Deals Conjuntos</p>
          </CardContent>
        </Card>
      </div>

      {/* GRID DE PARCEIROS */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-sky)] bg-clip-text text-transparent">
          Rede de Parceiros
        </h2>

        {metrics?.parceiros.length === 0 ? (
          <div className="text-center py-20">
            <BuildingOffice2Icon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhum parceiro cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics?.parceiros.map((parceiro, i) => {
              const config = nivelConfig[parceiro.nivel];
              return (
                <motion.div
                  key={parceiro.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className={`bg-gradient-to-br ${config.bg} ${config.border} backdrop-blur-xl`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {tipoLabel[parceiro.tipo]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrophyIcon className="w-5 h-5 text-[var(--accent-warning)]" />
                          <span className="text-[var(--accent-warning)] font-bold capitalize">{parceiro.nivel}</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-[var(--text)] mb-1">{parceiro.nome}</h3>
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-6">
                        <GlobeAltIcon className="w-4 h-4" />
                        <span>{parceiro.pais}</span>
                        {parceiro.status !== 'ativo' && (
                          <Badge variant="secondary" className="text-xs">
                            {parceiro.status}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Receita Gerada</span>
                          <span className="text-[var(--accent-emerald)] font-bold">R$ {(parceiro.receita_gerada / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Deals Conjuntos</span>
                          <span className="text-[var(--text)] font-bold">{parceiro.deals_conjuntos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Satisfação</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, idx) => (
                              <StarIcon
                                key={idx}
                                className={`w-4 h-4 ${idx < parceiro.nota_satisfacao ? 'text-[var(--accent-warning)] fill-[var(--accent-warning)]' : 'text-[var(--text-secondary)]/30'}`}
                              />
                            ))}
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
          "Sozinhos vamos rápido. Juntos vamos longe. Parceiros são multiplicadores."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Diretor de Alianças
        </p>
      </motion.div>
    </div>
  );
}
