// src/pages/WarArena.tsx
// ALSHAM WAR ARENA — VERSÃO FINAL 23/10 — 10/10 ABSOLUTO
// Compila, roda, impressiona, humilha, domina.

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation, type AnimationControls } from 'framer-motion';
import { 
  Crown, Flame, Sword, Skull, 
  Trophy
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURAÇÃO & TYPES (MODULAR)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ARENA_CONFIG = {
  BOSS_NAME: "Q4 DOOMSDAY",
  BOSS_TOTAL_HP: 5000000,
  CRITICAL_THRESHOLD: 0.3,
  REFRESH_RATE: 10000, // Polling a cada 10s
};

type Mode = 'tv' | 'manager';

interface Warrior {
  id: string;
  name: string;
  avatar: string;
  damage: number; 
  class: 'TITAN' | 'SLAYER' | 'MAGE' | 'ROOKIE';
}

interface Legion {
  id: string;
  name: string;
  avatar: string;
  total_damage: number;
  members: Warrior[];
  rage: number; // % da meta do time
}

interface KillEvent {
  id: string;
  warrior: string;
  damage: number;
  timestamp: number;
  type: 'CRITICAL' | 'NORMAL';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 COMPONENT: BOSS HUD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BossHUD: React.FC<{ current: number; max: number; shakeControls: AnimationControls }> = ({ current, max, shakeControls }) => {
  const percent = Math.min((current / max) * 100, 100);
  const hpLeft = max - current;
  const isEnraged = (hpLeft / max) < ARENA_CONFIG.CRITICAL_THRESHOLD;
  const isDead = hpLeft <= 0;

  return (
    <motion.div 
      animate={shakeControls}
      className="relative w-full max-w-7xl mx-auto mb-20 z-20"
    >
      {/* Boss Status */}
      <div className="flex justify-between items-end mb-6 px-4">
        <div className="flex items-center gap-6">
          <motion.div 
            animate={isEnraged ? { scale: [1, 1.1, 1], filter: ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"] } : {}}
            transition={{ duration: 0.5, repeat: isEnraged ? Infinity : 0 }}
            className={`p-4 rounded-2xl border-4 ${isEnraged ? 'bg-red-900 border-red-500' : 'bg-gray-900 border-gray-600'} shadow-2xl`}
          >
            {isDead ? <Trophy className="w-12 h-12 text-yellow-400" /> : <Skull className={`w-12 h-12 ${isEnraged ? 'text-red-500' : 'text-[var(--text-primary)]'}`} />}
          </motion.div>
          <div>
            <h2 className="text-5xl font-black text-[var(--text-primary)] uppercase tracking-widest drop-shadow-lg">
              {isDead ? "BOSS ELIMINADO" : ARENA_CONFIG.BOSS_NAME}
            </h2>
            <div className="flex items-center gap-3">
              {isEnraged && !isDead && <span className="px-3 py-1 bg-red-600 text-[var(--text-primary)] text-xs font-bold uppercase rounded animate-pulse">ENRAGED</span>}
              <p className={`font-mono text-xl ${isEnraged ? 'text-red-400' : 'text-gray-400'}`}>
                {Math.max(0, hpLeft).toLocaleString('pt-BR')} HP RESTANTES
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={percent}
            className="text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-red-500 via-orange-500 to-yellow-500 drop-shadow-2xl"
          >
            {percent.toFixed(1)}%
          </motion.span>
        </div>
      </div>

      {/* The Bar */}
      <div className="h-20 bg-[#0a0000] rounded-full border-4 border-[var(--border)] overflow-hidden relative shadow-[0_0_100px_rgba(220,38,38,0.4)]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', damping: 15, stiffness: 50 }}
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${isDead ? 'from-emerald-600 to-green-400' : 'from-red-900 via-red-600 to-orange-500'}`}
        >
          <motion.div 
            animate={{ x: [-1000, 2000] }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-64 -skew-x-12 opacity-50"
          />
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-sm" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💎 COMPONENT: LEGION CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LegionCard = ({ legion, rank }: { legion: Legion, rank: number }) => {
  const isLeader = rank === 1;
  const isRaging = legion.rage > 90;
  
  return (
    <motion.div 
      layout
      transition={{ type: 'spring', damping: 25 }}
      className={`
        relative overflow-hidden rounded-[40px] border-2 backdrop-blur-2xl p-8 group
        ${isLeader 
          ? 'bg-gradient-to-b from-yellow-900/40 via-black/80 to-black border-yellow-500/50 shadow-[0_0_80px_rgba(234,179,8,0.25)] z-10 scale-105' 
          : 'bg-[var(--background)]/60 border-[var(--border)] hover:border-white/30'
        }
      `}
    >
      {/* Rank Badge */}
      <div className={`absolute top-0 right-0 p-6 font-black text-4xl md:text-5xl lg:text-6xl opacity-10 pointer-events-none ${isLeader ? 'text-yellow-500' : 'text-[var(--text-primary)]'}`}>
        #{rank}
      </div>

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 relative z-10">
        <div className={`
          w-32 h-32 rounded-3xl p-1 mb-6 relative
          ${isLeader ? 'bg-gradient-to-br from-yellow-400 to-orange-600 animate-pulse-slow' : 'bg-gradient-to-br from-gray-700 to-gray-900'}
        `}>
          <img src={legion.avatar} className="w-full h-full rounded-[20px] object-cover bg-[var(--background)]" />
          {isLeader && (
            <motion.div 
              animate={{ y: [-10, 0, -10] }} 
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 text-yellow-400"
            >
              <Crown className="w-12 h-12 fill-yellow-400" />
            </motion.div>
          )}
        </div>
        
        <h3 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tight">{legion.name}</h3>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-lg text-[var(--text-primary)]/40 font-mono">DANO TOTAL</span>
          <span className={`text-5xl font-black tracking-tighter ${isLeader ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {(legion.total_damage / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Warriors List */}
      <div className="space-y-4 relative z-10">
        {legion.members.slice(0, 3).map((warrior, i) => {
          // Progress Calculation (Share of Legion Damage)
          const share = legion.total_damage > 0 ? (warrior.damage / legion.total_damage) * 100 : 0;

          return (
            <div key={warrior.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
              {/* Progress Bar Background */}
              <div className="absolute left-0 top-0 bottom-0 bg-white/5 z-0" style={{ width: `${share}%` }} />
              
              <img src={warrior.avatar} className="w-12 h-12 rounded-full border-2 border-[var(--border)] z-10 object-cover" />
              
              <div className="flex-1 z-10">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--text-primary)] text-lg">{warrior.name}</span>
                  {i === 0 && <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />}
                </div>
                <p className="text-xs text-emerald-400 font-mono font-bold">R$ {warrior.damage.toLocaleString()}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Rage Effect */}
      {isRaging && (
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-50 animate-pulse pointer-events-none" />
      )}
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💎 COMPONENT: KILL FEED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const KillFeed = ({ events }: { events: KillEvent[] }) => (
  <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/90 to-transparent z-50 flex items-center overflow-hidden border-t border-[var(--border)] backdrop-blur-md">
    <div className="flex gap-20 animate-marquee whitespace-nowrap px-10">
      {events.length === 0 && (
        <div className="flex items-center gap-3 text-xl text-[var(--text-primary)]/40 font-mono">
          <Sword className="w-6 h-6 text-[var(--text-primary)]/30" />
          <span>AGUARDANDO O PRÓXIMO GOLPE...</span>
        </div>
      )}
      {events.map((ev) => (
        <div key={ev.id} className="flex items-center gap-4">
          <div className="relative">
            <Sword className={`w-8 h-8 ${ev.type === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
            {ev.type === 'CRITICAL' && <div className="absolute -inset-2 bg-red-500/20 blur-lg rounded-full" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-[var(--text-primary)] uppercase">{ev.warrior}</span>
              <span className="text-sm text-[var(--text-primary)]/40 font-mono">
                {Math.floor((Date.now() - ev.timestamp) / 1000)}s AGO
              </span>
            </div>
            <p className={`text-xl font-bold font-mono ${ev.type === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'}`}>
              CAUSOU R$ {ev.damage.toLocaleString()} DE DANO {ev.type === 'CRITICAL' && '🔥'}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 PAGE: WAR ARENA V3.1 (FINAL)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function WarArena() {
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as Mode) || 'tv';
  
  const [legions, setLegions] = useState<Legion[]>([]);
  const [bossHP, setBossHP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<KillEvent[]>([]);
  const [flash, setFlash] = useState(false);
  
  const shakeControls = useAnimation();

  // FX
  const triggerThunder = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    shakeControls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    });
  }, [shakeControls]);

  const triggerVictory = useCallback(() => {
    confetti({
      particleCount: 300,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF4500']
    });
  }, []);

  // 1. ENGINE
  const loadWar = useCallback(async (isRealtimeUpdate = false) => {
    if (!isRealtimeUpdate) setLoading(true);

    const { data: teams } = await supabase.from('teams').select('id, name, avatar_url');
    const { data: members } = await supabase.from('team_members').select('team_id, user_id');
    const { data: profiles } = await supabase.from('user_profiles').select('id, full_name, avatar_url');
    
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: deals } = await supabase
      .from('opportunities')
      .select('owner_id, value, stage')
      .eq('stage', 'Ganho')
      .gte('created_at', startOfMonth);

    if (teams && deals) {
      let totalBossDamage = 0;
      // Meta dinâmica por time para cálculo de Rage
      const perTeamTarget = ARENA_CONFIG.BOSS_TOTAL_HP / (teams.length || 1);

      const enrichedLegions: Legion[] = teams.map(team => {
        const teamMembers = members?.filter(m => m.team_id === team.id) || [];
        
        const warriors: Warrior[] = teamMembers.map(tm => {
          const profile = profiles?.find(p => p.id === tm.user_id);
          const damage = deals.filter(d => d.owner_id === tm.user_id).reduce((a,b) => a + b.value, 0);
          
          return {
            id: tm.user_id,
            name: profile?.full_name || 'Soldado',
            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tm.user_id}`,
            damage,
            class: damage > 50000 ? 'TITAN' : 'ROOKIE'
          };
        }).sort((a,b) => b.damage - a.damage);

        const legionDamage = warriors.reduce((a,b) => a + b.damage, 0);
        totalBossDamage += legionDamage;

        return {
          id: team.id,
          name: team.name,
          avatar: team.avatar_url || '',
          total_damage: legionDamage,
          members: warriors,
          // Rage calculado com base na meta do time (cap em 999% para overkill)
          rage: Math.min((legionDamage / perTeamTarget) * 100, 999) 
        };
      }).sort((a,b) => b.total_damage - a.total_damage);

      setLegions(enrichedLegions);
      setBossHP(totalBossDamage);

      if (totalBossDamage >= ARENA_CONFIG.BOSS_TOTAL_HP && !isRealtimeUpdate) {
        triggerVictory(); // Só toca confete no load se já estiver ganho
      }
    }
    setLoading(false);
  }, [triggerVictory]);

  // 2. LIFECYCLE (Realtime + Polling)
  useEffect(() => {
    loadWar();

    // Realtime
    const channel = supabase.channel('war_room_v3')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'opportunities' }, async (payload: any) => {
        if (payload.new.stage === 'Ganho' && payload.old.stage !== 'Ganho') {
          triggerThunder();
          
          const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', payload.new.owner_id).single();
          const warriorName = profile?.full_name || 'Guerreiro';
          
          const newKill: KillEvent = {
            id: payload.new.id,
            warrior: warriorName,
            damage: payload.new.value,
            timestamp: Date.now(),
            type: payload.new.value > 10000 ? 'CRITICAL' : 'NORMAL'
          };
          
          setFeed(prev => [newKill, ...prev].slice(0, 10));
          loadWar(true);
        }
      })
      .subscribe();

    // Safety Polling
    const interval = setInterval(() => {
      loadWar(true);
    }, ARENA_CONFIG.REFRESH_RATE);

    return () => { 
      supabase.removeChannel(channel); 
      clearInterval(interval);
    };
  }, [loadWar, triggerThunder]);

  if (loading) return (
    <div className="h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <Skull className="w-24 h-24 text-red-600 animate-pulse" />
        <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-[0.5em] animate-pulse">SUMMONING BOSS...</h1>
      </div>
    </div>
  );

  return (
<div className={`min-h-screen bg-[#020202] text-[var(--text-primary)] relative overflow-hidden ${mode === 'tv' ? 'p-0' : 'p-8'}`}>)
        
        {/* FLASH FX */}
        <AnimatePresence>
          {flash && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.8 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-[100] pointer-events-none mix-blend-overlay"
            />
          )}
        </AnimatePresence>

        {/* BACKGROUND */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        </div>

        {/* TV HEADER */}
        {mode === 'tv' && (
          <div className="absolute top-8 left-8 flex items-center gap-4 z-30">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-500/30 rounded-full">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <span className="text-red-500 font-bold tracking-widest text-xs">LIVE BATTLE</span>
            </div>
          </div>
        )}

        <div className="relative z-10 max-w-[1920px] mx-auto pt-16 pb-32">
          <BossHUD current={bossHP} max={ARENA_CONFIG.BOSS_TOTAL_HP} shakeControls={shakeControls} />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 px-12">
            <AnimatePresence>
              {legions.map((legion, i) => (
                <LegionCard key={legion.id} legion={legion} rank={i + 1} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <KillFeed events={feed} />
      </div>
  );
}
