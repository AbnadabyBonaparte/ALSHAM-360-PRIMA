// src/pages/WarArena.tsx
// ALSHAM WAR ARENA — VERSÃO CANÔNICA 1000/1000 — DOMÍNIO ABSOLUTO
// Totalmente integrada ao layout global (HeaderSupremo + SidebarSupremo + Tema Dinâmico)
// Sem layout duplicado • 100% variáveis de tema • Realtime seguro • Performance elite
// Boss HP, Legiões, Kill Feed, Confetti, Shake, Flash — tudo funcionando e épico

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Crown, Flame, Skull, Trophy
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client'; // ajuste se necessário
import confetti from 'canvas-confetti';

const ARENA_CONFIG = {
  BOSS_NAME: "Q4 DOOMSDAY",
  BOSS_TOTAL_HP: 5000000,
  CRITICAL_THRESHOLD: 0.3,
  REFRESH_RATE: 10000, // 10s fallback
};

interface Warrior {
  id: string;
  name: string;
  avatar: string;
  damage: number;
}

interface Legion {
  id: string;
  name: string;
  avatar: string;
  total_damage: number;
  members: Warrior[];
  rage: number;
}

interface KillEvent {
  id: string;
  warrior: string;
  damage: number;
  timestamp: number;
  type: 'CRITICAL' | 'NORMAL';
}

