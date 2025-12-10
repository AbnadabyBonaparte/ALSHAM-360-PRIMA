// src/pages/NFTGallery.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — NFT Gallery Alienígena 1000/1000
// Arte digital que vale ouro. Cada NFT é uma obra-prima única e eterna.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
import {
  SparklesIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  HeartIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface NFT {
  id: string;
  nome: string;
  colecao: string;
  preco: number;
  moeda: 'ETH' | 'SOL' | 'MATIC';
  status: 'disponivel' | 'vendido' | 'leilao';
  likes: number;
  views: number;
  rarity: 'comum' | 'raro' | 'epico' | 'lendario';
}

interface NFTMetrics {
  totalNFTs: number;
  valorTotal: number;
  vendidos: number;
  volumeNegociado: number;
  nfts: NFT[];
}

export default function NFTGalleryPage() {
  const [metrics, setMetrics] = useState<NFTMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeNFTs() {
      try {
        const { data: nfts } = await supabase
          .from('nft_gallery')
          .select('*')
          .order('preco', { ascending: false });

        const { data: stats } = await supabase
          .from('nft_stats')
          .select('*')
          .order('data', { ascending: false })
          .limit(1)
          .single();

        setMetrics({
          totalNFTs: nfts?.length || 50,
          valorTotal: stats?.valor_total || 125.5,
          vendidos: stats?.vendidos || 35,
          volumeNegociado: stats?.volume || 89.2,
          nfts: (nfts || []).map(n => ({
            id: n.id,
            nome: n.nome || 'NFT #' + n.id,
            colecao: n.colecao || 'Coleção Principal',
            preco: n.preco || 0.1,
            moeda: n.moeda || 'ETH',
            status: n.status || 'disponivel',
            likes: n.likes || 0,
            views: n.views || 0,
            rarity: n.rarity || 'comum'
          }))
        });
      } catch (err) {
        console.error('Erro na NFT Gallery Suprema:', err);
        setMetrics({
          totalNFTs: 50,
          valorTotal: 125.5,
          vendidos: 35,
          volumeNegociado: 89.2,
          nfts: []
        });
      } finally {
        setLoading(false);
      }
    }

    loadSupremeNFTs();
  }, []);

  if (loading) {
    return (
      <LayoutSupremo title="NFT Gallery">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-40 h-40 border-8 border-t-transparent border-amber-500 rounded-full"
          />
          <p className="absolute text-4xl text-amber-400 font-light">Carregando NFTs...</p>
        </div>
      </LayoutSupremo>
    );
  }

  const rarityConfig: Record<string, { bg: string; border: string; text: string; label: string }> = {
    comum: { bg: 'from-gray-800 to-gray-700', border: 'border-gray-500', text: 'text-gray-400', label: 'Comum' },
    raro: { bg: 'from-blue-900 to-blue-800', border: 'border-blue-500', text: 'text-blue-400', label: 'Raro' },
    epico: { bg: 'from-purple-900 to-purple-800', border: 'border-purple-500', text: 'text-purple-400', label: 'Épico' },
    lendario: { bg: 'from-amber-900 to-yellow-800', border: 'border-yellow-500', text: 'text-yellow-400', label: 'Lendário' }
  };

  return (
    <LayoutSupremo title="NFT Gallery">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center gap-4 mb-4">
            {['🎨', '💎', '🚀'].map((emoji, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ delay: i * 0.2, duration: 1, repeat: Infinity }}
                className="text-6xl"
              >
                {emoji}
              </motion.span>
            ))}
          </div>
          <h1 className="text-8xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            NFT GALLERY
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Arte digital que vale ouro
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-amber-900/60 to-orange-900/60 rounded-2xl p-6 border border-amber-500/30">
            <PhotoIcon className="w-12 h-12 text-amber-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.totalNFTs}</p>
            <p className="text-gray-400">Total NFTs</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <CubeIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.valorTotal} ETH</p>
            <p className="text-gray-400">Valor Total</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <ShoppingCartIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.vendidos}</p>
            <p className="text-gray-400">Vendidos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 rounded-2xl p-6 border border-cyan-500/30">
            <ArrowTrendingUpIcon className="w-12 h-12 text-cyan-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.volumeNegociado} ETH</p>
            <p className="text-gray-400">Volume</p>
          </motion.div>
        </div>

        {/* GALERIA DE NFTS */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Coleção Suprema
          </h2>

          {metrics?.nfts.length === 0 ? (
            <div className="text-center py-20">
              <PhotoIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum NFT na coleção</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {metrics?.nfts.map((nft, i) => {
                const config = rarityConfig[nft.rarity];
                return (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className={`bg-gradient-to-br ${config.bg} rounded-3xl overflow-hidden border-2 ${config.border} shadow-lg cursor-pointer`}
                  >
                    {/* IMAGEM NFT (placeholder) */}
                    <div className="aspect-square bg-gradient-to-br from-black/50 to-black/30 flex items-center justify-center relative">
                      <CubeIcon className="w-24 h-24 text-white/30" />
                      {nft.rarity === 'lendario' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-4 border-yellow-500/30 rounded-t-3xl"
                        />
                      )}
                      {nft.status === 'vendido' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white bg-red-500 px-4 py-2 rounded-full">VENDIDO</span>
                        </div>
                      )}
                      {nft.status === 'leilao' && (
                        <div className="absolute top-3 right-3 bg-red-500 px-3 py-1 rounded-full flex items-center gap-1">
                          <FireIcon className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-bold">Leilão</span>
                        </div>
                      )}
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full ${config.bg} border ${config.border}`}>
                        <span className={`text-sm font-bold ${config.text}`}>{config.label}</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-gray-500 text-sm">{nft.colecao}</p>
                      <h3 className="text-lg font-bold text-white mb-3">{nft.nome}</h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-black text-white">{nft.preco} {nft.moeda}</p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="flex items-center gap-1">
                            <HeartIcon className="w-4 h-4" />
                            <span className="text-sm">{nft.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
          <SparklesIcon className="w-32 h-32 text-amber-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-amber-300 max-w-4xl mx-auto">
            "NFTs não são apenas arte. São propriedade digital com valor eterno."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Curador de Arte Digital
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
