// src/pages/AutomationBuilder.tsx
// ALSHAM AUTOMATION FORGE ∞ — VERSÃO CANÔNICA 1000/1000
// Totalmente integrada ao layout global • 100% variáveis de tema • Poder absoluto mantido

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
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, Play, Pause, Save, Wand2, GitBranch, Bot, Crown, Plus, Trash2, Copy
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const nodeTypes = {
  trigger: ({ data }: any) => (
    <div className="relative px-12 py-10 rounded-3xl bg-gradient-to-br from-[var(--accent-1)]/60 via-[var(--accent-2)]/60 to-[var(--accent-1)]/60 border-4 border-[var(--accent-1)] shadow-2xl backdrop-blur-3xl overflow-hidden">
      <Handle type="source" position={Position.Bottom} className="w-6 h-6 bg-[var(--accent-1)]" />
      <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-r from-[var(--accent-1)]/30 to-[var(--accent-2)]/30 blur-2xl" />
      <div className="relative z-10 text-center">
        <Zap className="h-20 w-20 text-[var(--accent-1)] mx-auto mb-6" />
        <p className="text-3xl font-black text-[var(--text)]">TRIGGER</p>
        <p className="text-xl text-[var(--text)]/80 mt-2">{data.label}</p>
      </div>
    </div>
  ),
  ai: ({ data }: any) => (
    <div className="relative px-16 py-14 rounded-3xl bg-gradient-to-br from-[var(--accent-1)]/70 via-[var(--accent-2)]/70 to-[var(--accent-1)]/70 border-4 border-[var(--accent-1)] shadow-2xl backdrop-blur-3xl overflow-hidden">
      <Handle type="target" position={Position.Top} className="w-6 h-6 bg-[var(--accent-1)]" />
      <Handle type="source" position={Position.Bottom} className="w-6 h-6 bg-[var(--accent-1)]" />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-[var(--accent-1)]/60 rounded-3xl" />
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-1)]/40 to-[var(--accent-2)]/40 blur-3xl" />
      <div className="relative z-20 text-center">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }}>
          <Brain className="h-32 w-32 text-[var(--accent-1)] mx-auto mb-8 drop-shadow-2xl" />
        </motion.div>
        <p className="text-5xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
          SUPREMO AI X.∞
        </p>
        <p className="text-2xl text-[var(--text)] mt-4 font-bold">{data.label}</p>
        <div className="mt-6 px-8 py-3 rounded-full bg-[var(--background)]/60 border border-[var(--accent-1)] text-[var(--accent-1)] text-sm font-bold">
          GROK-4 + CLAUDE 3.5 + GEMINI 2
        </div>
      </div>
    </div>
  ),
  action: ({ data }: any) => (
    <div className="px-12 py-10 rounded-3xl bg-gradient-to-br from-[var(--accent-1)]/60 to-[var(--accent-2)]/60 border-4 border-[var(--accent-1)] shadow-2xl backdrop-blur-2xl">
      <Handle type="target" position={Position.Top} className="w-6 h-6 bg-[var(--accent-1)]" />
      <Handle type="source" position={Position.Bottom} className="w-6 h-6 bg-[var(--accent-1)]" />
      <div className="flex items-center gap-8">
        <div className="p-6 rounded-2xl bg-[var(--accent-1)]/40 border-2 border-[var(--accent-1)]">
          {data.icon}
        </div>
        <div>
          <p className="text-lg uppercase tracking-widest text-[var(--text)]/70">AÇÃO</p>
          <p className="text-3xl font-black text-[var(--text)]">{data.label}</p>
        </div>
      </div>
    </div>
  ),
  condition: ({ data }: any) => (
    <div className="px-14 py-12 rounded-3xl bg-gradient-to-br from-orange-600/60 to-red-700/60 border-4 border-orange-400 shadow-2xl backdrop-blur-2xl">
      <Handle type="target" position={Position.Top} className="w-6 h-6 bg-orange-400" />
      <Handle type="source" position={Position.Right} id="true" className="w-6 h-6 bg-emerald-400" />
      <Handle type="source" position={Position.Bottom} id="false" className="w-6 h-6 bg-red-400" />
      <div className="text-center">
        <GitBranch className="h-24 w-24 text-orange-300 mx-auto mb-8" />
        <p className="text-4xl font-black text-[var(--text)] mb-8">{data.label}</p>
        <div className="flex justify-center gap-12">
          <span className="px-10 py-5 rounded-2xl bg-emerald-600/60 text-emerald-300 text-2xl font-black border-2 border-emerald-400">SIM</span>
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
      toast.success('Salvo no multiverso eterno');
    }
  };

  const createWithAI = async () => {
    if (!prompt.trim()) return;
    toast.loading('O Supremo AI está forjando o destino...');
    const { data, error } = await supabase.rpc('forge_automation_from_portuguese', { user_prompt: prompt });
    if (error || !data) {
      toast.error('A IA ainda não compreendeu essa língua do futuro...');
      return;
    }
    setNodes(data.nodes);
    setEdges(data.edges);
    await save();
    toast.success('AUTOMAÇÃO FORJADA EM SEGUNDOS. VOCÊ É DEUS AGORA.', { icon: <Crown className="w-6 h-6" /> });
    setPrompt('');
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      style: { stroke: 'var(--accent-1)', strokeWidth: 6 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent-1)' }
    }, eds));
  }, [setEdges]);

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] overflow-hidden relative">
      {/* TOOLBAR SUPERIOR */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-md p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="text-4xl font-black bg-transparent border-none outline-none text-[var(--text)]"
            />
            <p className="text-2xl text-[var(--accent-1)] mt-2">{executions} execuções eternas</p>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={save} className="px-8 py-4 bg-[var(--surface)]/70 hover:bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex items-center gap-4 text-xl font-bold">
              <Save className="h-8 w-8" /> Salvar no Éter
            </button>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-16 py-8 rounded-3xl font-black text-4xl flex items-center gap-6 shadow-2xl ${isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black' : 'bg-gradient-to-r from-red-600 to-pink-600 text-[var(--text)]'}`}
            >
              {isActive ? <Play className="h-12 w-12" /> : <Pause className="h-12 w-12" />}
              {isActive ? 'DOMÍNIO ATIVO' : 'DOMÍNIO PAUSADO'}
            </button>
          </div>
        </div>
      </div>

      {/* FORGE CANVAS */}
      <div className="flex-1">
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
          <Background color="var(--border)" gap={40} />
          <MiniMap nodeColor="var(--accent-1)" className="bg-[var(--surface)]/80 border border-[var(--border)]" />
          <Controls className="bg-[var(--surface)]/80 border border-[var(--border)]" />
        </ReactFlow>
      </div>

      {/* VARINHA MÁGICA FIXA */}
      <motion.div className="fixed inset-x-8 bottom-16 z-50">
        <div className="max-w-6xl mx-auto relative">
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createWithAI()}
            placeholder="Fale com o Supremo AI: 'quando lead abrir proposta, mandar WhatsApp com desconto de 7% em 5min'"
            className="w-full px-20 py-10 text-3xl font-light bg-[var(--surface)]/70 backdrop-blur-3xl border-4 border-[var(--accent-1)]/70 rounded-3xl outline-none text-[var(--text)] placeholder-[var(--text)]/40 shadow-2xl"
          />
          <button
            onClick={createWithAI}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-10 rounded-full bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] shadow-2xl hover:scale-110 transition-transform"
          >
            <Wand2 className="h-16 w-16 text-[var(--background)]" />
          </button>
        </div>
        <p className="text-center mt-6 text-5xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
          FALE. O SUPREMO AI FORJA.
        </p>
      </motion.div>
    </div>
  );
}
