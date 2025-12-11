// src/pages/NFTGallery.tsx
// ALSHAM ETERNAL VAULT — O cofre onde o dinheiro vira arte eterna
// Tabela real: nft_gallery (já existe no seu banco)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Diamond, Crown, Flame, Zap, Eye, Heart,
  Search, Filter, Plus, ExternalLink, X,
  Wallet, Shield, Sparkles, Trophy
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface NFT {
  id: string;
  name: string;
  collection: string;
  price_eth: number;
  image_url: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'divine';
  likes: number;
  views: number;
  owner: string;
  minted_at: string;
  contract_address: string;
}

const RARITY = {
  common: { color: 'from-gray-400 to-gray-600', glow: 'shadow-gray-500/30', badge: 'text-gray-300' },
  rare: { color: 'from-blue-400 to-cyan-500', glow: 'shadow-cyan-500/40', badge: 'text-cyan-300' },
  epic: { color: 'from-purple-500 to-pink-600', glow: 'shadow-purple-500/50', badge: 'text-purple-300' },
  legendary: { color: 'from-amber-400 to-yellow-600', glow: 'shadow-amber-500/60', badge: 'text-amber-300' },
  divine: { color: 'from-yellow-400 via-orange-500 to-red-600', glow: 'shadow-red-600/80', badge: 'text-red-400' }
};

