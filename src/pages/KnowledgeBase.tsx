// src/pages/KnowledgeBase.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Base de Conhecimento Alienígena 1000/1000
// Todo o conhecimento em um só lugar. Autoatendimento que elimina tickets.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

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
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
          const categorias = [...new Set(artigos.map((a: any) => a.categoria))];
          const categoriasCount = categorias.map(cat => ({
            nome: cat,
            count: artigos.filter((a: any) => a.categoria === cat).length
          }));

          const totalViews = artigos.reduce((s: number, a: any) => s + (a.visualizacoes || 0), 0);
          const totalPositivos = artigos.reduce((s: number, a: any) => s + (a.votos_positivos || 0), 0);
          const totalVotos = totalPositivos + artigos.reduce((s: number, a: any) => s + (a.votos_negativos || 0), 0);

          setMetrics({
            totalArtigos: artigos.length,
            totalCategorias: categorias.length,
            totalVisualizacoes: totalViews,
            satisfacao: totalVotos > 0 ? (totalPositivos / totalVotos) * 100 : 100,
            artigos: artigos.map((a: any) => ({
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
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-warning)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-warning)] font-light">Carregando conhecimento...</p>
      </div>
    );
  }

  const artigosFiltrados = metrics?.artigos.filter(a => {
    const matchBusca = busca === '' || a.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaAtiva === 'todas' || a.categoria === categoriaAtiva;
    return matchBusca && matchCategoria;
  }) || [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[var(--accent-warning)] via-[var(--accent-1)] to-[var(--accent-warning)] bg-clip-text text-transparent">
          BASE DE CONHECIMENTO
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Todo o conhecimento em um só lugar
        </p>
      </motion.div>

      {/* BUSCA */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <MagnifyingGlassIcon className="w-6 h-6 text-[var(--text-secondary)] absolute left-4 top-1/2 transform -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar artigos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-[var(--surface)]/60 border-[var(--border)] rounded-2xl py-4 pl-14 pr-6 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-warning)]"
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <BookOpenIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalArtigos || 0}</p>
            <p className="text-[var(--text-secondary)]">Artigos</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <FolderIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalCategorias || 0}</p>
            <p className="text-[var(--text-secondary)]">Categorias</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <EyeIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalVisualizacoes || 0).toLocaleString()}</p>
            <p className="text-[var(--text-secondary)]">Visualizações</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <HandThumbUpIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.satisfacao || 0).toFixed(0)}%</p>
            <p className="text-[var(--text-secondary)]">Satisfação</p>
          </CardContent>
        </Card>
      </div>

      {/* CATEGORIAS */}
      <div className="flex justify-center gap-3 mb-12 flex-wrap">
        <Button
          variant={categoriaAtiva === 'todas' ? 'default' : 'outline'}
          onClick={() => setCategoriaAtiva('todas')}
          className={`px-5 py-2 rounded-xl font-medium ${
            categoriaAtiva === 'todas'
              ? 'bg-[var(--accent-warning)] text-[var(--background)]'
              : 'bg-[var(--surface)]/60 text-[var(--text-secondary)] hover:bg-[var(--surface)] border-[var(--border)]'
          }`}
        >
          Todas ({metrics?.totalArtigos || 0})
        </Button>
        {metrics?.categorias.map(cat => (
          <Button
            key={cat.nome}
            variant={categoriaAtiva === cat.nome ? 'default' : 'outline'}
            onClick={() => setCategoriaAtiva(cat.nome)}
            className={`px-5 py-2 rounded-xl font-medium ${
              categoriaAtiva === cat.nome
                ? 'bg-[var(--accent-warning)] text-[var(--background)]'
                : 'bg-[var(--surface)]/60 text-[var(--text-secondary)] hover:bg-[var(--surface)] border-[var(--border)]'
            }`}
          >
            {cat.nome} ({cat.count})
          </Button>
        ))}
      </div>

      {/* LISTA DE ARTIGOS */}
      <div className="max-w-4xl mx-auto">
        {artigosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <DocumentTextIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhum artigo encontrado</p>
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
                className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--accent-warning)]/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <LightBulbIcon className="w-6 h-6 text-[var(--accent-warning)]" />
                      <Badge className="bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]">
                        {artigo.categoria}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{artigo.titulo}</h3>
                    <p className="text-[var(--text-secondary)] line-clamp-2">{artigo.resumo}</p>
                  </div>

                  <div className="text-right ml-6">
                    <div className="flex items-center gap-4 text-[var(--text-secondary)] text-sm">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="w-4 h-4" />
                        <span>{artigo.visualizacoes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--accent-emerald)]">
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
        <SparklesIcon className="w-32 h-32 text-[var(--accent-warning)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-warning)] max-w-4xl mx-auto">
          "Conhecimento documentado é suporte escalado. Cada artigo lido é um ticket evitado."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Bibliotecário Digital
        </p>
      </motion.div>
    </div>
  );
}
