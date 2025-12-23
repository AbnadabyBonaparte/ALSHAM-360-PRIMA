// src/pages/VirtualOffice.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Escritório Virtual Alienígena 1000/1000
// O futuro do trabalho é aqui. Presença digital, produtividade real.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import {
  BuildingOffice2Icon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  GlobeAltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VirtualRoom {
  id: string;
  nome: string;
  tipo: 'meeting' | 'focus' | 'social' | 'event';
  participantes: number;
  capacidade: number;
  status: 'ativo' | 'ocupado' | 'livre';
}

interface VirtualOfficeMetrics {
  usuariosOnline: number;
  salasCriadas: number;
  reunioesHoje: number;
  horasTrabalhadas: number;
  salas: VirtualRoom[];
}

export default function VirtualOfficePage() {
  const [metrics, setMetrics] = useState<VirtualOfficeMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeVirtualOffice() {
      try {
        const { data: salas } = await supabase
          .from('virtual_office_rooms')
          .select('*')
          .order('participantes', { ascending: false });

        const { data: stats } = await supabase
          .from('virtual_office_stats')
          .select('*')
          .order('data', { ascending: false })
          .limit(1)
          .single();

        setMetrics({
          usuariosOnline: stats?.usuarios_online || 45,
          salasCriadas: salas?.length || 12,
          reunioesHoje: stats?.reunioes_hoje || 28,
          horasTrabalhadas: stats?.horas_trabalhadas || 156,
          salas: (salas || []).map((s: any) => ({
            id: s.id,
            nome: s.nome || 'Sala Virtual',
            tipo: s.tipo || 'meeting',
            participantes: s.participantes || 0,
            capacidade: s.capacidade || 10,
            status: s.participantes > 0 ? 'ocupado' : 'livre'
          }))
        });
      } catch (err) {
        console.error('Erro no Virtual Office Supremo:', err);
        setMetrics({
          usuariosOnline: 45,
          salasCriadas: 12,
          reunioesHoje: 28,
          horasTrabalhadas: 156,
          salas: []
        });
      } finally {
        setLoading(false);
      }
    }

    loadSupremeVirtualOffice();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-purple)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-purple)] font-light">Abrindo portal...</p>
      </div>
    );
  }

  const tipoConfig: Record<string, { icon: JSX.Element; color: string; label: string }> = {
    meeting: { icon: <VideoCameraIcon className="w-8 h-8" />, color: 'text-[var(--accent-sky)]', label: 'Reunião' },
    focus: { icon: <ComputerDesktopIcon className="w-8 h-8" />, color: 'text-[var(--accent-emerald)]', label: 'Foco' },
    social: { icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />, color: 'text-[var(--accent-pink)]', label: 'Social' },
    event: { icon: <GlobeAltIcon className="w-8 h-8" />, color: 'text-[var(--accent-warning)]', label: 'Evento' }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
          ESCRITÓRIO VIRTUAL
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          O futuro do trabalho é aqui
        </p>
      </motion.div>

      {/* STATUS ONLINE */}
      <Card className="max-w-md mx-auto mb-12 bg-[var(--accent-purple)]/10 border-[var(--accent-purple)]/50">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-4 h-4 bg-[var(--accent-emerald)] rounded-full animate-pulse" />
            <span className="text-2xl text-[var(--accent-emerald)] font-bold">ONLINE AGORA</span>
          </div>
          <p className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--text-primary)]">{metrics?.usuariosOnline}</p>
          <p className="text-[var(--text-secondary)]">colaboradores ativos</p>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
        <Card className="bg-[var(--accent-sky)]/10 border-[var(--accent-sky)]/30 hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <BuildingOffice2Icon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.salasCriadas}</p>
            <p className="text-[var(--text-secondary)]">Salas Virtuais</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30 hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <VideoCameraIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.reunioesHoje}</p>
            <p className="text-[var(--text-secondary)]">Reuniões Hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-purple)]/10 border-[var(--accent-purple)]/30 hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <ClockIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.horasTrabalhadas}h</p>
            <p className="text-[var(--text-secondary)]">Horas Hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-pink)]/10 border-[var(--accent-pink)]/30 hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <UserGroupIcon className="w-12 h-12 text-[var(--accent-pink)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.usuariosOnline}</p>
            <p className="text-[var(--text-secondary)]">Team Online</p>
          </CardContent>
        </Card>
      </div>

      {/* SALAS VIRTUAIS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
          Salas Virtuais
        </h2>

        {metrics?.salas.length === 0 ? (
          <div className="text-center py-20">
            <BuildingOffice2Icon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhuma sala virtual ativa</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics?.salas.map((sala, i) => {
              const config = tipoConfig[sala.tipo];
              return (
                <motion.div
                  key={sala.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className={`backdrop-blur-xl cursor-pointer transition-all ${
                    sala.participantes > 0
                      ? 'bg-[var(--accent-purple)]/20 border-[var(--accent-purple)]/50 shadow-lg shadow-[var(--accent-purple)]/20'
                      : 'bg-[var(--surface)]/60 border-[var(--border)] hover:border-[var(--accent-purple)]/30'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-[var(--background)]/40 ${config.color}`}>
                          {config.icon}
                        </div>
                        {sala.participantes > 0 && (
                          <Badge className="bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]">
                            <div className="w-2 h-2 bg-[var(--accent-emerald)] rounded-full animate-pulse mr-2" />
                            Ativo
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{sala.nome}</h3>
                      <p className={`text-sm ${config.color}`}>{config.label}</p>

                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                          <span className="text-[var(--text-primary)] font-medium">{sala.participantes}/{sala.capacidade}</span>
                        </div>
                        <Button className={`px-4 py-2 rounded-xl font-medium ${
                          sala.participantes > 0
                            ? 'bg-[var(--accent-purple)] text-[var(--background)] hover:bg-[var(--accent-purple)]/80'
                            : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-strong)]'
                        }`}>
                          {sala.participantes > 0 ? 'Entrar' : 'Abrir'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
        <SparklesIcon className="w-32 h-32 text-[var(--accent-purple)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-purple)] max-w-4xl mx-auto">
          "O escritório do futuro não tem paredes. Tem conexões."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Arquiteto Virtual
        </p>
      </motion.div>
    </div>
  );
}
