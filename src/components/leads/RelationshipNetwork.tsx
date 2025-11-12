// src/components/leads/RelationshipNetwork.tsx
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Network, Users, GitBranch, Zap } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'lead' | 'contact' | 'company';
  value: number;
}

interface Edge {
  from: string;
  to: string;
  strength: number;
}

interface RelationshipNetworkProps {
  nodes: Node[];
  edges: Edge[];
  centerNodeId?: string;
}

export default function RelationshipNetwork({ 
  nodes = [], 
  edges = [],
  centerNodeId 
}: RelationshipNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Physics simulation (simplified)
    const positions = new Map<string, { x: number; y: number }>();
    
    // Initialize positions
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = node.id === centerNodeId ? 0 : 150;
      positions.set(node.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    });

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      // Draw edges
      edges.forEach(edge => {
        const from = positions.get(edge.from);
        const to = positions.get(edge.to);
        if (!from || !to) return;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = `rgba(16, 185, 129, ${edge.strength})`;
        ctx.lineWidth = 2 * edge.strength;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node, i) => {
        const pos = positions.get(node.id);
        if (!pos) return;

        const isCenterNode = node.id === centerNodeId;
        const isSelected = node.id === selectedNode?.id;
        const isHovered = node.id === hoveredNode?.id;

        // Animate position slightly
        const offset = Math.sin(time + i) * 2;
        const x = pos.x + offset;
        const y = pos.y + offset;

        // Node circle
        const radius = isCenterNode ? 40 : 30;
        const scale = isHovered || isSelected ? 1.2 : 1;

        // Glow effect
        if (isCenterNode || isSelected || isHovered) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * scale * 2);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
        }

        // Node background
        ctx.beginPath();
        ctx.arc(x, y, radius * scale, 0, Math.PI * 2);
        
        const nodeGradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
        if (isCenterNode) {
          nodeGradient.addColorStop(0, '#10b981');
          nodeGradient.addColorStop(1, '#14b8a6');
        } else if (node.type === 'contact') {
          nodeGradient.addColorStop(0, '#3b82f6');
          nodeGradient.addColorStop(1, '#8b5cf6');
        } else {
          nodeGradient.addColorStop(0, '#6366f1');
          nodeGradient.addColorStop(1, '#8b5cf6');
        }
        
        ctx.fillStyle = nodeGradient;
        ctx.fill();

        // Border
        ctx.strokeStyle = isSelected || isHovered ? '#fff' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = `${isCenterNode ? 14 : 12}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label,
          x,
          y
        );
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [nodes, edges, centerNodeId, hoveredNode, selectedNode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;

    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = node.id === centerNodeId ? 0 : 150;
      const nodeX = centerX + Math.cos(angle) * radius;
      const nodeY = centerY + Math.sin(angle) * radius;
      const nodeRadius = node.id === centerNodeId ? 40 : 30;

      const distance = Math.sqrt(Math.pow(x - nodeX, 2) + Math.pow(y - nodeY, 2));
      if (distance < nodeRadius) {
        setSelectedNode(node);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Rede de Relacionamentos</h3>
          <p className="text-sm text-gray-400">Mapeamento visual de conexões</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">
            {nodes.length} nós • {edges.length} conexões
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-96 rounded-xl bg-neutral-950/50 cursor-pointer"
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-xl p-4">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500" />
              <span className="text-gray-300">Lead Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
              <span className="text-gray-300">Contatos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
              <span className="text-gray-300">Empresas</span>
            </div>
          </div>
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 min-w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">{selectedNode.label}</h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tipo:</span>
                <span className="text-white capitalize">{selectedNode.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Influência:</span>
                <span className="text-emerald-400">{selectedNode.value}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Conexões:</span>
                <span className="text-white">
                  {edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).length}
                </span>
              </div>
            </div>
            <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all">
              Ver Detalhes
            </button>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Contatos Diretos</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {edges.filter(e => e.from === centerNodeId).length}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Rede Estendida</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{nodes.length}</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Força Média</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {Math.round((edges.reduce((sum, e) => sum + e.strength, 0) / edges.length) * 100)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
