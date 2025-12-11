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
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-blue-500 rounded-full"
        />
        <p className="absolute text-4xl text-blue-400 font-light">Analisando rankings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            SEO SUPREMO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            O Google nos ama. Cada posição conquistada é território eterno.
          </p>
        </motion.div>

        {/* KPIs PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-3xl p-8 border border-yellow-500/30 backdrop-blur-xl text-center"
          >
            <div className="text-2xl md:text-3xl lg:text-4xl mb-4">🥇</div>
            <p className="text-6xl font-black text-[var(--text-primary)]">{metrics?.palavrasTop3 || 0}</p>
            <p className="text-xl text-gray-400">Palavras no Top 3</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 rounded-3xl p-8 border border-blue-500/30 backdrop-blur-xl text-center"
          >
            <div className="text-2xl md:text-3xl lg:text-4xl mb-4">🏆</div>
            <p className="text-6xl font-black text-[var(--text-primary)]">{metrics?.palavrasTop10 || 0}</p>
            <p className="text-xl text-gray-400">Palavras no Top 10</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-3xl p-8 border border-green-500/30 backdrop-blur-xl text-center"
          >
            <ArrowTrendingUpIcon className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.trafegoOrganico || 0).toLocaleString()}</p>
            <p className="text-xl text-gray-400">Tráfego Orgânico/mês</p>
          </motion.div>
        </div>

        {/* MÉTRICAS DE AUTORIDADE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl p-8 border border-purple-500/20 text-center">
            <BoltIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{metrics?.dominioAuthority || 0}</p>
            <p className="text-gray-400">Domain Authority</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-2xl p-8 border border-cyan-500/20 text-center">
            <LinkIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.backlinks || 0).toLocaleString()}</p>
            <p className="text-gray-400">Backlinks</p>
          </div>
          <div className="bg-gradient-to-br from-teal-900/40 to-emerald-900/40 rounded-2xl p-8 border border-teal-500/20 text-center">
            <DocumentTextIcon className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.paginasIndexadas || 0).toLocaleString()}</p>
            <p className="text-gray-400">Páginas Indexadas</p>
          </div>
        </div>

        {/* KEYWORDS RANKING */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Ranking de Keywords
          </h2>

          {metrics?.keywords.length === 0 ? (
            <div className="text-center py-20">
              <MagnifyingGlassIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhuma keyword rastreada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics?.keywords.slice(0, 20).map((kw, i) => (
                <motion.div
                  key={kw.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl p-6 border backdrop-blur-xl ${
                    kw.posicao <= 3 ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/30' :
                    kw.posicao <= 10 ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500/30' :
                    'bg-white/5 border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl ${
                        kw.posicao <= 3 ? 'bg-yellow-500 text-black' :
                        kw.posicao <= 10 ? 'bg-blue-500 text-[var(--text-primary)]' :
                        'bg-gray-700 text-[var(--text-primary)]'
                      }`}>
                        #{kw.posicao}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">{kw.palavra}</h3>
                        <p className="text-gray-400 text-sm">{kw.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-right">
                      <div>
                        <p className="text-xl font-bold text-[var(--text-primary)]">{kw.volume.toLocaleString()}</p>
                        <p className="text-gray-500 text-sm">Volume</p>
                      </div>
                      <div>
                        <p className={`text-xl font-bold ${
                          kw.dificuldade <= 30 ? 'text-green-400' :
                          kw.dificuldade <= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{kw.dificuldade}</p>
                        <p className="text-gray-500 text-sm">KD</p>
                      </div>
                      <div className={`flex items-center gap-1 ${
                        kw.variacao > 0 ? 'text-green-400' :
                        kw.variacao < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        <ArrowTrendingUpIcon className={`w-6 h-6 ${kw.variacao < 0 ? 'rotate-180' : ''}`} />
                        <span className="text-xl font-bold">{Math.abs(kw.variacao)}</span>
                      </div>
                    </div>
                  </div>
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
          <SparklesIcon className="w-32 h-32 text-blue-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-blue-300 max-w-4xl mx-auto">
            "Primeira página do Google não é sorte. É arquitetura de conteúdo perfeita."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Arquiteto de SEO
          </p>
        </motion.div>
      </div>
  );
}
