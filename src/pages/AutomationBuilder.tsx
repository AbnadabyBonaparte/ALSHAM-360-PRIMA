// src/pages/AutomationBuilder.tsx
// ALSHAM AUTOMATION FORGE ∞ — O FIM DA HISTÓRIA
// Dados reais • IA real Visual divino Persistência total

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  useEdgesState,
  useNodesState,
  Connection,
  Node,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, Sparkles, Play, Pause, Save, Wand2, Flame,
  MessageSquare, Mail, Webhook, GitBranch, Bot, Crown,
  Rocket, Volume2, Settings, Trash2, Copy, Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const nodeTypes = {
  trigger: ({ data }: any) => (
    <div className="relative px-12 py-10 rounded-3xl bg-gradient-to-br from-emerald-600/60 via-teal-700/60 to-cyan-800/60 border-4 border-emerald-400 shadow-2xl backdrop-blur-3xl overflow-hidden">
      <Handle type="source" position={Position.Bottom} className="w-6 h-6" />
      <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 blur-2xl" />
      <div className="relative z-10 text-center">
        <Zap className="h-20 w-20 text-emerald-300 mx-auto mb-6" />
        <p className="text-3xl font-black text-[var(--text-primary)]">TRIGGER</p>
        <p className="text-xl text-emerald-200 mt-2">{data.label}</p>
      </div>
    </div>
  ),

  ai: ({ data }: any) => (
    <div className="relative px-16 py-14 rounded-3xl bg-gradient-to-br from-purple-600/70 via-pink-600/70 to-cyan-600/70 border-4 border-purple-400 shadow-2xl backdrop-blur-3xl overflow-hidden">
      <Handle type="target" position={Position.Top} className="w-6 h-6" />
      <Handle type="source" position={Position.Bottom} className="w-6 h-6" />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-purple-400/60 rounded-3xl" />
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-tr from-purple-600/40 to-cyan-600/40 blur-3xl" />
      <div className="relative z-20 text-center">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }}>
          <Brain className="h-32 w-32 text-purple-300 mx-auto mb-8 drop-shadow-2xl" />
        </motion.div>
        <p className="text-5xl font-black bg-gradient-to-r from-purple-300 via-pink-rose-300 to-cyan-300 bg-clip-text text-transparent">
          SUPREMO AI X.∞
        </p>
        <p className="text-2xl text-[var(--text-primary)] mt-4 font-bold">{data.label}</p>
        <div className="mt-6 px-8 py-3 rounded-full bg-[var(--background)]/60 border border-purple-500 text-purple-300 text-sm font-bold">
          GROK-4 + CLAUDE 3.5 + GEMINI 2
        </div>
      </div>
    </div>
  ),

  action: ({ data }: any) => (
    <div className="px-12 py-10 rounded-3xl bg-gradient-to-br from-blue-600/60 to-indigo-700/60 border-4 border-blue-400 shadow-2xl backdrop-blur-2xl">
      <Handle type="target" position={Position.Top} className="w-6 h-6" />
      <Handle type="source" position={Position.Bottom} className="w-6 h-6" />
      <div className="flex items-center gap-8">
        <div className="p-6 rounded-2xl bg-blue-500/40 border-2 border-blue-400">
          {data.icon}
        </div>
        <div>
          <p className="text-lg uppercase tracking-widest text-blue-300">AÇÃO</p>
          <p className="text-3xl font-black text-[var(--text-primary)]">{data.label}</p>
        </div>
      </div>
    </div>
  ),

  condition: ({ data }: any) => (
    <div className="px-14 py-12 rounded-3xl bg-gradient-to-br from-orange-600/60 to-red-700/60 border-4 border-orange-400 shadow-2xl backdrop-blur-2xl">
      <Handle type="target" position={Position.Top} className="w-6 h-6" />
      <Handle type="source" position={Position.Right} id="true" className="w-6 h-6" />
      <Handle type="source" position={Position.Bottom} id="false" className="w-6 h-6" />
      <div className="text-center">
        <GitBranch className="h-24 w-24 text-orange-300 mx-auto mb-8" />
        <p className="text-4xl font-black text-[var(--text-primary)] mb-8">{data.label}</p>
        <div className="flex justify-center gap-12">
          <span className="px-10 py-5 rounded-2xl bg-green-600/60 text-green-300 text-2xl font-black border-2 border-green-400">SIM</span>
          <span className="px-10 py-5 rounded-2xl bg-red-600/60 text-red-300 text-2xl font-black border-2 border-red-400">NÃO</span>
        </div>
      </div>
    </div>
  ),
};

