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
      <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-3)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-3)] font-light">Conectando às redes...</p>
      </div>
    );
  }

  const platformGradient = (plataforma: string) => {
    const gradients: Record<string, string> = {
      instagram: 'from-[var(--accent-3)] to-[var(--accent-alert)]',
      facebook: 'from-[var(--accent-2)] to-[var(--accent-1)]',
      twitter: 'from-[var(--accent-2)] to-[var(--accent-1)]',
      linkedin: 'from-[var(--accent-2)] to-[var(--accent-1)]',
      tiktok: 'from-[var(--accent-3)] to-[var(--accent-2)]',
      youtube: 'from-[var(--accent-alert)] to-[var(--accent-warm)]'
    };
    return gradients[plataforma.toLowerCase()] || 'from-[var(--surface)] to-[var(--surface-strong)]';
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-3)] via-[var(--accent-2)] to-[var(--accent-1)] bg-clip-text text-transparent">
          SOCIAL MEDIA SUPREMO
        </h1>
        <p className="text-3xl text-[var(--text-muted)] mt-6">
          O feed é nosso território. Cada post é uma conquista viral.
        </p>
      </motion.div>

      {/* KPIs PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16 max-w-7xl mx-auto">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="bg-[var(--surface)]/60 border-[var(--accent-3)]/30 backdrop-blur-xl">
            <CardContent className="p-8">
              <UserPlusIcon className="w-16 h-16 text-[var(--accent-3)] mb-4" />
              <p className="text-4xl font-black text-[var(--text)]">{(metrics?.totalSeguidores || 0).toLocaleString()}</p>
              <p className="text-xl text-[var(--text-muted)]">Seguidores Totais</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="bg-[var(--surface)]/60 border-[var(--accent-alert)]/30 backdrop-blur-xl">
            <CardContent className="p-8">
              <HeartIcon className="w-16 h-16 text-[var(--accent-alert)] mb-4" />
              <p className="text-5xl font-black text-[var(--text)]">{(metrics?.engajamentoMedio || 0).toFixed(1)}%</p>
              <p className="text-xl text-[var(--text-muted)]">Engajamento Médio</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="bg-[var(--surface)]/60 border-[var(--accent-3)]/30 backdrop-blur-xl">
            <CardContent className="p-8">
              <ChatBubbleLeftIcon className="w-16 h-16 text-[var(--accent-3)] mb-4" />
              <p className="text-5xl font-black text-[var(--text)]">{metrics?.totalPosts || 0}</p>
              <p className="text-xl text-[var(--text-muted)]">Posts Publicados</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="bg-[var(--surface)]/60 border-[var(--accent-2)]/30 backdrop-blur-xl">
            <CardContent className="p-8">
              <EyeIcon className="w-16 h-16 text-[var(--accent-2)] mb-4" />
              <p className="text-4xl font-black text-[var(--text)]">{(metrics?.alcanceTotal || 0).toLocaleString()}</p>
              <p className="text-xl text-[var(--text-muted)]">Alcance Total</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card className="bg-[var(--surface)]/60 border-[var(--accent-1)]/30 backdrop-blur-xl">
            <CardContent className="p-8">
              <ShareIcon className="w-16 h-16 text-[var(--accent-1)] mb-4" />
              <p className="text-5xl font-black text-[var(--text)]">+{(metrics?.crescimentoMensal || 0).toFixed(1)}%</p>
              <p className="text-xl text-[var(--text-muted)]">Crescimento Mensal</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CONTAS CONECTADAS */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-3)] to-[var(--accent-2)] bg-clip-text text-transparent">
          Contas Conectadas
        </h2>

        {metrics?.contas.length === 0 ? (
          <div className="text-center py-20">
            <GlobeAltIcon className="w-32 h-32 text-[var(--text-muted)] mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-muted)]">Nenhuma conta conectada</p>
            <p className="text-xl text-[var(--text-muted)] mt-4">Conecte suas redes sociais</p>
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
              >
                <Card className={`bg-gradient-to-br ${platformGradient(conta.plataforma)} border-[var(--border)]/20 shadow-2xl`}>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-3xl font-bold text-[var(--text)] mb-2">{conta.plataforma}</h3>
                    <p className="text-xl text-[var(--text)]/80">@{conta.nome}</p>

                    <div className="mt-8 space-y-4">
                      <div className="bg-[var(--bg)]/30 rounded-2xl p-4">
                        <p className="text-4xl font-black text-[var(--text)]">{conta.seguidores.toLocaleString()}</p>
                        <p className="text-[var(--text)]/60">Seguidores</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[var(--bg)]/30 rounded-xl p-3">
                          <p className="text-2xl font-bold text-[var(--text)]">{conta.engajamento}%</p>
                          <p className="text-sm text-[var(--text)]/60">Engajamento</p>
                        </div>
                        <div className="bg-[var(--bg)]/30 rounded-xl p-3">
                          <p className="text-2xl font-bold text-[var(--text)]">{conta.posts_mes}</p>
                          <p className="text-sm text-[var(--text)]/60">Posts/mês</p>
                        </div>
                      </div>

                      <div className={`rounded-xl p-3 ${conta.crescimento >= 0 ? 'bg-[var(--accent-1)]/30' : 'bg-[var(--accent-alert)]/30'}`}>
                        <p className="text-2xl font-bold text-[var(--text)]">
                          {conta.crescimento >= 0 ? '+' : ''}{conta.crescimento}%
                        </p>
                        <p className="text-sm text-[var(--text)]/60">Crescimento</p>
                      </div>
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
        className="text-center py-24 mt-20"
      >
        <SparklesIcon className="w-32 h-32 text-[var(--accent-3)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-3)] max-w-4xl mx-auto">
          "Viralizar não é sorte. É estratégia alienígena."
        </p>
        <p className="text-3xl text-[var(--text-muted)] mt-8">
          — Citizen Supremo X.1, seu Influenciador Digital
        </p>
      </motion.div>
    </div>
  );
}