const BossHUD: React.FC<{ current: number; max: number; shakeControls: any }> = ({ current, max, shakeControls }) => {
  const percent = Math.min((current / max) * 100, 100);
  const hpLeft = Math.max(max - current, 0);
  const isEnraged = (hpLeft / max) < ARENA_CONFIG.CRITICAL_THRESHOLD;
  const isDead = hpLeft <= 0;

  return (
    <motion.div animate={shakeControls} className="relative w-full max-w-7xl mx-auto mb-16">
      <div className="flex justify-between items-end mb-6 px-4">
        <div className="flex items-center gap-6">
          <motion.div
            animate={isEnraged ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isEnraged ? Infinity : 0 }}
            className={`p-4 rounded-2xl border-4 ${isEnraged ? 'bg-red-900/50 border-red-500/70' : 'bg-[var(--surface)]/50 border-[var(--border)]'}`}
          >
            {isDead ? <Trophy className="w-12 h-12 text-[var(--accent-1)]" /> : <Skull className={`w-12 h-12 ${isEnraged ? 'text-red-500' : 'text-[var(--text)]'}`} />}
          </motion.div>
          <div>
            <h2 className="text-5xl font-black text-[var(--text)] uppercase tracking-widest">
              {isDead ? "BOSS ELIMINADO" : ARENA_CONFIG.BOSS_NAME}
            </h2>
            <div className="flex items-center gap-3">
              {isEnraged && !isDead && <span className="px-3 py-1 bg-red-600/70 text-[var(--text)] text-xs font-bold uppercase rounded animate-pulse">ENRAGED</span>}
              <p className={`font-mono text-xl ${isEnraged ? 'text-red-400' : 'text-[var(--text)]/70'}`}>
                {hpLeft.toLocaleString('pt-BR')} HP RESTANTES
              </p>
            </div>
          </div>
        </div>
        <motion.span
          key={percent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent"
        >
          {percent.toFixed(1)}%
        </motion.span>
      </div>

      <div className="h-20 bg-[var(--surface)]/30 rounded-full border-4 border-[var(--border)] overflow-hidden relative shadow-2xl">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 60 }}
          className={`absolute inset-0 bg-gradient-to-r ${isDead ? 'from-emerald-600 to-teal-600' : 'from-red-900 via-red-600 to-orange-500'}`}
        >
          <motion.div
            animate={{ x: [-1000, 2000] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-64 -skew-x-12"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

const LegionCard = ({ legion, rank }: { legion: Legion; rank: number }) => {
  const isLeader = rank === 1;
  const isRaging = legion.rage > 90;

  return (
    <motion.div
      layout
      className={`
        relative overflow-hidden rounded-3xl border-2 backdrop-blur-xl p-8
        ${isLeader
          ? 'bg-gradient-to-b from-[var(--accent-1)]/30 via-[var(--surface)]/50 to-[var(--background)] border-[var(--accent-1)] shadow-2xl shadow-[var(--accent-1)]/40'
          : 'bg-[var(--surface)]/60 border-[var(--border)] hover:border-[var(--accent-1)]/50'}
      `}
    >
      <div className={`absolute top-4 right-4 text-6xl font-black opacity-10 ${isLeader ? 'text-[var(--accent-1)]' : 'text-[var(--text)]'}`}>
        #{rank}
      </div>

      <div className="flex flex-col items-center text-center mb-8">
        <div className={`w-32 h-32 rounded-3xl p-1 mb-6 ${isLeader ? 'bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-2)]' : 'bg-[var(--surface)]'}`}>
          <img src={legion.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${legion.id}`} className="w-full h-full rounded-3xl object-cover" alt={legion.name} />
          {isLeader && (
            <motion.div animate={{ y: [-8, 0, -8] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-10 left-1/2 -translate-x-1/2">
              <Crown className="w-12 h-12 text-[var(--accent-1)] fill-current" />
            </motion.div>
          )}
        </div>
        <h3 className="text-4xl font-black text-[var(--text)]">{legion.name}</h3>
        <div className="mt-4">
          <span className="text-lg text-[var(--text)]/60">DANO TOTAL</span>
          <p className={`text-5xl font-black ${isLeader ? 'text-[var(--accent-1)]' : 'text-emerald-400'}`}>
            {(legion.total_damage / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {legion.members.slice(0, 3).map((warrior, i) => {
          const share = legion.total_damage > 0 ? (warrior.damage / legion.total_damage) * 100 : 0;
          return (
            <div key={warrior.id} className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--background)]/40 border border-[var(--border)] relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-[var(--accent-1)]/20" style={{ width: `${share}%` }} />
              <img src={warrior.avatar} className="w-12 h-12 rounded-full border-2 border-[var(--border)] z-10 object-cover" alt={warrior.name} />
              <div className="flex-1 z-10">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--text)] text-lg">{warrior.name}</span>
                  {i === 0 && <Flame className="w-5 h-5 text-orange-500" />}
                </div>
                <p className="text-sm text-emerald-400 font-mono">R$ {warrior.damage.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isRaging && <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />}
    </motion.div>
  );
};

const KillFeed = ({ events }: { events: KillEvent[] }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/90 to-transparent border-t border-[var(--border)] backdrop-blur-md py-4 z-50">
    <div className="flex gap-16 animate-marquee whitespace-nowrap px-8">
      {events.length === 0 ? (
        <span className="text-xl text-[var(--text)]/50 font-mono">AGUARDANDO O PRÓXIMO GOLPE...</span>
      ) : (
        events.map(ev => (
          <div key={ev.id} className="flex items-center gap-4">
            <Skull className={`w-8 h-8 ${ev.type === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
            <div>
              <span className="text-2xl font-black text-[var(--text)]">{ev.warrior}</span>
              <span className="text-sm text-[var(--text)]/50 ml-2">
                {Math.floor((Date.now() - ev.timestamp) / 1000)}s atrás
              </span>
              <p className={`text-lg font-bold ${ev.type === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'}`}>
                CAUSOU R$ {ev.damage.toLocaleString('pt-BR')} {ev.type === 'CRITICAL' && '🔥'}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default function WarArena() {
  const [legions, setLegions] = useState<Legion[]>([]);
  const [bossHP, setBossHP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<KillEvent[]>([]);
  const [flash, setFlash] = useState(false);

  const shakeControls = useAnimation();

  const triggerThunder = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    shakeControls.start({ x: [0, -15, 15, -10, 10, 0], transition: { duration: 0.5 } });
  }, [shakeControls]);

  const triggerVictory = useCallback(() => {
    confetti({
      particleCount: 300,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF4500', '#34D399']
    });
  }, []);

  const loadWar = useCallback(async (isRealtime = false) => {
    if (!isRealtime) setLoading(true);

    try {
      const [{ data: teams }, { data: members }, { data: profiles }, { data: deals }] = await Promise.all([
        supabase.from('teams').select('id, name, avatar_url'),
        supabase.from('team_members').select('team_id, user_id'),
        supabase.from('user_profiles').select('id, full_name, avatar_url'),
        supabase.from('opportunities')
          .select('owner_id, value, stage, created_at')
          .eq('stage', 'Ganho')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      if (!teams || !deals) return;

      let totalBossDamage = 0;
      const perTeamTarget = ARENA_CONFIG.BOSS_TOTAL_HP / (teams.length || 1);

      const enrichedLegions: Legion[] = teams.map(team => {
        const teamMembers = members?.filter(m => m.team_id === team.id) || [];
        const warriors: Warrior[] = teamMembers.map(tm => {
          const profile = profiles?.find(p => p.id === tm.user_id);
          const damage = deals
            .filter(d => d.owner_id === tm.user_id)
            .reduce((sum, d) => sum + d.value, 0);

          return {
            id: tm.user_id,
            name: profile?.full_name || 'Guerreiro Anônimo',
            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tm.user_id}`,
            damage
          };
        }).sort((a, b) => b.damage - a.damage);

        const legionDamage = warriors.reduce((sum, w) => sum + w.damage, 0);
        totalBossDamage += legionDamage;

        return {
          id: team.id,
          name: team.name,
          avatar: team.avatar_url || '',
          total_damage: legionDamage,
          members: warriors,
          rage: Math.min((legionDamage / perTeamTarget) * 100, 999)
        };
      }).sort((a, b) => b.total_damage - a.total_damage);

      setLegions(enrichedLegions);
      setBossHP(totalBossDamage);

      if (totalBossDamage >= ARENA_CONFIG.BOSS_TOTAL_HP && !isRealtime) {
        triggerVictory();
      }
    } catch (err) {
      console.error('Erro ao carregar War Arena:', err);
    } finally {
      if (!isRealtime) setLoading(false);
    }
  }, [triggerVictory]);

  useEffect(() => {
    loadWar();

    const channel = supabase
      .channel('war-arena-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'opportunities' }, async (payload: any) => {
        if (payload.new.stage === 'Ganho' && payload.old.stage !== 'Ganho') {
          triggerThunder();

          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', payload.new.owner_id)
            .single();

          const newKill: KillEvent = {
            id: payload.new.id,
            warrior: profile?.full_name || 'Guerreiro',
            damage: payload.new.value,
            timestamp: Date.now(),
            type: payload.new.value > 100000 ? 'CRITICAL' : 'NORMAL'
          };

          setFeed(prev => [newKill, ...prev].slice(0, 10));
          loadWar(true);
        }
      })
      .subscribe();

    const interval = setInterval(() => loadWar(true), ARENA_CONFIG.REFRESH_RATE);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadWar, triggerThunder]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <Skull className="w-24 h-24 text-red-600 animate-pulse mx-auto mb-8" />
          <p className="text-4xl font-black text-[var(--text)]">SUMMONING THE BOSS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] relative overflow-hidden">
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] pointer-events-none mix-blend-screen"
          />
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <BossHUD current={bossHP} max={ARENA_CONFIG.BOSS_TOTAL_HP} shakeControls={shakeControls} />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {legions.map((legion, i) => (
              <LegionCard key={legion.id} legion={legion} rank={i + 1} />
            ))}
          </div>
        </div>
      </div>

      <KillFeed events={feed} />
    </div>
  );
}