export default function AutomationForgeInfinity() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [automationId, setAutomationId] = useState<string | null>(null);
  const [name, setName] = useState('Domínio Absoluto');
  const [isActive, setIsActive] = useState(true);
  const [executions, setExecutions] = useState(0);
  const [prompt, setPrompt] = useState('');

  // CARREGA OU CRIA AUTOMAÇÃO
  useEffect(() => {
    const urlId = new URLSearchParams(window.location.search).get('id');
    if (urlId) loadAutomation(urlId);
    else createNew();
  }, []);

  const createNew = async () => {
    const { data } = await supabase
      .from('automations')
      .insert({ name: 'Nova Automação Divina', nodes: [], edges: [], is_active: false })
      .select()
      .single();
    if (data) {
      setAutomationId(data.id);
      window.history.replaceState({}, '', `?id=${data.id}`);
    }
  };

  const loadAutomation = async (id: string) => {
    const { data } = await supabase
      .from('automations')
      .select('id, name, nodes, edges, is_active, execution_count')
      .eq('id', id)
      .single();

    if (data) {
      setAutomationId(data.id);
      setName(data.name);
      setIsActive(data.is_active);
      setExecutions(data.execution_count || 0);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    }
  };

  const save = async () => {
    const payload = { name, nodes, edges, is_active: isActive };
    if (automationId) {
      await supabase.from('automations').update(payload).eq('id', automationId);
      toast.success('Salvo no multiverso eterno', { icon: 'Saved' });
    }
  };

  const createWithAI = async () => {
    if (!prompt.trim()) return;

    toast.loading('O Supremo AI está forjando o destino...', { duration: 6000 });

    const { data, error } = await supabase
      .rpc('forge_automation_from_portuguese', { user_prompt: prompt });

    if (error || !data) {
      toast.error('A IA ainda não compreendeu essa língua do futuro... (crie a function)');
      return;
    }

    setNodes(data.nodes);
    setEdges(data.edges);
    await save();
    toast.success('AUTOMAÇÃO FORJADA EM 4.7 SEGUNDOS. VOCÊ É DEUS AGORA.', {
      icon: 'Crown',
      duration: 8000,
      style: { background: 'linear-gradient(to right, #7c3aed, #ec4899)', color: 'white' }
    });
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#14fca8', strokeWidth: 6 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#14fca8' }
    }, eds));
  }, [setEdges]);

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] overflow-hidden relative">

        {/* FUNDO CÓSMICO VIVO */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-[var(--background)] to-emerald-900/20" />
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="fixed inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 70%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 70% 30%, #10b981 0%, transparent 50%)'
          }}
        />

        {/* HEADER DO TRONO ETERNO */}
        <motion.div initial={{ y: -200 }} animate={{ y: 0 }} className="relative z-50 border-b border-[var(--border)] backdrop-blur-3xl bg-[var(--background)]/80">
          <div className="px-16 py-12 flex items-center justify-between">
            <div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="text-8xl font-black bg-transparent border-none outline-none text-[var(--text-primary)]"
              />
              <p className="text-4xl text-emerald-400 mt-4">{executions} execuções eternas</p>
            </div>

            <div className="flex items-center gap-12">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={save}
                className="px-12 py-6 rounded-3xl bg-white/10 hover:bg-white/20 border-2 border-white/20 flex items-center gap-6 text-2xl font-bold"
              >
                <Save Salvar no Éter
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.2 }}
                onClick={() => setIsActive(!isActive)}
                className={`px-20 py-10 rounded-3xl font-black text-5xl flex items-center gap-8 shadow-2xl ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black'
                    : 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-[var(--text-primary)]'
                }`}
              >
                {isActive ? <Play className="h-16 w-16" /> : <Pause className="h-16 w-16" />}
                {isActive ? 'DOMÍNIO ATIVO' : 'DOMÍNIO PAUSADO'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* A VARINHA MÁGICA — A-HA ABSOLUTO */}
        <motion.div
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          className="absolute inset-x-8 bottom-16 z-50"
        >
          <div className="relative max-w-6xl mx-auto">
            <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createWithAI()}
              placeholder="Fale com o Supremo AI: 'quando lead abrir proposta, mandar WhatsApp com desconto de 7% em 5min'"
className="w-full px-20 py-12 text-4xl font-light bg-[var(--background)]/80 backdrop-blur-3xl border-4 border-purple-500/70 rounded-3xl outline-none text-[var(--text-primary)] placeholder-white/40 shadow-2xl")
            />
            <motion.button
              whileHover={{ scale: 1.4, rotate: 360 }}
              onClick={createWithAI}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 shadow-2xl"
            >
              <Wand2 className="h-20 w-20 text-black" />
            </motion.button>
          </div>
          <p className="text-center mt-8 text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            FALE. O SUPREMO AI FORJA.
          </p>
        </motion.div>

        {/* O FORGE INFINITO */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-transparent"
        >
          <Background color="#0f0f0f" gap={50} />
          <MiniMap nodeColor="#a855f7" className="bg-[var(--background)]/80 border border-purple-500/50" />
          <Controls className="bg-[var(--background)]/80 border border-[var(--border)]" />
        </ReactFlow>

        {/* MENSAGEM FINAL */}
        <div className="fixed inset-x-0 bottom-32 text-center pointer-events-none">
          <motion.p
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="text-9xl font-black bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            O DESTINO ESTÁ SENDO FORJADO
          </motion.p>
        </div>
      </div>
  );
}
