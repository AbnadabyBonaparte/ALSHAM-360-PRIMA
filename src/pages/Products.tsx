// src/pages/Products.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Produtos Alienígenas 1000/1000
// Cada produto é uma obra-prima de valor. O catálogo que vende sozinho.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
import {
  CubeIcon,
  CurrencyDollarIcon,
  TagIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  StarIcon,
  ShoppingBagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

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
      <LayoutSupremo title="Produtos Supremos">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-orange-500 rounded-full"
          />
          <p className="absolute text-4xl text-orange-400 font-light">Carregando catálogo...</p>
        </div>
      </LayoutSupremo>
    );
  }

  const categorias = ['todas', ...new Set(metrics?.produtos.map(p => p.categoria) || [])];
  const produtosFiltrados = categoria === 'todas'
    ? metrics?.produtos || []
    : metrics?.produtos.filter(p => p.categoria === categoria) || [];

  return (
    <LayoutSupremo title="Produtos Supremos">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
            PRODUTOS SUPREMOS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada produto é uma obra-prima de valor
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-orange-900/60 to-amber-900/60 rounded-2xl p-6 border border-orange-500/30">
            <CubeIcon className="w-12 h-12 text-orange-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.totalProdutos || 0}</p>
            <p className="text-gray-400">Total Produtos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <ArchiveBoxIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-3xl font-black text-white">R$ {((metrics?.valorEstoque || 0) / 1000).toFixed(0)}k</p>
            <p className="text-gray-400">Valor Estoque</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <ChartBarIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-white">{(metrics?.margemMedia || 0).toFixed(0)}%</p>
            <p className="text-gray-400">Margem Média</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <ShoppingBagIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-4xl font-black text-white">{(metrics?.totalVendidos || 0).toLocaleString()}</p>
            <p className="text-gray-400">Unidades Vendidas</p>
          </motion.div>
        </div>

        {/* FILTROS POR CATEGORIA */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`px-5 py-2 rounded-xl font-medium transition-all capitalize ${
                categoria === cat
                  ? 'bg-orange-500 text-black'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID DE PRODUTOS */}
        <div className="max-w-7xl mx-auto">
          {produtosFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <CubeIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum produto encontrado</p>
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
                  className={`rounded-3xl overflow-hidden border backdrop-blur-xl ${
                    produto.status === 'esgotado'
                      ? 'bg-gradient-to-br from-gray-900/60 to-gray-800/60 border-gray-500/30 opacity-70'
                      : 'bg-gradient-to-br from-white/5 to-white/10 border-white/10 hover:border-orange-500/50'
                  }`}
                >
                  {/* IMAGEM */}
                  <div className="h-40 bg-gradient-to-br from-orange-600/30 to-amber-600/30 flex items-center justify-center relative">
                    <CubeIcon className="w-20 h-20 text-orange-400/50" />
                    {produto.status === 'esgotado' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-red-400 font-bold text-xl">ESGOTADO</span>
                      </div>
                    )}
                    {produto.vendidos > 50 && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <StarIcon className="w-4 h-4" /> TOP
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                        {produto.categoria}
                      </span>
                      <span className={`text-sm font-bold ${produto.margem >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                        +{produto.margem.toFixed(0)}%
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{produto.nome}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{produto.descricao}</p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-black text-orange-400">R$ {produto.preco.toLocaleString('pt-BR')}</p>
                        <p className="text-gray-500 text-xs">Custo: R$ {produto.preco_custo.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{produto.estoque}</p>
                        <p className="text-gray-500 text-xs">em estoque</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                      <span className="text-gray-400">{produto.vendidos} vendidos</span>
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
          <SparklesIcon className="w-32 h-32 text-orange-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-orange-300 max-w-4xl mx-auto">
            "Um catálogo organizado vende mais que mil vendedores."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Gerente de Produtos
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
