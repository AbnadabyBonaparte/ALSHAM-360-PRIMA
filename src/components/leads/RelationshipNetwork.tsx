// src/components/leads/RelationshipNetwork.tsx
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Network, Users, GitBranch, Zap } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

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
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

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
        // Use theme accent color with strength-based opacity
        const edgeColor = themeColors.accentPrimary;
        // Convert hex to rgba
        const r = parseInt(edgeColor.slice(1, 3), 16);
        const g = parseInt(edgeColor.slice(3, 5), 16);
        const b = parseInt(edgeColor.slice(5, 7), 16);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${edge.strength})`;
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
          const glowColor = themeColors.accentPrimary;
          const r = parseInt(glowColor.slice(1, 3), 16);
          const g = parseInt(glowColor.slice(3, 5), 16);
          const b = parseInt(glowColor.slice(5, 7), 16);
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.fillStyle = gradient;
          ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
        }

        // Node background
        ctx.beginPath();
        ctx.arc(x, y, radius * scale, 0, Math.PI * 2);

        const nodeGradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
        if (isCenterNode) {
          nodeGradient.addColorStop(0, themeColors.accentPrimary);
          nodeGradient.addColorStop(1, themeColors.accentSecondary);
        } else if (node.type === 'contact') {
          nodeGradient.addColorStop(0, themeColors.accentSecondary);
          nodeGradient.addColorStop(1, themeColors.accentTertiary);
        } else {
          nodeGradient.addColorStop(0, themeColors.accentTertiary);
          nodeGradient.addColorStop(1, themeColors.accentWarm);
        }

        ctx.fillStyle = nodeGradient;
        ctx.fill();

        // Border
        ctx.strokeStyle = isSelected || isHovered ? themeColors.textPrimary : themeColors.border;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = themeColors.textPrimary;
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
  }, [nodes, edges, centerNodeId, hoveredNode, selectedNode, themeColors]);

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
      className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] border border-[var(--border)] rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-1">Rede de Relacionamentos</h3>
          <p className="text-sm text-[var(--text-secondary)]">Mapeamento visual de conexões</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-emerald)]/10 border border-[var(--accent-emerald)]/20 rounded-xl">
          <GitBranch className="w-4 h-4 text-[var(--accent-emerald)]" />
          <span className="text-sm font-semibold text-[var(--accent-emerald)]">
            {nodes.length} nós • {edges.length} conexões
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-96 rounded-xl bg-[var(--bg)]/50 cursor-pointer"
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-[var(--surface)]/90 backdrop-blur-sm border border-[var(--border)] rounded-xl p-4">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--accent-emerald)] to-[var(--accent-emerald)]" />
              <span className="text-[var(--text-secondary)]">Lead Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--accent-sky)] to-[var(--accent-purple)]" />
              <span className="text-[var(--text-secondary)]">Contatos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--accent-sky)] to-[var(--accent-purple)]" />
              <span className="text-[var(--text-secondary)]">Empresas</span>
            </div>
          </div>
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-[var(--surface)]/90 backdrop-blur-sm border border-[var(--border)] rounded-xl p-4 min-w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-[var(--text)]">{selectedNode.label}</h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Tipo:</span>
                <span className="text-[var(--text)] capitalize">{selectedNode.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Influência:</span>
                <span className="text-[var(--accent-emerald)]">{selectedNode.value}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Conexões:</span>
                <span className="text-[var(--text)]">
                  {edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).length}
                </span>
              </div>
            </div>
            <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-emerald)] text-[var(--text)] rounded-lg text-sm font-semibold hover:from-[var(--accent-emerald)] hover:to-[var(--accent-emerald)] transition-all">
              Ver Detalhes
            </button>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-gradient-to-br from-[var(--accent-sky)]/10 to-[var(--accent-sky)]/10 border border-[var(--accent-sky)]/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[var(--accent-sky)]" />
            <span className="text-xs text-[var(--text-secondary)]">Contatos Diretos</span>
          </div>
          <div className="text-2xl font-bold text-[var(--accent-sky)]">
            {edges.filter(e => e.from === centerNodeId).length}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-[var(--accent-purple)]/10 to-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-[var(--accent-purple)]" />
            <span className="text-xs text-[var(--text-secondary)]">Rede Estendida</span>
          </div>
          <div className="text-2xl font-bold text-[var(--accent-purple)]">{nodes.length}</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-[var(--accent-emerald)]/10 to-[var(--accent-emerald)]/10 border border-[var(--accent-emerald)]/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[var(--accent-emerald)]" />
            <span className="text-xs text-[var(--text-secondary)]">Força Média</span>
          </div>
          <div className="text-2xl font-bold text-[var(--accent-emerald)]">
            {edges.length > 0 ? Math.round((edges.reduce((sum, e) => sum + e.strength, 0) / edges.length) * 100) : 0}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
