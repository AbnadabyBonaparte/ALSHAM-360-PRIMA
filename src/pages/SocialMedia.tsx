// src/pages/SocialMedia.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Social Media Alienígena 1000/1000
// O feed é nosso território. Cada post é uma conquista viral.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  EyeIcon,
  UserPlusIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SocialAccount {
  id: string;
  plataforma: string;
  nome: string;
  seguidores: number;
  engajamento: number;
  posts_mes: number;
  crescimento: number;
}

interface SocialMetrics {
  totalSeguidores: number;
  engajamentoMedio: number;
  totalPosts: number;
  alcanceTotal: number;
  crescimentoMensal: number;
  contas: SocialAccount[];
}

export default function SocialMediaPage() {
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeSocial() {
      try {
        const { data: contas } = await supabase
          .from('social_accounts')
          .select('*')
          .order('seguidores', { ascending: false });

        const { data: posts } = await supabase
          .from('social_posts')
          .select('alcance, curtidas, comentarios, compartilhamentos');

        if (contas) {
          const totalSeguidores = contas.reduce((s, c) => s + (c.seguidores || 0), 0);
          const engajamentoMedio = contas.reduce((s, c) => s + (c.engajamento || 0), 0) / (contas.length || 1);
          const totalPosts = posts?.length || 0;
          const alcanceTotal = posts?.reduce((s, p) => s + (p.alcance || 0), 0) || 0;
          const crescimentoMensal = contas.reduce((s, c) => s + (c.crescimento || 0), 0) / (contas.length || 1);

          setMetrics({
            totalSeguidores,
            engajamentoMedio,
            totalPosts,
            alcanceTotal,
            crescimentoMensal,
            contas: contas.map(c => ({
              id: c.id,
              plataforma: c.plataforma || 'unknown',
              nome: c.nome || c.username || 'Conta',
              seguidores: c.seguidores || 0,
              engajamento: c.engajamento || 0,
              posts_mes: c.posts_mes || 0,
              crescimento: c.crescimento || 0
            }))
          });
        } else {
          setMetrics({
            totalSeguidores: 0,
            engajamentoMedio: 0,
            totalPosts: 0,
            alcanceTotal: 0,
            crescimentoMensal: 0,
            contas: []
          });
        }
      } catch (err) {
        console.error('Erro no Social Media Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeSocial();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-pink)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-pink)] font-light">Conectando às redes...</p>
      </div>
    );
  }

  const platformIcon = (plataforma: string) => {
    const colors: Record<string, string> = {
      instagram: 'from-[var(--accent-pink)] to-[var(--accent-purple)]',
      facebook: 'from-[var(--accent-sky)] to-[var(--accent-1)]',
      twitter: 'from-[var(--accent-sky)] to-[var(--accent-1)]',
      linkedin: 'from-[var(--accent-sky)] to-[var(--accent-1)]',
      tiktok: 'from-[var(--accent-pink)] to-[var(--accent-sky)]',
      youtube: 'from-[var(--accent-alert)] to-[var(--accent-warning)]'
    };
    return colors[plataforma.toLowerCase()] || 'from-[var(--text-secondary)] to-[var(--text-secondary)]';
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-1)] bg-clip-text text-transparent">
            SOCIAL MEDIA SUPREMO
          </h1>
          <p className="text-3xl text-[var(--text-secondary)] mt-6">
            O feed é nosso território. Cada post é uma conquista viral.
          </p>
        </motion.div>

        {/* KPIs PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16 max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]"
          >
            <UserPlusIcon className="w-16 h-16 text-[var(--accent-pink)] mb-4" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalSeguidores || 0).toLocaleString()}</p>
            <p className="text-xl text-[var(--text-secondary)]">Seguidores Totais</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]"
          >
            <HeartIcon className="w-16 h-16 text-[var(--accent-alert)] mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.engajamentoMedio || 0).toFixed(1)}%</p>
            <p className="text-xl text-[var(--text-secondary)]">Engajamento Médio</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]"
          >
            <ChatBubbleLeftIcon className="w-16 h-16 text-[var(--accent-purple)] mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{metrics?.totalPosts || 0}</p>
            <p className="text-xl text-[var(--text-secondary)]">Posts Publicados</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]"
          >
            <EyeIcon className="w-16 h-16 text-[var(--accent-sky)] mb-4" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.alcanceTotal || 0).toLocaleString()}</p>
            <p className="text-xl text-[var(--text-secondary)]">Alcance Total</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]"
          >
            <ShareIcon className="w-16 h-16 text-[var(--accent-emerald)] mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">+{(metrics?.crescimentoMensal || 0).toFixed(1)}%</p>
            <p className="text-xl text-[var(--text-secondary)]">Crescimento Mensal</p>
          </motion.div>
        </div>

        {/* CONTAS CONECTADAS */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-pink)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            Contas Conectadas
          </h2>

          {metrics?.contas.length === 0 ? (
            <div className="text-center py-20">
              <GlobeAltIcon className="w-32 h-32 text-[var(--text)]/30 mx-auto mb-8" />
              <p className="text-3xl text-[var(--text)]/50">Nenhuma conta conectada</p>
              <p className="text-xl text-[var(--text)]/40 mt-4">Conecte suas redes sociais</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {metrics?.contas.map((conta, i) => (
                <motion.div
                  key={conta.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-gradient-to-br ${platformIcon(conta.plataforma)} rounded-3xl p-8 border border-[var(--border)] shadow-2xl`}
                >
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{conta.plataforma}</h3>
                    <p className="text-xl text-[var(--text-primary)]/80">@{conta.nome}</p>

                    <div className="mt-8 space-y-4">
                      <div className="bg-[var(--background)]/30 rounded-2xl p-4">
                        <p className="text-4xl font-black text-[var(--text-primary)]">{conta.seguidores.toLocaleString()}</p>
                        <p className="text-[var(--text-primary)]/60">Seguidores</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[var(--background)]/30 rounded-xl p-3">
                          <p className="text-2xl font-bold text-[var(--text-primary)]">{conta.engajamento}%</p>
                          <p className="text-sm text-[var(--text-primary)]/60">Engajamento</p>
                        </div>
                        <div className="bg-[var(--background)]/30 rounded-xl p-3">
                          <p className="text-2xl font-bold text-[var(--text-primary)]">{conta.posts_mes}</p>
                          <p className="text-sm text-[var(--text-primary)]/60">Posts/mês</p>
                        </div>
                      </div>

                      <div className={`rounded-xl p-3 ${conta.crescimento >= 0 ? 'bg-[var(--accent-emerald)]/20' : 'bg-[var(--accent-alert)]/20'}`}>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">
                          {conta.crescimento >= 0 ? '+' : ''}{conta.crescimento}%
                        </p>
                        <p className="text-sm text-[var(--text-primary)]/60">Crescimento</p>
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
          <SparklesIcon className="w-32 h-32 text-[var(--accent-pink)] mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-[var(--accent-pink)] max-w-4xl mx-auto">
            "Viralizar não é sorte. É estratégia alienígena."
          </p>
          <p className="text-3xl text-[var(--text-secondary)] mt-8">
            — Citizen Supremo X.1, seu Influenciador Digital
          </p>
        </motion.div>
      </div>
  );
}
