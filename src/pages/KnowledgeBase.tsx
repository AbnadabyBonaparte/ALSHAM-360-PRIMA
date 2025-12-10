// src/pages/KnowledgeBase.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Base de Conhecimento Alienígena 1000/1000
// Todo o conhecimento em um só lugar. Autoatendimento que elimina tickets.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
import {
  BookOpenIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  HandThumbUpIcon,
  FolderIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Article {
  id: string;
  titulo: string;
  resumo: string;
  categoria: string;
  visualizacoes: number;
  votos_positivos: number;
  votos_negativos: number;
  atualizado_em: string;
}

interface KBMetrics {
  totalArtigos: number;
  totalCategorias: number;
  totalVisualizacoes: number;
  satisfacao: number;
  artigos: Article[];
  categorias: { nome: string; count: number }[];
}

export default function KnowledgeBasePage() {
  const [metrics, setMetrics] = useState<KBMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');

  useEffect(() => {
    async function loadSupremeKB() {
      try {
        const { data: artigos } = await supabase
          .from('knowledge_base')
          .select('*')
          .order('visualizacoes', { ascending: false });

        if (artigos) {
          const categorias = [...new Set(artigos.map(a => a.categoria))];
          const categoriasCount = categorias.map(cat => ({
            nome: cat,
            count: artigos.filter(a => a.categoria === cat).length
          }));

          const totalViews = artigos.reduce((s, a) => s + (a.visualizacoes || 0), 0);
          const totalPositivos = artigos.reduce((s, a) => s + (a.votos_positivos || 0), 0);
          const totalVotos = totalPositivos + artigos.reduce((s, a) => s + (a.votos_negativos || 0), 0);

          setMetrics({
            totalArtigos: artigos.length,
            totalCategorias: categorias.length,
            totalVisualizacoes: totalViews,
            satisfacao: totalVotos > 0 ? (totalPositivos / totalVotos) * 100 : 100,
            artigos: artigos.map(a => ({
              id: a.id,
              titulo: a.titulo || 'Artigo',
              resumo: a.resumo || '',
              categoria: a.categoria || 'Geral',
              visualizacoes: a.visualizacoes || 0,
              votos_positivos: a.votos_positivos || 0,
              votos_negativos: a.votos_negativos || 0,
              atualizado_em: a.atualizado_em || ''
            })),
            categorias: categoriasCount
          });
        } else {
          setMetrics({
            totalArtigos: 0,
            totalCategorias: 0,
            totalVisualizacoes: 0,
            satisfacao: 0,
            artigos: [],
            categorias: []
          });
        }
      } catch (err) {
        console.error('Erro na Knowledge Base Suprema:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeKB();
  }, []);

  if (loading) {
    return (
      <LayoutSupremo title="Base de Conhecimento">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-amber-500 rounded-full"
          />
          <p className="absolute text-4xl text-amber-400 font-light">Carregando conhecimento...</p>
        </div>
      </LayoutSupremo>
    );
  }

  const artigosFiltrados = metrics?.artigos.filter(a => {
    const matchBusca = busca === '' || a.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaAtiva === 'todas' || a.categoria === categoriaAtiva;
    return matchBusca && matchCategoria;
  }) || [];

  return (
    <LayoutSupremo title="Base de Conhecimento">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-7xl font-black bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
            BASE DE CONHECIMENTO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Todo o conhecimento em um só lugar
          </p>
        </motion.div>

        {/* BUSCA */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar artigos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-amber-900/60 to-yellow-900/60 rounded-2xl p-6 border border-amber-500/30">
            <BookOpenIcon className="w-12 h-12 text-amber-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.totalArtigos || 0}</p>
            <p className="text-gray-400">Artigos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <FolderIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.totalCategorias || 0}</p>
            <p className="text-gray-400">Categorias</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 rounded-2xl p-6 border border-blue-500/30">
            <EyeIcon className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-4xl font-black text-white">{(metrics?.totalVisualizacoes || 0).toLocaleString()}</p>
            <p className="text-gray-400">Visualizações</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <HandThumbUpIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-white">{(metrics?.satisfacao || 0).toFixed(0)}%</p>
            <p className="text-gray-400">Satisfação</p>
          </motion.div>
        </div>

        {/* CATEGORIAS */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          <button
            onClick={() => setCategoriaAtiva('todas')}
            className={`px-5 py-2 rounded-xl font-medium transition-all ${
              categoriaAtiva === 'todas'
                ? 'bg-amber-500 text-black'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            Todas ({metrics?.totalArtigos || 0})
          </button>
          {metrics?.categorias.map(cat => (
            <button
              key={cat.nome}
              onClick={() => setCategoriaAtiva(cat.nome)}
              className={`px-5 py-2 rounded-xl font-medium transition-all ${
                categoriaAtiva === cat.nome
                  ? 'bg-amber-500 text-black'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {cat.nome} ({cat.count})
            </button>
          ))}
        </div>

        {/* LISTA DE ARTIGOS */}
        <div className="max-w-4xl mx-auto">
          {artigosFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <DocumentTextIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum artigo encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {artigosFiltrados.map((artigo, i) => (
                <motion.div
                  key={artigo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 10 }}
                  className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-amber-500/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <LightBulbIcon className="w-6 h-6 text-amber-400" />
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                          {artigo.categoria}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{artigo.titulo}</h3>
                      <p className="text-gray-400 line-clamp-2">{artigo.resumo}</p>
                    </div>

                    <div className="text-right ml-6">
                      <div className="flex items-center gap-4 text-gray-400 text-sm">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{artigo.visualizacoes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-400">
                          <HandThumbUpIcon className="w-4 h-4" />
                          <span>{artigo.votos_positivos}</span>
                        </div>
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
          className="text-center py-24 mt-16"
        >
          <SparklesIcon className="w-32 h-32 text-amber-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-amber-300 max-w-4xl mx-auto">
            "Conhecimento documentado é suporte escalado. Cada artigo lido é um ticket evitado."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Bibliotecário Digital
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
