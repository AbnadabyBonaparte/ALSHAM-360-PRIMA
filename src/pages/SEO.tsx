// src/pages/SEO.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — SEO Alienígena 1000/1000
// O Google nos ama. Cada posição conquistada é território eterno.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  LinkIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Keyword {
  id: string;
  palavra: string;
  posicao: number;
  volume: number;
  dificuldade: number;
  url: string;
  variacao: number;
}

interface SEOMetrics {
  palavrasTop10: number;
  palavrasTop3: number;
  trafegoOrganico: number;
  backlinks: number;
  dominioAuthority: number;
  paginasIndexadas: number;
  keywords: Keyword[];
}

export default function SEOPage() {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeSEO() {
      try {
        const { data: keywords } = await supabase
          .from('seo_keywords')
          .select('*')
          .order('posicao', { ascending: true });

        const { data: siteMetrics } = await supabase
          .from('seo_metrics')
          .select('*')
          .order('id', { ascending: false })
          .limit(1)
          .single();

        if (keywords) {
          const top10 = keywords.filter(k => k.posicao <= 10).length;
          const top3 = keywords.filter(k => k.posicao <= 3).length;

          setMetrics({
            palavrasTop10: top10,
            palavrasTop3: top3,
            trafegoOrganico: siteMetrics?.trafego_organico || 0,
            backlinks: siteMetrics?.backlinks || 0,
            dominioAuthority: siteMetrics?.domain_authority || 0,
            paginasIndexadas: siteMetrics?.paginas_indexadas || 0,
            keywords: keywords.map(k => ({
              id: k.id,
              palavra: k.palavra || k.keyword || '',
              posicao: k.posicao || 0,
              volume: k.volume || 0,
              dificuldade: k.dificuldade || 0,
              url: k.url || '',
              variacao: k.variacao || 0
            }))
          });
        } else {
          setMetrics({
            palavrasTop10: 0,
            palavrasTop3: 0,
            trafegoOrganico: 0,
            backlinks: 0,
            dominioAuthority: 0,
            paginasIndexadas: 0,
            keywords: []
          });
        }
      } catch (err) {
        console.error('Erro no SEO Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeSEO();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-2)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-2)] font-light">Analisando rankings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-2)] via-[var(--accent-3)] to-[var(--accent-1)] bg-clip-text text-transparent">
          SEO SUPREMO
        </h1>
        <p className="text-3xl text-[var(--text-muted)] mt-6">
          O Google nos ama. Cada posição conquistada é território eterno.
        </p>
      </motion.div>

      {/* KPIs PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="bg-[var(--surface)]/60 border-[var(--accent-warm)]/30 backdrop-blur-xl text-center">
            <CardContent className="p-8">
              <div className="text-2xl md:text-3xl lg:text-4xl mb-4">🥇</div>
              <p className="text-6xl font-black text-[var(--text)]">{metrics?.palavrasTop3 || 0}</p>
              <p className="text-xl text-[var(--text-muted)]">Palavras no Top 3</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="bg-[var(--surface)]/60 border-[var(--accent-2)]/30 backdrop-blur-xl text-center">
            <CardContent className="p-8">
              <div className="text-2xl md:text-3xl lg:text-4xl mb-4">🏆</div>
              <p className="text-6xl font-black text-[var(--text)]">{metrics?.palavrasTop10 || 0}</p>
              <p className="text-xl text-[var(--text-muted)]">Palavras no Top 10</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="bg-[var(--surface)]/60 border-[var(--accent-1)]/30 backdrop-blur-xl text-center">
            <CardContent className="p-8">
              <ArrowTrendingUpIcon className="w-20 h-20 text-[var(--accent-1)] mx-auto mb-4" />
              <p className="text-5xl font-black text-[var(--text)]">{(metrics?.trafegoOrganico || 0).toLocaleString()}</p>
              <p className="text-xl text-[var(--text-muted)]">Tráfego Orgânico/mês</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* MÉTRICAS DE AUTORIDADE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
        <Card className="bg-[var(--surface)]/40 border-[var(--accent-3)]/20 text-center">
          <CardContent className="p-8">
            <BoltIcon className="w-16 h-16 text-[var(--accent-3)] mx-auto mb-4" />
            <p className="text-5xl font-black text-[var(--text)]">{metrics?.dominioAuthority || 0}</p>
            <p className="text-[var(--text-muted)]">Domain Authority</p>
          </CardContent>
        </Card>
        <Card className="bg-[var(--surface)]/40 border-[var(--accent-2)]/20 text-center">
          <CardContent className="p-8">
            <LinkIcon className="w-16 h-16 text-[var(--accent-2)] mx-auto mb-4" />
            <p className="text-5xl font-black text-[var(--text)]">{(metrics?.backlinks || 0).toLocaleString()}</p>
            <p className="text-[var(--text-muted)]">Backlinks</p>
          </CardContent>
        </Card>
        <Card className="bg-[var(--surface)]/40 border-[var(--accent-1)]/20 text-center">
          <CardContent className="p-8">
            <DocumentTextIcon className="w-16 h-16 text-[var(--accent-1)] mx-auto mb-4" />
            <p className="text-5xl font-black text-[var(--text)]">{(metrics?.paginasIndexadas || 0).toLocaleString()}</p>
            <p className="text-[var(--text-muted)]">Páginas Indexadas</p>
          </CardContent>
        </Card>
      </div>

      {/* KEYWORDS RANKING */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-2)] to-[var(--accent-3)] bg-clip-text text-transparent">
          Ranking de Keywords
        </h2>

        {metrics?.keywords.length === 0 ? (
          <div className="text-center py-20">
            <MagnifyingGlassIcon className="w-32 h-32 text-[var(--text-muted)] mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-muted)]">Nenhuma keyword rastreada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics?.keywords.slice(0, 20).map((kw, i) => (
              <motion.div
                key={kw.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border backdrop-blur-xl ${kw.posicao <= 3 ? 'bg-[var(--surface)]/60 border-[var(--accent-warm)]/30' :
                    kw.posicao <= 10 ? 'bg-[var(--surface)]/60 border-[var(--accent-2)]/30' :
                      'bg-[var(--surface)]/30 border-[var(--border)]'
                  }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <Badge className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl ${kw.posicao <= 3 ? 'bg-[var(--accent-warm)] text-[var(--bg)]' :
                            kw.posicao <= 10 ? 'bg-[var(--accent-2)] text-[var(--text)]' :
                              'bg-[var(--surface-strong)] text-[var(--text)]'
                          }`}>
                          #{kw.posicao}
                        </Badge>
                        <div>
                          <h3 className="text-2xl font-bold text-[var(--text)]">{kw.palavra}</h3>
                          <p className="text-[var(--text-muted)] text-sm">{kw.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8 text-right">
                        <div>
                          <p className="text-xl font-bold text-[var(--text)]">{kw.volume.toLocaleString()}</p>
                          <p className="text-[var(--text-muted)] text-sm">Volume</p>
                        </div>
                        <div>
                          <p className={`text-xl font-bold ${kw.dificuldade <= 30 ? 'text-[var(--accent-1)]' :
                              kw.dificuldade <= 60 ? 'text-[var(--accent-warm)]' : 'text-[var(--accent-alert)]'
                            }`}>{kw.dificuldade}</p>
                          <p className="text-[var(--text-muted)] text-sm">KD</p>
                        </div>
                        <div className={`flex items-center gap-1 ${kw.variacao > 0 ? 'text-[var(--accent-1)]' :
                            kw.variacao < 0 ? 'text-[var(--accent-alert)]' : 'text-[var(--text-muted)]'
                          }`}>
                          <ArrowTrendingUpIcon className={`w-6 h-6 ${kw.variacao < 0 ? 'rotate-180' : ''}`} />
                          <span className="text-xl font-bold">{Math.abs(kw.variacao)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MENSAGEM FINAL DA IA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center py-24 mt-20"
      >
        <SparklesIcon className="w-32 h-32 text-[var(--accent-2)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-2)] max-w-4xl mx-auto">
          "Primeira página do Google não é sorte. É arquitetura de conteúdo perfeita."
        </p>
        <p className="text-3xl text-[var(--text-muted)] mt-8">
          — Citizen Supremo X.1, seu Arquiteto de SEO
        </p>
      </motion.div>
    </div>
  );
}