export default function EternalVault() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selected, setSelected] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);

  // 100% REAL — pega direto da tabela nft_gallery
  useEffect(() => {
    const loadVault = async () => {
      const { data, error } = await supabase
        .from('nft_gallery')
        .select('*')
        .order('price_eth', { ascending: false });

      if (error) {
        toast.error('Erro ao abrir o cofre eterno');
        return;
      }

      if (data) {
        setNfts(data.map(n => ({
          ...n,
          rarity: n.rarity || 'epic',
          likes: n.likes || 0,
          views: n.views || 0
        })));
      }
      setLoading(false);
    };

    loadVault();

    // Realtime — novo NFT mintado aparece instantaneamente
    const channel = supabase.channel('eternal-vault')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nft_gallery' }, () => {
        loadVault();
        toast('Um novo artefato foi forjado no éter', { icon: 'Sparkles' });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalValue = nfts.reduce((a, n) => a + (n.price_eth || 0), 0);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[var(--background)]">
<motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 border-8 border-t-transparent border-gradient-to-r from-amber-500 via-purple-500 to-cyan-500 rounded-full" />
      <p className="text-4xl text-amber-400 mt-12 font-black">ABRINDO O COFRE ETERNO...</p>
    </div>)
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] relative overflow-hidden">

        {/* AURA CÓSMICA */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-amber-900/20" />
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 60, repeat: Infinity }}
          className="fixed inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 50%)' }}
        />

        {/* HEADER DO COFRE */}
        <motion.div className="relative z-10 text-center py-20">
          <motion.h1
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="text-10xl font-black bg-gradient-to-r from-amber-300 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            ETERNAL VAULT
          </motion.h1>
          <div className="flex justify-center gap-32 mt-20">
            <div>
              <p className="text-4xl md:text-5xl lg:text-6xl font-black text-amber-400">{totalValue.toFixed(2)} ETH</p>
              <p className="text-4xl text-amber-300">Valor Total do Cofre</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl lg:text-6xl font-black text-purple-400">{nfts.length}</p>
              <p className="text-4xl text-purple-300">Artefatos Imortais</p>
            </div>
          </div>
        </motion.div>

        {/* GRID DOS ARTEFATOS */}
        <div className="relative z-10 px-20 pb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-12">
            <AnimatePresence>
              {nfts.map((nft, i) => {
                const config = RARITY[nft.rarity];
                return (
                  <motion.div
                    key={nft.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.08, y: -20, zIndex: 50 }}
                    onClick={() => setSelected(nft)}
                    className="relative group cursor-pointer"
                  >
                    {/* AURA DIVINA */}
                    <motion.div
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className={`absolute -inset-8 rounded-3xl blur-3xl bg-gradient-to-br ${config.color} ${config.glow}`}
                    />

                    <div className={`relative bg-[var(--background)]/60 backdrop-blur-3xl rounded-3xl border-4 ${config.border} p-8 overflow-hidden`}>
                      {nft.rarity === 'divine' && <Crown className="absolute top-4 right-4 h-12 w-12 text-yellow-400" />}
                      {nft.rarity === 'legendary' && <Trophy className="absolute top-4 right-4 h-10 w-10 text-amber-400" />}

                      <div className="aspect-square rounded-2xl bg-gradient-to-br from-white/5 to-black/50 mb-6 overflow-hidden border border-[var(--border)]">
                        {nft.image_url ? (
                          <img src={nft.image_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center">
                            <Diamond className={`h-32 w-32 ${config.badge}`} />
                          </div>
                        )}
                      </div>

                      <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">{nft.name}</h3>
                      <p className="text-lg text-[var(--text-primary)]/60 mb-4">{nft.collection}</p>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-4xl font-black text-[var(--text-primary)]">{nft.price_eth} ETH</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[var(--text-primary)]/40 flex items-center gap-1"><Heart className="h-4 w-4" /> {nft.likes}</p>
                          <p className="text-sm text-[var(--text-primary)]/40 flex items-center gap-1"><Eye className="h-4 w-4" /> {nft.views}</p>
                        </div>
                      </div>

                      <div className={`mt-6 px-6 py-3 rounded-2xl bg-[var(--background)]/50 border ${config.border} text-center`}>
                        <p className={`text-xl font-black ${config.badge}`}>{nft.rarity.toUpperCase()}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* MODAL HOLOGRÁFICO 3D */}
        <AnimatePresence>
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                className="absolute inset-0 bg-[var(--background)]/95 backdrop-blur-3xl"
              />

              <motion.div
                initial={{ scale: 0.8, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                exit={{ scale: 0.8, rotateY: 180 }}
                className="relative z-10 max-w-6xl w-full bg-gradient-to-br from-purple-900/40 via-black to-amber-900/40 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl"
              >
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-8 right-8 z-20 p-4 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="h-10 w-10" />
                </button>

                <div className="grid lg:grid-cols-2">
                  <div className="p-20 flex items-center justify-center bg-gradient-to-br from-black to-purple-950/50">
                    <motion.div
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="relative"
                    >
                      {selected.image_url ? (
                        <img src={selected.image_url} className="max-w-md rounded-2xl shadow-2xl" />
                      ) : (
                        <Diamond className="h-96 w-96 text-amber-400" />
                      )}
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 40, repeat: Infinity }}
                        className="absolute -inset-20 blur-3xl bg-gradient-to-r from-purple-600/40 to-amber-600/40"
                      />
                    </motion.div>
                  </div>

                  <div className="p-20 space-y-12">
                    <div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--text-primary)] mb-4">{selected.name}</h2>
                      <p className="text-4xl text-[var(--text-primary)]/70">{selected.collection}</p>
                    </div>

                    <div className="text-2xl md:text-3xl lg:text-4xl font-black text-amber-400">
                      {selected.price_eth} ETH
                    </div>

                    <div className="space-y-6 text-2xl">
                      <p>Proprietário: <span className="text-purple-300">{selected.owner}</span></p>
                      <p>Mintado em: <span className="text-cyan-300">{new Date(selected.minted_at).toLocaleDateString('pt-BR')}</span></p>
                      <p className="font-black text-4xl" style={{ color: RARITY[selected.rarity].badge }}>
                        {selected.rarity.toUpperCase()}
                      </p>
                    </div>

                    <div className="flex gap-8">
                      <button className="px-12 py-8 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 text-3xl font-black shadow-2xl">
                        Transferir
                      </button>
                      <button className="px-12 py-8 rounded-3xl bg-gradient-to-r from-amber-600 to-yellow-600 text-black text-3xl font-black shadow-2xl">
                        Exibir no Metaverso
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MENSAGEM FINAL */}
        <motion.div className="fixed inset-x-0 bottom-20 text-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            ESTES ARTEFATOS SÃO ETERNOS
          </p>
          <p className="text-5xl text-[var(--text-primary)]/60 mt-8">E pertencem apenas a você.</p>
        </motion.div>
      </div>
  );
}
