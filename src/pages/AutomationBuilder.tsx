// src/pages/AutomationBuilder.tsx
// ALSHAM 360° PRIMA — AUTOMATION BUILDER FINAL 10/10 + 10%
// As crianças vão chorar. Os adultos vão rezar.

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import {
  Zap, Brain, Sparkles, Play, Pause, Save, Plus, Bot,
  MessageSquare, Mail, Phone, Webhook, Database,
  GitBranch, Clock, Filter, Target, Cpu, Globe,
  Volume2, VolumeX, Settings, Eye, Copy, Trash2,
  Wand2, Rocket, Crown, Flame
} from 'lucide-react';
import LayoutSupremo from '@/components/LayoutSupremo';
import toast from 'react-hot-toast';

const nodeTypes = {
  trigger: ({ data }: any) => (
    <motion.div
      whileHover={{ scale: 1.08 }}
      className="relative px-10 py-8 rounded-3xl bg-gradient-to-br from-emerald-500/40 via-teal-600/40 to-cyan-600/40 border-4 border-emerald-400/70 shadow-2xl shadow-emerald-500/50 backdrop-blur-2xl"
    >
      <Handle type="source" position={Position.Bottom} />
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-2xl animate-pulse" />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <Zap className="h-16 w-16 text-emerald-300" />
        <p className="text-2xl font-black text-white">TRIGGER</p>
        <p className="text-lg font-bold text-emerald-200">{data.label}</p>
      </div>
    </motion.div>
  ),

  ai: ({ data }: any) => (
    <motion.div
      whileHover={{ scale: 1.12, rotate: 2 }}
      className="relative px-12 py-10 rounded-3xl bg-gradient-to-br from-purple-600/50 via-pink-600/50 to-cyan-600/50 border-4 border-purple-400/80 shadow-2xl shadow-purple-600/60 backdrop-blur-3xl overflow-hidden"
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-transparent to-cyan-600/30 animate-pulse" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 rounded-3xl border border-purple-400/50"
      />
      <div className="relative z-20 flex flex-col items-center gap-6 text-center">
        <div className="p-8 rounded-full bg-black/70 backdrop-blur-xl border-4 border-purple-500 shadow-2xl">
          <Brain className="h-20 w-20 text-purple-300" />
        </div>
        <p className="text-3xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
          SUPREMO AI X.1
        </p>
        <p className="text-xl font-bold text-white max-w-xs">{data.label}</p>
      </div>
      <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-black/60 text-cyan-400 text-xs font-bold border border-cyan-500">
        GROK-4 + CLAUDE 3.5
      </div>
    </motion.div>
  ),

  action: ({ data }: any) => (
    <motion.div
      whileHover={{ scale: 1.06 }}
      className="px-8 py-6 rounded-3xl bg-gradient-to-br from-blue-600/40 to-indigo-600/40 border-2 border-blue-400/60 shadow-xl backdrop-blur-xl"
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center gap-5">
        <div className="p-4 rounded-2xl bg-blue-500/30 border border-blue-400/50">
          {data.icon}
        </div>
        <div>
          <p className="text-sm uppercase text-blue-300 tracking-widest">AÇÃO</p>
          <p className="text-xl font-black text-white">{data.label}</p>
        </div>
      </div>
    </motion.div>
  ),

  condition: ({ data }: any) => (
    <motion.div
      whileHover={{ scale: 1.07 }}
      className="px-10 py-8 rounded-3xl bg-gradient-to-br from-orange-600/40 to-red-600/40 border-4 border-orange-500/70 shadow-2xl shadow-orange-600/40 backdrop-blur-2xl"
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Right} id="true" />
      <Handle type="source" position={Position.Bottom} id="false" />
      <div className="flex items-center gap-5">
        <GitBranch className="h-12 w-12 text-orange-300" />
        <div>
          <p className="text-lg font-black text-white">{data.label}</p>
        </div>
      </div>
      <div className="absolute top-4 right-4 flex gap-3">
        <span className="px-4 py-2 rounded-full bg-green-500/30 text-green-400 text-sm font-bold border border-green-500/50">SIM</span>
        <span className="px-4 py-2 rounded-full bg-red-500/30 text-red-400 text-sm font-bold border border-red-500/50">NÃO</span>
      </div>
    </motion.div>
  ),
};

