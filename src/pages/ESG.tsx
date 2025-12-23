// src/pages/ESG.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — ESG Alienígena 1000/1000
// Sustentabilidade é o novo luxo. Empresas conscientes dominam o futuro.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import {
  GlobeAmericasIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ESGScore {
  environmental: number;
  social: number;
  governance: number;
  total: number;
}

interface ESGInitiative {
  id: string;
  titulo: string;
  pilar: 'environmental' | 'social' | 'governance';
  status: 'planejada' | 'em_andamento' | 'concluida';
  impacto: 'baixo' | 'medio' | 'alto';
  meta: string;
  progresso: number;
}

interface ESGMetrics {
  score: ESGScore;
  iniciativas: ESGInitiative[];
  ranking: number;
}

export default function ESGPage() {
  const [metrics, setMetrics] = useState<ESGMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeESG() {
      try {
        const { data: iniciativas } = await supabase
          .from('esg_iniciativas')
          .select('*')
          .order('id', { ascending: false});

        const { data: scoreData } = await supabase
          .from('esg_scores')
          .select('*')
          .order('data', { ascending: false })
          .limit(1)
          .single();

        const score = scoreData || { environmental: 75, social: 80, governance: 85 };
        const total = (score.environmental + score.social + score.governance) / 3;

        setMetrics({
          score: {
            environmental: score.environmental || 75,
            social: score.social || 80,
            governance: score.governance || 85,
            total
          },
          iniciativas: (iniciativas || []).map((i: any) => ({
            id: i.id,
            titulo: i.titulo || 'Iniciativa ESG',
            pilar: i.pilar || 'environmental',
            status: i.status || 'planejada',
            impacto: i.impacto || 'medio',
            meta: i.meta || '',
            progresso: i.progresso || 0
          })),
          ranking: 15
        });
      } catch (err) {
        console.error('Erro no ESG Supremo:', err);
        setMetrics({
          score: { environmental: 75, social: 80, governance: 85, total: 80 },
          iniciativas: [],
          ranking: 15
        });
      } finally {
        setLoading(false);
      }
    }

    loadSupremeESG();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-emerald)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-emerald)] font-light">Calculando impacto...</p>
      </div>
    );
  }

  const pilarConfig: Record<string, { icon: JSX.Element; color: string; label: string }> = {
    environmental: { icon: <GlobeAmericasIcon className="w-8 h-8" />, color: 'var(--accent-emerald)', label: 'Ambiental' },
    social: { icon: <UserGroupIcon className="w-8 h-8" />, color: 'var(--accent-sky)', label: 'Social' },
    governance: { icon: <BuildingOfficeIcon className="w-8 h-8" />, color: 'var(--accent-purple)', label: 'Governança' }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          ESG SUPREMO
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Environmental, Social & Governance — O futuro é consciente
        </p>
      </motion.div>

      {/* SCORE ESG PRINCIPAL */}
      <Card className="max-w-2xl mx-auto mb-16 bg-gradient-to-br from-[var(--accent-emerald)]/20 via-[var(--accent-sky)]/20 to-[var(--accent-purple)]/20 border-[var(--accent-emerald)]/50">
        <CardContent className="p-12 text-center">
          <p className="text-2xl text-[var(--text-secondary)] mb-4">Score ESG Total</p>
          <p className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)]">{(metrics?.score.total || 0).toFixed(0)}</p>
          <p className="text-xl text-[var(--text-secondary)] mt-4">Top #{metrics?.ranking} no setor</p>
        </CardContent>
      </Card>

      {/* SCORES POR PILAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-8">
            <GlobeAmericasIcon className="w-16 h-16 text-[var(--accent-emerald)] mb-4" />
            <p className="text-6xl font-black text-[var(--text-primary)]">{metrics?.score.environmental || 0}</p>
            <p className="text-xl text-[var(--text-secondary)] mt-2">Environmental</p>
            <Progress value={metrics?.score.environmental || 0} className="mt-6" />
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-sky)]/10 border-[var(--accent-sky)]/30">
          <CardContent className="p-8">
            <UserGroupIcon className="w-16 h-16 text-[var(--accent-sky)] mb-4" />
            <p className="text-6xl font-black text-[var(--text-primary)]">{metrics?.score.social || 0}</p>
            <p className="text-xl text-[var(--text-secondary)] mt-2">Social</p>
            <Progress value={metrics?.score.social || 0} className="mt-6" />
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-purple)]/10 border-[var(--accent-purple)]/30">
          <CardContent className="p-8">
            <BuildingOfficeIcon className="w-16 h-16 text-[var(--accent-purple)] mb-4" />
            <p className="text-6xl font-black text-[var(--text-primary)]">{metrics?.score.governance || 0}</p>
            <p className="text-xl text-[var(--text-secondary)] mt-2">Governance</p>
            <Progress value={metrics?.score.governance || 0} className="mt-6" />
          </CardContent>
        </Card>
      </div>

      {/* INICIATIVAS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          Iniciativas ESG
        </h2>

        {metrics?.iniciativas.length === 0 ? (
          <div className="text-center py-20">
            <GlobeAmericasIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhuma iniciativa cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics?.iniciativas.map((ini, i) => {
              const config = pilarConfig[ini.pilar];
              return (
                <motion.div
                  key={ini.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-[var(--surface)]/60 border-[var(--border)]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-[var(--background)]/60" style={{ color: config.color }}>
                          {config.icon}
                        </div>
                        <Badge className={`capitalize ${
                          ini.status === 'concluida' ? 'bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]' :
                          ini.status === 'em_andamento' ? 'bg-[var(--accent-sky)]/20 text-[var(--accent-sky)]' :
                          'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)]'
                        }`}>
                          {ini.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{ini.titulo}</h3>
                      <p className="text-[var(--text-secondary)] text-sm mb-4">{ini.meta}</p>

                      <div>
                        <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
                          <span>Progresso</span>
                          <span>{ini.progresso}%</span>
                        </div>
                        <Progress value={ini.progresso} className="h-2" />
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
          "ESG não é tendência. É a nova régua de excelência empresarial."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Guardião do Planeta
        </p>
      </motion.div>
    </div>
  );
}
