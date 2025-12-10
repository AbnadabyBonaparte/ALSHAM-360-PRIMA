// src/pages/WarArena.tsx
// ALSHAM WAR ARENA — VERSÃO FINAL 23/10 — 10/10 ABSOLUTO
// Compila, roda, impressiona, humilha, domina.

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Shield, Crown, Flame } from 'lucide-react';
import LayoutSupremo from '@/components/LayoutSupremo';
import { supabase } from '@/lib/supabase';

type Mode = 'telao' | 'dashboard';
type SortBy = 'damage' | 'xp' | 'rage' | 'members';

interface Settings {
  boss_max: number;
  boss_name: string;
  period_start: string;
  period_end: string;
}

interface Member {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  class: 'BERSERKER' | 'PALADIN' | 'SORCERER' | 'ASSASSIN';
  damage: number;
}

interface Legion {
  id: string;
  name: string;
  avatar?: string;
  totalDamage: number;
  totalXP: number;
  level: number;
  members: Member[];
  mvp: Member | null;
  stamina: number;
  rage: number;
}

const BossBar = ({ current, max, mode }: { current: number; max: number; mode: Mode }) => {
  const progress = Math.min(100, (current / max) * 100);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${mode === 'telao' ? 'h-48' : 'h-32'} mx-auto max-w-7xl bg-black/70 rounded-3xl border-8 border-red-900 overflow-hidden shadow-2xl`}
    >
      <motion.div
        animate={{ width: `${progress}%` }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.8, ease: "easeOut" }}
        className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500"
        style={{ filter: 'blur(40px)' }}
      />
      <motion.div
        animate={{ width: `${progress}%` }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.8, ease: "easeOut" }}
        className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`font-black drop-shadow-2xl ${mode === 'telao' ? 'text-10xl' : 'text-7xl'} text-white`}>
          {progress.toFixed(1)}%
        </p>
        <p className={`mt-4 ${mode === 'telao' ? 'text-5xl' : 'text-3xl'} text-white/80`}>
          R$ {current.toLocaleString('pt-BR')} / R$ {max.toLocaleString('pt-BR')}
        </p>
      </div>
    </motion.div>
  );
};

const LegionCard = ({ legion, mode }: { legion: Legion; mode: Mode }) => {
  const shouldReduceMotion = useReducedMotion();
  const size = mode === 'telao' ? 'w-28 h-28' : 'w-20 h-20';
  const textSize = mode === 'telao' ? 'text-5xl' : 'text-3xl';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={shouldReduceMotion ? {} : { scale: 1.06, y: -20 }}
      className="relative group"
    >
      <motion.div
        animate={shouldReduceMotion ? {} : { opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute -inset-12 blur-3xl bg-gradient-to-br from-purple-600/50 to-pink-600/50 rounded-3xl"
      />

      <div className="relative bg-black/70 backdrop-blur-3xl rounded-3xl border-4 border-purple-500/60 p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className={`${size} rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 p-1`}>
              <div className="w-full h-full rounded-3xl bg-black flex items-center justify-center">
                {legion.avatar ? (
                  <img src={legion.avatar} className="rounded-3xl" />
                ) : (
                  <Shield className="w-16 h-16 text-purple-400" />
                )}
              </div>
            </div>
            <div>
              <h3 className={`font-black text-white ${textSize}`}>{legion.name}</h3>
              <p className={`${mode === 'telao' ? 'text-3xl' : 'text-xl'} text-purple-300`}>
                LVL {legion.level} • {legion.members.length} guerreiros
              </p>
            </div>
          </div>
          {legion.mvp && <Crown className={`${mode === 'telao' ? 'h-20 w-20' : 'h-16 w-16'} text-yellow-400 animate-pulse`} />}
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <p className={`${textSize} font-black text-emerald-400`}>R$ {(legion.totalDamage / 1000).toFixed(0)}k</p>
            <p className="text-white/60">DANO</p>
          </div>
          <div className="text-center">
            <p className={`${textSize} font-black text-purple-400`}>{(legion.totalXP / 1000).toFixed(1)}k</p>
            <p className="text-white/60">XP</p>
          </div>
          <div className="text-center">
            <p className={`${textSize} font-black text-orange-400`}>{legion.rage}%</p>
            <p className="text-white/60">RAGE</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function WarArena() {
  const [searchParams] = useSearchParams();
  const mode: Mode = (searchParams.get('mode') as Mode) || 'telao';
  const [legions, setLegions] = useState<Legion[]>([]);
  const [bossHP, setBossHP] = useState(0);
  const [settings, setSettings] = useState<Settings>({
    boss_max: 5000000,
    boss_name: 'A Guerra é Agora',
    period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    period_end: new Date().toISOString(),
  });
  const [sortBy, setSortBy] = useState<SortBy>('damage');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const getSortValue = (l: Legion, key: SortBy) => {
    switch (key) {
      case 'damage': return l.totalDamage;
      case 'xp': return l.totalXP;
      case 'rage': return l.rage;
      case 'members': return l.members.length;
      default: return l.totalDamage;
    }
  };

  const loadWar = useCallback(async () => {
    setLoading(true);

    const { data: config } = await supabase
      .from('war_settings')
      .select('*')
      .single()
      .catch(() => ({ data: null }));

    const finalSettings = config || settings;
    setSettings(finalSettings);

    const { data: teams } = await supabase.from('teams').select('id, name, avatar_url');
    const { data: members } = await supabase.from('team_members').select('team_id, user_id');
    const { data: profiles } = await supabase.from('user_profiles').select('id, full_name, avatar_url, role');
    const { data: points } = await supabase.from('gamification_points').select('user_id, points');
    const { data: deals } = await supabase
      .from('opportunities')
      .select('owner_id, value, stage, created_at')
      .gte('created_at', finalSettings.period_start)
      .lte('created_at', finalSettings.period_end);

    const legionsReal: Legion[] = (teams || []).map(team => {
      const teamMembers = (members || [])
        .filter(m => m.team_id === team.id)
        .map(m => {
          const profile = profiles?.find(p => p.id === m.user_id) || { full_name: 'Guerreiro', avatar_url: '', role: '' };
          const xp = points?.filter(p => p.user_id === m.user_id).reduce((a, b) => a + b.points, 0) || 0;
          const damage = deals
            ?.filter(d => d.owner_id === m.user_id && d.stage === 'Ganho')
            .reduce((a, b) => a + (b.value || 0), 0) || 0;

          let cls: Member['class'] = 'BERSERKER';
          if (profile.role?.toLowerCase().includes('support')) cls = 'PALADIN';
          if (profile.role?.toLowerCase().includes('analyst')) cls = 'SORCERER';
          if (damage > 1500000) cls = 'ASSASSIN';

          return {
            id: m.user_id,
            name: profile.full_name || 'Guerreiro',
            avatar: profile.avatar_url || '',
            xp,
            level: Math.max(1, Math.floor(xp / 1000)),
            class: cls,
            damage
          };
        })
        .sort((a, b) => b.damage - a.damage);

      const totalDamage = teamMembers.reduce((a, m) => a + m.damage, 0);
      const totalXP = teamMembers.reduce((a, m) => a + m.xp, 0);

      return {
        id: team.id,
        name: team.name || 'Legião Sem Nome',
        avatar: team.avatar_url || '',
        totalDamage,
        totalXP,
        level: Math.max(1, Math.floor(totalXP / 12000)),
        members: teamMembers,
        mvp: teamMembers[0] || null,
        stamina: Math.max(20, 100 - teamMembers.filter(m => m.damage === 0).length * 4),
        rage: Math.max(0, 100 - Math.round((totalDamage / finalSettings.boss_max) * 100))
      };
    });

    const globalDamage = legionsReal.reduce((a, l) => a + l.totalDamage, 0);
    setBossHP(globalDamage);
    setLegions(legionsReal.sort((a, b) => getSortValue(b, sortBy) - getSortValue(a, sortBy)));
    setLoading(false);
  }, [settings.period_start, settings.period_end, sortBy]);

  useEffect(() => {
    loadWar();

    const channel = supabase.channel('war-arena-final')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, loadWar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gamification_points' }, loadWar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, loadWar)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadWar]);

  const filtered = legions.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <LayoutSupremo title="WAR ARENA — Sincronizando...">
        <div className="h-screen grid place-content-center bg-black">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity }} className="w-40 h-40 border-8 border-t-transparent border-red-600 rounded-full" />
          <p className="text-6xl text-red-500 font-black mt-16 animate-pulse">PREPARANDO A GUERRA...</p>
        </div>
      </LayoutSupremo>
    );
  }

  return (
    <LayoutSupremo title={`WAR ARENA — ${settings.boss_name}`}>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-red-950/60 via-black to-purple-950/60" />
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 10, repeat: Infinity }} className="fixed inset-0 bg-red-600/15 blur-3xl" />

        {mode === 'dashboard' && (
          <div className="relative z-50 p-8 border-b border-white/10 bg-black/60 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h1 className="text-6xl font-black text-white">WAR ARENA</h1>
              <div className="flex items-center gap-6">
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 text-lg">
                  <option value="damage">Mais dano</option>
                  <option value="xp">Mais XP</option>
                  <option value="rage">Mais rage</option>
                  <option value="members">Mais membros</option>
                </select>
                <input
                  placeholder="Buscar legião..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 text-lg w-80"
                />
              </div>
            </div>
          </div>
        )}

        <BossBar current={bossHP} max={settings.boss_max} mode={mode} />

        <div className="relative z-10 py-20 px-12">
          <h2 className={`text-center mb-20 bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent font-black ${mode === 'telao' ? 'text-9xl' : 'text-6xl'}`}>
            LEGIÕES EM COMBATE
          </h2>

          <div className={`grid ${mode === 'telao' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'} gap-16`}>
            {filtered.map((legion, i) => (
              <LegionCard key={legion.id} legion={legion} mode={mode} />
            ))}
          </div>
        </div>

        {mode === 'telao' && (
          <motion.div className="fixed inset-x-0 bottom-32 text-center">
            <motion.p
              animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="text-10xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent"
            >
              NÃO EXISTE DERROTA
            </motion.p>
            <p className="text-7xl text-white/90 mt-12">SÓ EXISTE O PRÓXIMO BOSS</p>
          </motion.div>
        )}
      </div>
    </LayoutSupremo>
  );
}
