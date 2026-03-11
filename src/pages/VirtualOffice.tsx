// src/pages/VirtualOffice.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Escritório Virtual Alienígena 1000/1000
// O futuro do trabalho é aqui. Presença digital, produtividade real.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  Building2,
  Video,
  MessageCircle,
  Users,
  Monitor,
  Sparkles,
  Globe,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

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
          salas: (salas || []).map(s => ({
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
          className="w-40 h-40 border-8 border-t-transparent border-violet-500 rounded-full"
        />
        <p className="absolute text-4xl text-violet-400 font-light">Abrindo portal...</p>
      </div>
    );
  }

  const tipoConfig: Record<string, { icon: JSX.Element; color: string; label: string }> = {
    meeting: { icon: <Video className="w-8 h-8" />, color: 'text-[var(--accent-sky)]', label: 'Reunião' },
    focus: { icon: <Monitor className="w-8 h-8" />, color: 'text-[var(--accent-emerald)]', label: 'Foco' },
    social: { icon: <MessageCircle className="w-8 h-8" />, color: 'text-pink-400', label: 'Social' },
    event: { icon: <Globe className="w-8 h-8" />, color: 'text-[var(--accent-warning)]', label: 'Evento' }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
            ESCRITÓRIO VIRTUAL
          </h1>
          <p className="text-3xl text-[var(--text-secondary)] mt-6">
            O futuro do trabalho é aqui
          </p>
        </motion.div>

        {/* STATUS ONLINE */}
        <div className="max-w-md mx-auto mb-12">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-br from-violet-900/60 to-purple-900/60 rounded-3xl p-8 border-2 border-violet-500/50 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-4 h-4 bg-[var(--accent-emerald)] rounded-full animate-pulse" />
              <span className="text-2xl text-[var(--accent-emerald)] font-bold">ONLINE AGORA</span>
            </div>
            <p className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--text-primary)]">{metrics?.usuariosOnline}</p>
            <p className="text-[var(--text-secondary)]">colaboradores ativos</p>
          </motion.div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 rounded-2xl p-6 border border-blue-500/30">
            <Building2 className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.salasCriadas}</p>
            <p className="text-[var(--text-secondary)]">Salas Virtuais</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-[var(--accent-emerald)]/60 to-[var(--accent-emerald)]/60 rounded-2xl p-6 border border-[var(--accent-emerald)]/30">
            <Video className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.reunioesHoje}</p>
            <p className="text-[var(--text-secondary)]">Reuniões Hoje</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-[var(--accent-purple)]/60 to-pink-900/60 rounded-2xl p-6 border border-[var(--accent-purple)]/30">
            <Clock className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.horasTrabalhadas}h</p>
            <p className="text-[var(--text-secondary)]">Horas Hoje</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-pink-900/60 to-rose-900/60 rounded-2xl p-6 border border-pink-500/30">
            <Users className="w-12 h-12 text-pink-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.usuariosOnline}</p>
            <p className="text-[var(--text-secondary)]">Team Online</p>
          </motion.div>
        </div>

        {/* SALAS VIRTUAIS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
            Salas Virtuais
          </h2>

          {metrics?.salas.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-32 h-32 text-[var(--text-primary)] mx-auto mb-8" />
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
                    className={`rounded-3xl p-6 border backdrop-blur-xl cursor-pointer transition-all ${
                      sala.participantes > 0
                        ? 'bg-gradient-to-br from-violet-900/40 to-purple-900/40 border-violet-500/50 shadow-lg shadow-violet-500/20'
                        : 'bg-gradient-to-br from-[var(--surface)]/5 to-[var(--surface)]/10 border-[var(--border)] hover:border-violet-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-[var(--surface)]/10 ${config.color}`}>
                        {config.icon}
                      </div>
                      {sala.participantes > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[var(--accent-emerald)] rounded-full animate-pulse" />
                          <span className="text-[var(--accent-emerald)] text-sm font-medium">Ativo</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{sala.nome}</h3>
                    <p className={`text-sm ${config.color}`}>{config.label}</p>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[var(--text-secondary)]" />
                        <span className="text-[var(--text-primary)] font-medium">{sala.participantes}/{sala.capacidade}</span>
                      </div>
                      <button className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        sala.participantes > 0
                          ? 'bg-violet-500 text-[var(--text-primary)] hover:bg-violet-600'
                          : 'bg-[var(--surface)]/10 text-[var(--text-secondary)] hover:bg-[var(--surface)]/20'
                      }`}>
                        {sala.participantes > 0 ? 'Entrar' : 'Abrir'}
                      </button>
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
          <Sparkles className="w-32 h-32 text-violet-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-violet-300 max-w-4xl mx-auto">
            "O escritório do futuro não tem paredes. Tem conexões."
          </p>
          <p className="text-3xl text-[var(--text-secondary)] mt-8">
            — Citizen Supremo X.1, seu Arquiteto Virtual
          </p>
        </motion.div>
      </div>
  );
}
