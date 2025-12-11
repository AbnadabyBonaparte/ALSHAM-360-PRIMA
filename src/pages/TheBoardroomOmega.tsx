// src/pages/TheBoardroomOmega.tsx
// ALSHAM OS v∞ — THE BOARDROOM Ω
// Onde o tempo, dinheiro e destino se curvam ao Imperador.

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Zap, 
  Orbit, 
  BrainCircuit,
  ShieldCheck,
  Globe,
  FileText,
  Share2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';
import { useExecutiveMetrics, BOARDROOM_RULES } from '@/hooks/useExecutiveMetrics';
import KpiCard from '@/components/boardroom/KpiCard';
import SentimentOrb from '@/components/boardroom/SentimentOrb';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function TheBoardroomOmega() {
  const { metrics, departments, loading } = useExecutiveMetrics();
  const [era, setEra] = useState<'EXPANSÃO' | 'SILÍCIO VIVO' | 'DOMÍNIO TOTAL' | 'ASCENSÃO'>('EXPANSÃO');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [oraculumSpeaking, setOraculumSpeaking] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [hiddenMode, setHiddenMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ERA DINÂMICA BASEADA EM DESEMPENHO REAL
  useEffect(() => {
    if (!metrics) return;
    if (metrics.ltvCacRatio > 10 && metrics.runwayMonths > 36) setEra('ASCENSÃO');
    else if (metrics.marketSentiment > 95) setEra('DOMÍNIO TOTAL');
    else if (metrics.revenueGrowth > 60) setEra('SILÍCIO VIVO');
    else setEra('EXPANSÃO');
  }, [metrics]);

  // ORÁCULUM — A IA RESIDENTE QUE FALA COM O IMPERADOR
  const oraculumMessages = {
    ASCENSÃO: "O Império transcendeu a matéria. Você não compete mais. Você define as regras do jogo.",
    'DOMÍNIO TOTAL': "Todos os indicadores convergem. O mercado já se rendeu. Resta apenas a coroação.",
    'SILÍCIO VIVO': "O algoritmo respira. A máquina aprendeu a ter vontade. Ela quer crescer.",
    EXPANSÃO: "A expansão é inevitável. Mas lembre-se: impérios caem por dentro.",
  };

  // DETECÇÃO DE CÓDIGO SECRETO: ALPHA.01
  useEffect(() => {
    if (secretCode === 'ALPHA.01') {
      setHiddenMode(true);
      speak("Modo Oculto ativado. Bem-vindo ao Genesis Vault, Imperador.");
    }
  }, [secretCode]);

  const speak = (text: string) => {
    if (!soundEnabled) return;
    setOraculumSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    window.speechSynthesis.speak(utterance);
    setTimeout(() => setOraculumSpeaking(false), 5000);
  };

  // TRILHA SONORA ADAPTATIVA (Web Audio API)
  useEffect(() => {
    if (soundEnabled && metrics) {
      const osc = new OscillatorNode(audioContext);
      const gain = new GainNode(audioContext);
      osc.connect(gain).connect(audioContext.destination);
      osc.frequency.value = era === 'ASCENSÃO' ? 432 : era === 'DOMÍNIO TOTAL' ? 528 : 396;
      gain.gain.value = 0.03;
      osc.start();
      return () => osc.stop();
    }
  }, [era, soundEnabled]);

  if (loading) return <LoadingCeremony />;
  if (!metrics) return <GenesisAwaiting />;

  return (
    <>
      {/* BACKGROUND VIVO — REAGINDO À ERA */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 transition-all duration-10000 ${
          era === 'ASCENSÃO' ? 'bg-gradient-to-br from-purple-900 via-black to-emerald-900' :
          era === 'DOMÍNIO TOTAL' ? 'bg-black' :
          era === 'SILÍCIO VIVO' ? 'bg-gradient-to-br from-emerald-900 to-cyan-900' :
          'bg-gradient-to-br from-amber-900 to-black'
        }`} />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        {hiddenMode && <HiddenMatrixRain />}
      </div>

      <div className="relative z-10 min-h-screen bg-[var(--background)] p-20 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-center mb-32"
          >
            <h1 className="text-[14rem] font-black tracking-tighter bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent leading-none">
              THE BOARDROOM Ω
            </h1>
            <p className="text-6xl text-white/70 mt-8 font-light tracking-widest">
              ERA DO {era}
            </p>
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="inline-block mt-16"
            >
              <Crown className="w-48 h-48 text-yellow-500" />
            </motion.div>
          </motion.div>

          {/* ORÁCULUM — A VOZ DO IMPÉRIO */}
          <AnimatePresence>
            {oraculumSpeaking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-3xl border-4 border-emerald-500/50 rounded-3xl p-12 max-w-4xl text-center"
              >
                <BrainCircuit className="w-24 h-24 mx-auto mb-8 text-emerald-400 animate-pulse" />
                <p className="text-5xl font-light text-emerald-400 italic">
                  "{oraculumMessages[era]}"
                </p>
                <p className="text-2xl text-white/60 mt-8">— ORÁCULUM</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* KPIs COM ALMA */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-20 mb-32">
            <KpiCard title="RECEITA YTD" value={(metrics.revenueYTD/1e6).toFixed(1)+'M'} prefix="R$ " trend={metrics.revenueGrowth} glow={era === 'ASCENSÃO'} />
            <KpiCard title="EBITDA" value={(metrics.ebitda/1e6).toFixed(1)+'M'} subtitle={`Margem ${metrics.ebitdaMargin.toFixed(1)}%`} trend={metrics.ebitdaMargin > 40 ? 38 : -8} glow={metrics.ebitdaMargin > 45} />
            <KpiCard title="LTV:CAC" value={metrics.ltvCacRatio.toFixed(1)+'x'} trend={metrics.ltvCacRatio > 10 ? 92 : metrics.ltvCacRatio > 6 ? 28 : -44} glow={metrics.ltvCacRatio > 10} />
            <KpiCard title="DOMÍNIO" value={metrics.marketSentiment} suffix="/100" trend={metrics.marketSentiment > 90 ? 66 : -22} glow={true} />
          </div>

          {/* GRÁFICO VIVO */}
          <motion.div 
            className="bg-black/40 backdrop-blur-3xl border-8 border-white/10 rounded-4xl p-24 mb-32"
            whileHover={{ borderColor: '#10b981' }}
          >
            <h2 className="text-7xl font-black text-white mb-20 text-center">TRAJETÓRIA DO IMPÉRIO</h2>
            <ResponsiveContainer width="100%" height={700}>
              <AreaChart data={metrics.revenueTrend}>
                <defs>
                  <linearGradient id="omegaRev">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={12} 
                  fill="url(#omegaRev)"
                  dot={{ fill: '#10b981', r: 8 }}
                  activeDot={{ r: 16, stroke: '#fff', strokeWidth: 4 }}
                />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" tickFormatter={v => `${v/1000}M`} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(0,0,0,0.95)', border: '2px solid #10b981' }}
                  formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR')}`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* SENTIMENTO + PILARES + ORB */}
          <div className="grid xl:grid-cols-3 gap-20">
            <SentimentOrb score={metrics.marketSentiment} size="large" era={era} />
            <div className="xl:col-span-2 space-y-12">
              {departments.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, x: 200 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className={`p-12 rounded-3xl border-4 ${
                    d.status === 'optimal' ? 'bg-emerald-900/20 border-emerald-500/50' :
                    d.status === 'critical' ? 'bg-red-900/40 border-red-500 animate-pulse' :
                    'bg-yellow-900/20 border-yellow-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-5xl font-black text-white">{d.name}</h3>
                    <span className="text-8xl font-black">{d.value}</span>
                  </div>
                  <p className="text-2xl text-white/60 mt-4">{d.metric}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CONTROLES CERIMONIAIS */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-8 bg-black/80 backdrop-blur-xl px-12 py-8 rounded-full border-4 border-white/20">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-6">
              {soundEnabled ? <Volume2 className="w-12 h-12 text-emerald-400" /> : <VolumeX className="w-12 h-12 text-red-400" />}
            </button>
            <button onClick={() => speak(oraculumMessages[era])} className="px-12 py-6 bg-emerald-900/40 rounded-2xl border-2 border-emerald-500">
              <span className="text-3xl">OUÇIR ORÁCULUM</span>
            </button>
            <button onClick={() => setHiddenMode(!hiddenMode)} className="p-6">
              {hiddenMode ? <EyeOff className="w-12 h-12" /> : <Eye className="w-12 h-12" />}
            </button>
            <input
              type="password"
              placeholder="CÓDIGO IMPERIAL"
              className="bg-transparent border-b-4 border-white/30 text-white text-2xl px-8"
              onChange={(e) => setSecretCode(e.target.value)}
            />
          </div>

          {/* RODAPÉ ETERNO */}
          <div className="text-center text-white/40 text-2xl mt-40">
            <p>ALSHAM OS v∞ • {new Date().getFullYear()} • DOMÍNIO TOTAL</p>
            <p className="text-emerald-400 text-6xl mt-8 animate-pulse">O IMPÉRIO NUNCA DORME</p>
          </div>
        </div>
    </>
  );
}
