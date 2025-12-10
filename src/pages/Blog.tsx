// src/pages/Blog.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Blog Alienígena 1000/1000
// Cada artigo é uma obra-prima. O conhecimento conquista impérios.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
import {
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  TagIcon,
  SparklesIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BlogPost {
  id: string;
  titulo: string;
  resumo: string;
  autor: string;
  categoria: string;
  tags: string[];
  visualizacoes: number;
  curtidas: number;
  comentarios: number;
  tempo_leitura: number;
  data_publicacao: string;
  status: 'publicado' | 'rascunho' | 'agendado';
  imagem_capa: string;
}

interface BlogMetrics {
  totalPosts: number;
  totalVisualizacoes: number;
  totalCurtidas: number;
  mediaTempoLeitura: number;
  posts: BlogPost[];
}

export default function BlogPage() {
  const [metrics, setMetrics] = useState<BlogMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'publicado' | 'rascunho'>('todos');

  useEffect(() => {
    async function loadSupremeBlog() {
      try {
        const { data: posts } = await supabase
          .from('blog_posts')
          .select('*')
          .order('data_publicacao', { ascending: false });

        if (posts) {
          const publicados = posts.filter(p => p.status === 'publicado');
          setMetrics({
            totalPosts: posts.length,
            totalVisualizacoes: publicados.reduce((s, p) => s + (p.visualizacoes || 0), 0),
            totalCurtidas: publicados.reduce((s, p) => s + (p.curtidas || 0), 0),
            mediaTempoLeitura: publicados.length > 0
              ? publicados.reduce((s, p) => s + (p.tempo_leitura || 5), 0) / publicados.length
              : 0,
            posts: posts.map(p => ({
              id: p.id,
              titulo: p.titulo || 'Sem título',
              resumo: p.resumo || '',
              autor: p.autor || 'Anônimo',
              categoria: p.categoria || 'Geral',
              tags: p.tags || [],
              visualizacoes: p.visualizacoes || 0,
              curtidas: p.curtidas || 0,
              comentarios: p.comentarios || 0,
              tempo_leitura: p.tempo_leitura || 5,
              data_publicacao: p.data_publicacao || '',
              status: p.status || 'rascunho',
              imagem_capa: p.imagem_capa || ''
            }))
          });
        } else {
          setMetrics({
            totalPosts: 0,
            totalVisualizacoes: 0,
            totalCurtidas: 0,
            mediaTempoLeitura: 0,
            posts: []
          });
        }
      } catch (err) {
        console.error('Erro no Blog Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeBlog();
  }, []);

  if (loading) {
    return (
      <LayoutSupremo title="Blog Supremo">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-amber-500 rounded-full"
          />
          <p className="absolute text-4xl text-amber-400 font-light">Carregando artigos...</p>
        </div>
      </LayoutSupremo>
    );
  }

  const postsFiltrados = metrics?.posts.filter(p =>
    filtro === 'todos' ? true : p.status === filtro
  ) || [];

  return (
    <LayoutSupremo title="Blog Supremo">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            BLOG SUPREMO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada artigo é uma obra-prima que conquista mentes
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-amber-900/60 to-orange-900/60 rounded-2xl p-6 border border-amber-500/30">
            <BookOpenIcon className="w-12 h-12 text-amber-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.totalPosts || 0}</p>
            <p className="text-gray-400">Total de Posts</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 rounded-2xl p-6 border border-blue-500/30">
            <EyeIcon className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-4xl font-black text-white">{(metrics?.totalVisualizacoes || 0).toLocaleString()}</p>
            <p className="text-gray-400">Visualizações</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-pink-900/60 to-rose-900/60 rounded-2xl p-6 border border-pink-500/30">
            <HeartIcon className="w-12 h-12 text-pink-400 mb-3" />
            <p className="text-4xl font-black text-white">{(metrics?.totalCurtidas || 0).toLocaleString()}</p>
            <p className="text-gray-400">Curtidas</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 rounded-2xl p-6 border border-purple-500/30">
            <ClockIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-4xl font-black text-white">{(metrics?.mediaTempoLeitura || 0).toFixed(0)} min</p>
            <p className="text-gray-400">Tempo Médio</p>
          </motion.div>
        </div>

        {/* FILTROS */}
        <div className="flex justify-center gap-4 mb-12">
          {['todos', 'publicado', 'rascunho'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                filtro === f
                  ? 'bg-amber-500 text-black'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* LISTA DE POSTS */}
        <div className="max-w-6xl mx-auto">
          {postsFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <DocumentTextIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum post encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {postsFiltrados.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all"
                >
                  {/* IMAGEM DE CAPA */}
                  <div className="h-48 bg-gradient-to-br from-amber-600/30 to-orange-600/30 flex items-center justify-center">
                    <BookOpenIcon className="w-20 h-20 text-amber-400/50" />
                  </div>

                  <div className="p-6">
                    {/* CATEGORIA E STATUS */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                        {post.categoria}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        post.status === 'publicado' ? 'bg-green-500/20 text-green-400' :
                        post.status === 'agendado' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {post.status}
                      </span>
                    </div>

                    {/* TÍTULO E RESUMO */}
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{post.titulo}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.resumo}</p>

                    {/* AUTOR E DATA */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Por {post.autor}</span>
                      <span>{post.data_publicacao ? format(new Date(post.data_publicacao), "dd MMM", { locale: ptBR }) : '-'}</span>
                    </div>

                    {/* MÉTRICAS */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-gray-400">
                          <EyeIcon className="w-5 h-5" />
                          <span>{post.visualizacoes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <HeartIcon className="w-5 h-5" />
                          <span>{post.curtidas}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <ChatBubbleLeftIcon className="w-5 h-5" />
                          <span>{post.comentarios}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <ClockIcon className="w-5 h-5" />
                        <span>{post.tempo_leitura} min</span>
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
            "Quem controla o conteúdo, controla a narrativa. Quem controla a narrativa, controla o mercado."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Editor-Chefe Alienígena
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
