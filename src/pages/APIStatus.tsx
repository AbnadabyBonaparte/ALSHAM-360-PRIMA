src/pages/APIStatus.tsx

import React, { useEffect, useRef, useState } from 'react';
import { createSupremePage } from "@/components/SupremePageFactory";
import { supremeConfigs } from "./supremeConfigs";
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'; // Hook customizado
import { NeuralGraph } from '@/components/visualizations/NeuralGraph';
import { GlitchText } from '@/components/effects/GlitchText';
import { ReplayDebugger } from '@/components/dev/ReplayDebugger';

// Interfaces baseadas no Schema
interface SystemHealth {
  status: 'operational' | 'degraded' | 'critical';
  latency_ms: number;
  error_rate: number;
  active_incidents: number;
}

const APIStatusPage = () => {
  const [health, setHealth] = useState<SystemHealth>({ status: 'operational', latency_ms: 45, error_rate: 0.02, active_incidents: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isReplayOpen, setIsReplayOpen] = useState(false);

  // O "A-HA" Sonoro: Tocar som baseado no status
  // useAmbientSystemSound(health.status); 

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden font-sans relative" data-theme="glass-dark">
      
      {/* 1. Background Dinâmico (Particles/Grid) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <NeuralGraph active={health.status === 'operational'} />
      </div>

      {/* 2. Topo: HUD Global */}
      <header className="relative z-10 flex justify-between items-center p-6 backdrop-blur-md border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
            <span className="text-[var(--color-primary-from)]">THE SYNAPSE</span>
            <div className={`w-3 h-3 rounded-full animate-pulse ${health.status === 'operational' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_20px_#ef4444]'}`} />
          </h1>
          <p className="text-[var(--text-secondary)] text-sm uppercase tracking-widest mt-1">
            Real-time Infrastructure Monitor
          </p>
        </div>
        
        {/* Vitals */}
        <div className="flex gap-8">
          <MetricTicker label="Global Latency" value={`${health.latency_ms}ms`} trend="stable" />
          <MetricTicker label="Error Rate" value={`${health.error_rate}%`} trend={health.error_rate > 1 ? "critical" : "good"} />
          <MetricTicker label="Cost/Min" value="$4.20" trend="up" isCurrency />
        </div>
      </header>

      {/* 3. Main Grid Layout */}
      <main className="relative z-10 grid grid-cols-12 gap-6 p-6 h-[calc(100vh-100px)]">
        
        {/* Esquerda: Matrix de Integrações (3D/Interactive) */}
        <section className="col-span-8 bg-[var(--surface-glass)] rounded-2xl border border-[var(--color-border)] p-6 relative overflow-hidden group">
           <div className="absolute top-4 left-4 z-20">
             <h2 className="text-xl font-bold">Integration Mesh</h2>
           </div>
           {/* Aqui entra o WebGL Graph interativo */}
           <div className="w-full h-full flex items-center justify-center">
              {/* Placeholder visual do grafo */}
              <div className="text-[var(--text-muted)] animate-pulse">
                [ Neural Network Visualization Active ]
              </div>
           </div>
           
           {/* Overlay de Detalhes ao passar o mouse */}
           <AnimatePresence>
             {selectedNode && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="absolute bottom-6 right-6 w-80 bg-black/80 backdrop-blur-xl border border-[var(--color-border)] p-4 rounded-xl"
               >
                 <h3 className="text-lg font-bold text-white">{selectedNode}</h3>
                 <div className="h-1 w-full bg-gray-800 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-[var(--color-success-from)] w-[98%]" />
                 </div>
                 <button 
                  onClick={() => setIsReplayOpen(true)}
                  className="mt-4 w-full py-2 bg-[var(--color-primary-from)] text-black font-bold rounded hover:brightness-110 transition-all"
                 >
                   Deep Inspect & Replay
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
        </section>

        {/* Direita: Live Feed de Falhas (The "Matrix" Rain) */}
        <section className="col-span-4 flex flex-col gap-4">
          
          {/* Webhook Health Speedometer */}
          <div className="h-1/3 bg-[var(--surface-glass)] rounded-2xl border border-[var(--color-border)] p-5 flex flex-col justify-between">
            <h3 className="text-sm uppercase tracking-widest text-[var(--text-secondary)]">Webhook Reliability</h3>
            <div className="flex items-end justify-between">
              <div className="text-5xl font-mono font-bold text-[var(--color-success-from)]">99.9%</div>
              <div className="text-xs text-right text-[var(--text-muted)]">
                IN: 14,203/min<br/>OUT: 2,401/min
              </div>
            </div>
            {/* Mini chart visualizer */}
            <div className="flex gap-1 h-8 items-end">
               {[...Array(20)].map((_, i) => (
                 <div key={i} className="flex-1 bg-[var(--color-success-from)] opacity-50" style={{ height: `${Math.random() * 100}%` }} />
               ))}
            </div>
          </div>

          {/* Critical Alerts Feed */}
          <div className="h-2/3 bg-[var(--surface-glass)] rounded-2xl border border-[var(--color-border)] p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--color-border)] bg-red-500/10 flex justify-between items-center">
              <h3 className="text-red-400 font-bold flex items-center gap-2">
                <span className="animate-ping w-2 h-2 rounded-full bg-red-500"></span>
                LIVE FAILURES
              </h3>
              <button className="text-xs hover:text-white text-red-300">CLEAR ALL</button>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-xs p-2 space-y-2">
              {/* Exemplo de item de log falho */}
              <div className="p-3 bg-red-900/20 border-l-2 border-red-500 hover:bg-red-900/40 cursor-pointer transition-colors group">
                <div className="flex justify-between text-red-300 mb-1">
                  <span className="font-bold">POST /stripe/webhook</span>
                  <span>500 Internal Server Error</span>
                </div>
                <div className="text-[var(--text-muted)] truncate group-hover:whitespace-normal">
                  Error: Database connection timeout in 'api_integrations'...
                </div>
                <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="bg-red-500/20 px-2 py-1 rounded text-red-200 hover:bg-red-500 hover:text-white">Fix with AI</button>
                   <button className="bg-white/10 px-2 py-1 rounded hover:bg-white/20">Trace</button>
                </div>
              </div>
              {/* Mais itens... */}
            </div>
          </div>
        </section>
      </main>

      {/* Modal do Replay (O A-HA) */}
      {isReplayOpen && (
        <ReplayDebugger onClose={() => setIsReplayOpen(false)} />
      )}
    </div>
  );
};

// Componente simples para métricas
const MetricTicker = ({ label, value, trend, isCurrency = false }: any) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase text-[var(--text-secondary)]">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-mono font-medium text-[var(--text-primary)]">{value}</span>
      <span className={`text-xs ${trend === 'critical' ? 'text-red-500' : 'text-green-500'}`}>
        {trend === 'up' ? '▲' : trend === 'stable' ? '—' : '▼'}
      </span>
    </div>
  </div>
);

export default createSupremePage(supremeConfigs["APIStatus"], APIStatusPage);
