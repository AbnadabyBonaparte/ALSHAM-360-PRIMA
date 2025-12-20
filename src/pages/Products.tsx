// src/pages/Products.tsx
// ALSHAM 360° PRIMA — Produtos Supremos (migrado para shadcn/ui)
// Cada produto é uma obra-prima de valor. O catálogo que vende sozinho.

import {
  CubeIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  StarIcon,
  ShoppingBagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  preco_custo: number;
  estoque: number;
  vendidos: number;
  status: 'ativo' | 'inativo' | 'esgotado';
  imagem: string;
  margem: number;
}

interface ProductMetrics {
  totalProdutos: number;
  valorEstoque: number;
  margemMedia: number;
  totalVendidos: number;
  produtos: Product[];
}

export default function ProductsPage() {
  const [metrics, setMetrics] = useState<ProductMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState<string>('todas');

  useEffect(() => {
    async function loadSupremeProducts() {
      try {
        const { data: produtos } = await supabase
          .from('produtos')
          .select('*')
          .order('vendidos', { ascending: false });

        if (produtos) {
          const valorEstoque = produtos.reduce((s, p) => s + ((p.preco || 0) * (p.estoque || 0)), 0);
          const totalVendidos = produtos.reduce((s, p) => s + (p.vendidos || 0), 0);

          setMetrics({
            totalProdutos: produtos.length,
            valorEstoque,
            margemMedia: produtos.length > 0
              ? produtos.reduce((s, p) => {
                  const margem = p.preco_custo > 0 ? ((p.preco - p.preco_custo) / p.preco_custo) * 100 : 0;
                  return s + margem;
                }, 0) / produtos.length
              : 0,
            totalVendidos,
            produtos: produtos.map(p => ({
              id: p.id,
              nome: p.nome || 'Produto',
              descricao: p.descricao || '',
              categoria: p.categoria || 'Geral',
              preco: p.preco || 0,
              preco_custo: p.preco_custo || 0,
              estoque: p.estoque || 0,
              vendidos: p.vendidos || 0,
              status: p.estoque === 0 ? 'esgotado' : p.status || 'ativo',
              imagem: p.imagem || '',
              margem: p.preco_custo > 0 ? ((p.preco - p.preco_custo) / p.preco_custo) * 100 : 0
            }))
          });
        } else {
          setMetrics({
            totalProdutos: 0,
            valorEstoque: 0,
            margemMedia: 0,
            totalVendidos: 0,
            produtos: []
          });
        }
      } catch (err) {
        console.error('Erro nos Produtos Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-warning)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-warning)] font-light">Carregando catálogo...</p>
      </div>
    );
  }

  const categorias = ['todas', ...new Set(metrics?.produtos.map(p => p.categoria) || [])];
  const produtosFiltrados = categoria === 'todas'
    ? metrics?.produtos || []
    : metrics?.produtos.filter(p => p.categoria === categoria) || [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-warning)] via-[var(--accent-warning)] to-[var(--accent-warning)] bg-clip-text text-transparent">
            PRODUTOS SUPREMOS
          </h1>
          <p className="text-3xl text-[var(--text-secondary)] mt-6">
            Cada produto é uma obra-prima de valor
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-[var(--accent-warning)]/60 to-[var(--accent-warning)]/60 rounded-2xl border border-[var(--accent-warning)]/30 hover:scale-105 transition-all">
            <CardContent className="p-6">
              <CubeIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
              <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalProdutos || 0}</p>
              <p className="text-[var(--text-secondary)]">Total Produtos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[var(--accent-warning)]/60 to-[var(--accent-warning)]/60 rounded-2xl border border-[var(--accent-warning)]/30 hover:scale-105 transition-all">
            <CardContent className="p-6">
              <ArchiveBoxIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
              <p className="text-3xl font-black text-[var(--text-primary)]">R$ {((metrics?.valorEstoque || 0) / 1000).toFixed(0)}k</p>
              <p className="text-[var(--text-secondary)]">Valor Estoque</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[var(--accent-emerald)]/60 to-[var(--accent-emerald)]/60 rounded-2xl border border-[var(--accent-emerald)]/30 hover:scale-105 transition-all">
            <CardContent className="p-6">
              <ChartBarIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
              <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.margemMedia || 0).toFixed(0)}%</p>
              <p className="text-[var(--text-secondary)]">Margem Média</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[var(--accent-purple)]/60 to-[var(--accent-pink)]/60 rounded-2xl border border-[var(--accent-purple)]/30 hover:scale-105 transition-all">
            <CardContent className="p-6">
              <ShoppingBagIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
              <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalVendidos || 0).toLocaleString()}</p>
              <p className="text-[var(--text-secondary)]">Unidades Vendidas</p>
            </CardContent>
          </Card>
        </div>

        {/* FILTROS POR CATEGORIA */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {categorias.map(cat => (
            <Button
              key={cat}
              onClick={() => setCategoria(cat)}
              variant={categoria === cat ? 'default' : 'ghost'}
              className={`px-5 py-2 rounded-xl font-medium capitalize ${
                categoria === cat
                  ? 'bg-[var(--accent-warning)] text-[var(--text-primary)]'
                  : 'bg-[var(--surface)]/10 text-[var(--text-secondary)] hover:bg-[var(--surface)]/20'
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* GRID DE PRODUTOS */}
        <div className="max-w-7xl mx-auto">
          {produtosFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <CubeIcon className="w-32 h-32 text-[var(--text-secondary)] mx-auto mb-8" />
              <p className="text-3xl text-[var(--text-secondary)]">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {produtosFiltrados.map((produto, i) => (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className={`rounded-3xl overflow-hidden backdrop-blur-xl ${
                    produto.status === 'esgotado'
                      ? 'bg-gradient-to-br from-[var(--surface)]/60 to-[var(--surface)]/60 border-[var(--border)]/30 opacity-70'
                      : 'bg-gradient-to-br from-[var(--surface)]/5 to-[var(--surface)]/10 border-[var(--border)] hover:border-[var(--accent-warning)]/50'
                  }`}>
                    {/* IMAGEM */}
                    <div className="h-40 bg-gradient-to-br from-[var(--accent-warning)]/30 to-[var(--accent-warning)]/30 flex items-center justify-center relative">
                      <CubeIcon className="w-20 h-20 text-[var(--accent-warning)]/50" />
                      {produto.status === 'esgotado' && (
                        <div className="absolute inset-0 bg-[var(--background)]/60 flex items-center justify-center">
                          <span className="text-[var(--accent-alert)] font-bold text-xl">ESGOTADO</span>
                        </div>
                      )}
                      {produto.vendidos > 50 && (
                        <div className="absolute top-3 right-3 bg-[var(--accent-warning)] text-[var(--text-primary)] px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                          <StarIcon className="w-4 h-4" /> TOP
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-1 bg-[var(--accent-warning)]/20 text-[var(--accent-warning)] rounded-full text-xs">
                          {produto.categoria}
                        </span>
                        <span className={`text-sm font-bold ${produto.margem >= 50 ? 'text-[var(--accent-emerald)]' : 'text-[var(--accent-warning)]'}`}>
                          +{produto.margem.toFixed(0)}%
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 line-clamp-1">{produto.nome}</h3>
                      <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">{produto.descricao}</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-black text-[var(--accent-warning)]">R$ {produto.preco.toLocaleString('pt-BR')}</p>
                          <p className="text-[var(--text-secondary)] text-xs">Custo: R$ {produto.preco_custo.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[var(--text-primary)]">{produto.estoque}</p>
                          <p className="text-[var(--text-secondary)] text-xs">em estoque</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">{produto.vendidos} vendidos</span>
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
          className="text-center py-24 mt-16"
        >
          <SparklesIcon className="w-32 h-32 text-[var(--accent-warning)] mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-[var(--accent-warning)] max-w-4xl mx-auto">
            "Um catálogo organizado vende mais que mil vendedores."
          </p>
          <p className="text-3xl text-[var(--text-secondary)] mt-8">
            — Citizen Supremo X.1, seu Gerente de Produtos
          </p>
        </motion.div>
      </div>
  );
}