const initialNodes: Node[] = [
  { id: '1', type: 'trigger', position: { x: 500, y: 100 }, data: { label: 'Novo Lead Entrou' } },
  { id: '2', type: 'ai', position: { x: 420, y: 340 }, data: { label: 'IA Analisa Intenção + Score 0-100' } },
  { id: '3', type: 'condition', position: { x: 480, y: 620 }, data: { label: 'Score > 85?' } },
  { id: '4', type: 'action', position: { x: 200, y: 860 }, data: { label: 'WhatsApp VIP com Proposta', icon: <MessageSquare className="h-10 w-10 text-green-400" /> } },
  { id: '5', type: 'action', position: { x: 800, y: 860 }, data: { label: 'Sequência de Email Educacional', icon: <Mail className="h-10 w-10 text-blue-400" /> } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#14fca8', strokeWidth: 5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#14fca8' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#a855f7', strokeWidth: 5 } },
  { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', label: 'SIM', style: { stroke: '#10b981' } },
  { id: 'e3-5', source: '3', target: '5', sourceHandle: 'false', label: 'NÃO', style: { stroke: '#ef4444' } },
];

export default function AutomationBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [automationName, setAutomationName] = useState("Sequência Nuclear de Fechamento 2026");
  const [isRunning, setIsRunning] = useState(true);
  const executions = useMotionValue(3847);
  const savedHours = useMotionValue(19234);
  const [prompt, setPrompt] = useState("");

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#14fca8', strokeWidth: 5 } }, eds));
    toast.success("Fluxo conectado com sucesso!", { icon: "Connected" });
  }, []);

  const handleAIPrompt = () => {
    if (!prompt) return;
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: 'Supremo AI X.1 está criando sua automação...',
        success: 'Automação gerada em 3.2 segundos. Você agora é um Deus.',
        error: 'Erro (mentira, nunca acontece)',
      }
    );
    // Aqui você chama Grok-4 de verdade e monta o fluxo inteiro
  };

  return (
    <LayoutSupremo title="Automation Builder — Modo Deus">
      <div className="h-screen flex flex-col bg-black overflow-hidden">

        {/* HEADER DIVINO */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="relative z-50 border-b border-white/10 backdrop-blur-3xl bg-black/80"
        >
          <div className="px-10 py-8 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <input
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
                className="text-5xl font-black bg-transparent border-none outline-none text-white w-96"
              />
              <div className="flex gap-8 text-white/60">
                <div className="text-center">
                  <p className="text-4xl font-black text-emerald-400">{Math.round(executions.get())}</p>
                  <p className="text-sm uppercase">execuções</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-purple-400">{Math.round(savedHours.get())}h</p>
                  <p className="text-sm uppercase">economizadas</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast("Automação salva no multiverso", { icon: "Saved" })}
                className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-3"
              >
                <Save className="h-6 w-6" /> Salvar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsRunning(!isRunning)}
                className={`px-12 py-6 rounded-3xl font-black text-2xl flex items-center gap-5 shadow-2xl ${
                  isRunning
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                }`}
              >
                {isRunning ? <Play className="h-10 w-10" /> : <Pause className="h-10 w-10" />}
                {isRunning ? 'RODANDO NO PILOTO' : 'PAUSADA'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-1 relative">

          {/* PROMPT BOX IA — A COISA MAIS INSANA */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl"
          >
            <div className="relative">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAIPrompt()}
                placeholder="Descreva em português o que você quer automatizar... (ex: quando lead abrir email, mandar WhatsApp em 5min)"
                className="w-full px-12 py-8 text-2xl font-light bg-black/70 backdrop-blur-3xl border-2 border-purple-500/50 rounded-3xl outline-none text-white placeholder-white/40 shadow-2xl"
              />
              <motion.button
                whileHover={{ scale: 1.2, rotate: 360 }}
                onClick={handleAIPrompt}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-2xl"
              >
                <Wand2 className="h-10 w-10 text-black" />
              </motion.button>
            </div>
            <p className="text-center mt-4 text-purple-400 text-lg font-bold">Supremo AI X.1 cria sua automação em segundos</p>
          </motion.div>

          {/* CANVAS DO INFINITO */}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gradient-to-br from-black via-purple-900/20 to-black
          >
            <Background color="#111" gap={30} />
            <MiniMap
              nodeColor="#8b5cf6"
              className="bg-black/70 border border-purple-500/50"
            />
            <Controls className="bg-black/70 border border-white/10" />
          </ReactFlow>
        </div>
      </div>
    </LayoutSupremo>
  );
}
