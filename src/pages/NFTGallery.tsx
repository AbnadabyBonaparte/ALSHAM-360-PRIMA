// src/pages/NFTGallery.tsx
// ALSHAM ETERNAL VAULT — VERSÃO CANÔNICA 1000/1000
// Totalmente integrada ao layout global (HeaderSupremo + SidebarSupremo + Tema Dinâmico)
// Sem layout duplicado • 100% variáveis de tema • Realtime • Modal elegante • Proporções perfeitas
// ✅ MIGRADO PARA CSS VARIABLES

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Diamond, Crown, Trophy, Heart, Eye, ExternalLink, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
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
  contract_address?: string;
}

const RARITY_CONFIG = {
  common: { gradient: 'from-[var(--text-secondary)] to-[var(--text-secondary)]', badge: 'text-[var(--text-secondary)]', glow: 'shadow-[var(--text-secondary)]/30' },
  rare: { gradient: 'from-[var(--accent-sky)] to-[var(--accent-sky)]', badge: 'text-[var(--accent-sky)]', glow: 'shadow-[var(--accent-sky)]/40' },
  epic: { gradient: 'from-[var(--accent-purple)] to-[var(--accent-pink)]', badge: 'text-[var(--accent-purple)]', glow: 'shadow-[var(--accent-purple)]/50' },
  legendary: { gradient: 'from-[var(--accent-warning)] to-[var(--accent-warning)]', badge: 'text-[var(--accent-warning)]', glow: 'shadow-[var(--accent-warning)]/60' },
  divine: { gradient: 'from-[var(--accent-alert)] via-[var(--accent-warning)] to-[var(--accent-warning)]', badge: 'text-[var(--accent-alert)]', glow: 'shadow-[var(--accent-alert)]/80' }
};

export default function EternalVault() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selected, setSelected] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVault = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('nft_gallery')
        .select('*')
        .order('price_eth', { ascending: false });

      if (error) {
        console.error('Erro ao carregar NFT Gallery:', error);
        toast.error('Falha ao abrir o Cofre Eterno');
        setLoading(false);
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

    const channel = supabase
      .channel('eternal-vault-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nft_gallery' }, () => {
        loadVault();
        toast.success('Novo artefato forjado no éter!', { icon: '✨' });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalValue = nfts.reduce((sum, n) => sum + (n.price_eth || 0), 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-8 border-t-transparent border-[var(--accent-1)] rounded-full mx-auto mb-8"
          />
          <p className="text-3xl font-black text-[var(--text)]">ABRINDO O COFRE ETERNO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] overflow-hidden">
      {/* TOOLBAR SUPERIOR */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-md p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
              ETERNAL VAULT — COFRE IMORTAL
            </h1>
            <div className="flex gap-12 mt-4">
              <div>
                <p className="text-sm text-[var(--text)]/60">Valor Total</p>
                <p className="text-4xl font-black text-[var(--accent-1)]">{totalValue.toFixed(2)} ETH</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text)]/60">Artefatos</p>
                <p className="text-4xl font-black text-[var(--text)]">{nfts.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE NFTs */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            <AnimatePresence>
              {nfts.map((nft, i) => {
                const config = RARITY_CONFIG[nft.rarity];

                return (
                  <motion.div
                    key={nft.id}
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    onClick={() => setSelected(nft)}
                    className="relative cursor-pointer group"
                  >
                    <motion.div
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className={`absolute -inset-4 rounded-3xl blur-3xl bg-gradient-to-br ${config.gradient} ${config.glow}`}
                    />

                    <div className="relative bg-[var(--surface)]/70 backdrop-blur-xl rounded-3xl border-2 border-[var(--border)] p-6 overflow-hidden">
                      {nft.rarity === 'divine' && <Crown className="absolute top-4 right-4 h-10 w-10 text-[var(--accent-alert)]" />}
                      {nft.rarity === 'legendary' && <Trophy className="absolute top-4 right-4 h-8 w-8 text-[var(--accent-warning)]" />}

                      <div className="aspect-square rounded-2xl overflow-hidden mb-6 border border-[var(--border)]">
                        {nft.image_url ? (
                          <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-[var(--background)]/50">
                            <Diamond className={`h-32 w-32 ${config.badge}`} />
                          </div>
                        )}
                      </div>

                      <h3 className="text-2xl font-black text-[var(--text)] truncate">{nft.name}</h3>
                      <p className="text-lg text-[var(--text)]/60 mb-4 truncate">{nft.collection}</p>

                      <div className="flex justify-between items-end">
                        <p className="text-3xl font-black text-[var(--accent-1)]">{nft.price_eth} ETH</p>
                        <div className="text-right text-sm">
                          <p className="flex items-center gap-1 text-[var(--text)]/60"><Heart className="h-4 w-4" /> {nft.likes}</p>
                          <p className="flex items-center gap-1 text-[var(--text)]/60"><Eye className="h-4 w-4" /> {nft.views}</p>
                        </div>
                      </div>

                      <div className="mt-6 px-4 py-2 rounded-xl bg-[var(--background)]/50 border border-[var(--border)] text-center">
                        <p className={`text-lg font-black ${config.badge}`}>{nft.rarity.toUpperCase()}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MODAL DETALHADO */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-[var(--background)]/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full bg-[var(--surface)]/90 backdrop-blur-2xl rounded-3xl border-2 border-[var(--border)] overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-6 right-6 z-20 p-3 rounded-full bg-[var(--background)]/50 hover:bg-[var(--background)]/70"
              >
                <X className="h-8 w-8 text-[var(--text)]" />
              </button>

              <div className="grid md:grid-cols-2">
                <div className="p-12 flex items-center justify-center bg-gradient-to-br from-[var(--background)] to-[var(--surface)]/50">
                  {selected.image_url ? (
                    <img src={selected.image_url} alt={selected.name} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
                  ) : (
                    <Diamond className="h-96 w-96 text-[var(--accent-1)]" />
                  )}
                </div>

                <div className="p-12 space-y-8">
                  <div>
                    <h2 className="text-5xl font-black text-[var(--text)]">{selected.name}</h2>
                    <p className="text-3xl text-[var(--text)]/70 mt-2">{selected.collection}</p>
                  </div>

                  <p className="text-5xl font-black text-[var(--accent-1)]">{selected.price_eth} ETH</p>

                  <div className="space-y-4 text-xl">
                    <p>Proprietário: <span className="text-[var(--accent-2)]">{selected.owner}</span></p>
                    <p>Mintado em: <span className="text-[var(--accent-2)]">{new Date(selected.minted_at).toLocaleDateString('pt-BR')}</span></p>
                    <p className={`text-4xl font-black ${RARITY_CONFIG[selected.rarity].badge}`}>
                      {selected.rarity.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex gap-6 pt-8">
                    <button className="flex-1 py-6 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-[var(--background)] text-2xl font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">
                      Transferir Artefato
                    </button>
                    <button className="px-8 py-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface)]/70 transition-colors">
                      <ExternalLink className="h-10 w-10 text-[var(--text)]" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MENSAGEM ÉPICA FIXA */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-4xl font-black bg-gradient-to-r from-[var(--accent-1)] via-[var(--accent-2)] to-[var(--accent-1)] bg-clip-text text-transparent">
          ESTES ARTEFATOS SÃO ETERNOS
        </p>
        <p className="text-2xl text-[var(--text)]/70 mt-4">E pertencem apenas a você.</p>
      </div>
    </div>
  );
}
