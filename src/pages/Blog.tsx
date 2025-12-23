// src/pages/Blog.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Blog Alienígena 1000/1000
// Cada artigo é uma obra-prima. O conhecimento conquista impérios.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-warning)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-warning)] font-light">Carregando artigos...</p>
      </div>
    );
  }

  const postsFiltrados = metrics?.posts.filter(p =>
    filtro === 'todos' ? true : p.status === filtro
  ) || [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-warning)] via-[var(--accent-alert)] to-[var(--accent-1)] bg-clip-text text-transparent">
            BLOG SUPREMO
          </h1>
          <p className="text-3xl text-[var(--text-secondary)] mt-6">
            Cada artigo é uma obra-prima que conquista mentes
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)]">
            <BookOpenIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalPosts || 0}</p>
            <p className="text-[var(--text-secondary)]">Total de Posts</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)]">
            <EyeIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalVisualizacoes || 0).toLocaleString()}</p>
            <p className="text-[var(--text-secondary)]">Visualizações</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)]">
            <HeartIcon className="w-12 h-12 text-[var(--accent-pink)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalCurtidas || 0).toLocaleString()}</p>
            <p className="text-[var(--text-secondary)]">Curtidas</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)]">
            <ClockIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.mediaTempoLeitura || 0).toFixed(0)} min</p>
            <p className="text-[var(--text-secondary)]">Tempo Médio</p>
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
                  ? 'bg-[var(--accent-warning)] text-[var(--background)]'
                  : 'bg-[var(--surface)]/60 text-[var(--text-secondary)] hover:bg-[var(--surface)]'
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
              <DocumentTextIcon className="w-32 h-32 text-[var(--text)]/30 mx-auto mb-8" />
              <p className="text-3xl text-[var(--text)]/50">Nenhum post encontrado</p>
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
                  className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent-warning)]/50 transition-all"
                >
                  {/* IMAGEM DE CAPA */}
                  <div className="h-48 bg-[var(--accent-warning)]/10 flex items-center justify-center">
                    <BookOpenIcon className="w-20 h-20 text-[var(--accent-warning)]/50" />
                  </div>

                  <div className="p-6">
                    {/* CATEGORIA E STATUS */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-[var(--accent-warning)]/20 text-[var(--accent-warning)] rounded-full text-sm">
                        {post.categoria}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        post.status === 'publicado' ? 'bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]' :
                        post.status === 'agendado' ? 'bg-[var(--accent-sky)]/20 text-[var(--accent-sky)]' :
                        'bg-[var(--text)]/10 text-[var(--text-secondary)]'
                      }`}>
                        {post.status}
                      </span>
                    </div>

                    {/* TÍTULO E RESUMO */}
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 line-clamp-2">{post.titulo}</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">{post.resumo}</p>

                    {/* AUTOR E DATA */}
                    <div className="flex items-center justify-between text-sm text-[var(--text)]/50 mb-4">
                      <span>Por {post.autor}</span>
                      <span>{post.data_publicacao ? format(new Date(post.data_publicacao), "dd MMM", { locale: ptBR }) : '-'}</span>
                    </div>

                    {/* MÉTRICAS */}
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <EyeIcon className="w-5 h-5" />
                          <span>{post.visualizacoes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <HeartIcon className="w-5 h-5" />
                          <span>{post.curtidas}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <ChatBubbleLeftIcon className="w-5 h-5" />
                          <span>{post.comentarios}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--text-secondary)]">
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
          <SparklesIcon className="w-32 h-32 text-[var(--accent-warning)] mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-[var(--accent-warning)] max-w-4xl mx-auto">
            "Quem controla o conteúdo, controla a narrativa. Quem controla a narrativa, controla o mercado."
          </p>
          <p className="text-3xl text-[var(--text-secondary)] mt-8">
            — Citizen Supremo X.1, seu Editor-Chefe Alienígena
          </p>
        </motion.div>
      </div>
  );
}
