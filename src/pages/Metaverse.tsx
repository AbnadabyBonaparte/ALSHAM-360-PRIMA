// src/pages/Metaverse.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Stars, 
  Text, 
  Float, 
  MeshDistortMaterial, 
  useTexture, 
  Html,
  PerspectiveCamera,
  Environment,
  Sparkles
} from '@react-three/drei';
import { EffectComposer, Bloom, Glitch, Noise, Vignette } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import * as THREE from 'three';

// --- TYPES ---
interface SpatialNode {
  id: string;
  name: string;
  type: 'showroom' | 'hq' | 'event' | 'store';
  position: [number, number, number];
  metrics: {
    visitors: number;
    revenue: number;
    sentiment: number; // 0 to 1
  };
  status: 'active' | 'warning' | 'critical';
}

const buildNodes = (events: any[]): SpatialNode[] => {
  const types: SpatialNode['type'][] = ['showroom', 'hq', 'event', 'store'];
  const source = events.length ? events : Array.from({ length: 8 }).map((_, i) => ({ id: `placeholder-${i}` }));

  return source.map((event, i) => {
    const angle = (i / source.length) * Math.PI * 2;
    const radius = 18 + (i % 4);
    const posY = ((i % 3) - 1) * 2;
    return {
      id: event.id?.toString() || `node-${i}`,
      name: event.name || event.title || event.event || `Node ${i + 1}`,
      type: types[i % types.length],
      position: [Math.cos(angle) * radius, posY, Math.sin(angle) * radius],
      metrics: {
        visitors: event.visitors || event.count || 0,
        revenue: event.value || event.revenue || 0,
        sentiment: typeof event.sentiment === 'number' ? event.sentiment : 0.5,
      },
      status: (event.status as SpatialNode['status']) || 'active',
    };
  });
};

// --- 3D COMPONENTS ---

// O Núcleo Central (A "Alma" da empresa)
const TheCore = ({ sentiment }: { sentiment: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      // Pulsação baseada no "sentimento"
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const color = sentiment > 0.7 ? '#00ffd5' : sentiment > 0.4 ? '#8a2be2' : '#ff0055';

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[4, 20]} />
        <MeshDistortMaterial 
          color={color} 
          envMapIntensity={1} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
          metalness={0.5} 
          distort={0.4} 
          speed={2} 
        />
      </mesh>
      {/* Anéis de Energia */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6, 0.05, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[7, 0.02, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </Float>
  );
};

// Conexões de Dados (Linhas entre o Core e os Nodes)
const DataStreams = ({ nodes }: { nodes: SpatialNode[] }) => {
  const lines = useMemo(() => {
    return nodes.map((node, i) => {
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...node.position)];
      const curve = new THREE.CatmullRomCurve3(points);
      return (
        <mesh key={`line-${i}`}>
          <tubeGeometry args={[curve, 20, 0.05, 8, false]} />
          <meshBasicMaterial color={node.status === 'warning' ? '#ff0055' : '#00ffd5'} transparent opacity={0.1} />
        </mesh>
      );
    });
  }, [nodes]);
  return <group>{lines}</group>;
};

// Um Nó Espacial (Prédio/Espaço)
const SpatialNodeMesh = ({ node, onSelect }: { node: SpatialNode; onSelect: (n: SpatialNode) => void }) => {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (ref.current) {
      ref.current.lookAt(0, 0, 0); // Sempre olha para o Core
    }
  });

  const color = node.type === 'store' ? '#4ade80' : node.type === 'hq' ? '#f472b6' : '#60a5fa';

  return (
    <group 
      ref={ref} 
      position={node.position} 
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={() => onSelect(node)}
    >
      <Float speed={5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color={node.status === 'warning' ? '#ff0055' : color} 
            emissive={node.status === 'warning' ? '#ff0055' : color}
            emissiveIntensity={hovered ? 2 : 0.5}
            roughness={0.2}
            metalness={0.8}
            wireframe={!hovered}
          />
        </mesh>
        
        {/* Label Flutuante */}
        {hovered && (
          <Html distanceFactor={15} transform position={[0, 2.5, 0]}>
            <div className="bg-[var(--background)]/80 backdrop-blur-md border border-cyan-500/50 p-3 rounded-lg w-48 text-center select-none pointer-events-none transform transition-all duration-300">
              <h3 className="text-cyan-400 font-bold text-lg">{node.name}</h3>
              <div className="flex justify-between text-xs text-gray-300 mt-2">
                <span>Visitors</span>
                <span className="font-mono text-[var(--text-primary)]">{node.metrics.visitors}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-300">
                <span>Revenue</span>
                <span className="font-mono text-green-400">${(node.metrics.revenue / 1000).toFixed(1)}k</span>
              </div>
            </div>
          </Html>
        )}
      </Float>
      
      {/* Chão Holográfico */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.4 : 0.1} />
      </mesh>
    </group>
  );
};

// --- UI OVERLAY COMPONENTS ---
const HeadsUpDisplay = ({ selectedNode, metrics }: { selectedNode: SpatialNode | null, metrics: any }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* TOP BAR */}
      <div className="flex justify-between items-start">
        <div className="pointer-events-auto">
          <motion.h1 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 font-['Rajdhani'] tracking-tighter"
          >
            OMNIVERSE
          </motion.h1>
          <div className="flex items-center space-x-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-cyan-500/80 text-sm tracking-widest uppercase">System Operational • Live Feed</span>
          </div>
        </div>

        <div className="flex space-x-4 pointer-events-auto">
          {['VISÃO', 'DADOS', 'SEGURANÇA', 'AI CORE'].map((item) => (
            <button key={item} className="px-4 py-2 border border-cyan-500/30 bg-[var(--background)]/40 backdrop-blur-sm text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all clip-path-polygon">
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT SIDEBAR - METRICS */}
      <div className="absolute right-8 top-32 w-80 space-y-4 pointer-events-auto">
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-[var(--background)]/60 backdrop-blur-xl border-l-2 border-cyan-500 p-6 rounded-l-2xl"
        >
          <h3 className="text-gray-400 text-sm uppercase mb-4">Real-time Telemetry</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--text-primary)]">Active Avatars</span>
                <span className="text-cyan-400 font-mono">14,205</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: '75%' }} 
                  className="h-full bg-cyan-500" 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--text-primary)]">Global Revenue (1h)</span>
                <span className="text-green-400 font-mono">$842,390</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: '92%' }} 
                  className="h-full bg-green-500" 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--text-primary)]">Sentiment Analysis</span>
                <span className="text-purple-400 font-mono">POSITIVE (0.84)</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: '84%' }} 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                />
              </div>
            </div>
          </div>
        </motion.div>

        {selectedNode && (
           <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           key={selectedNode.id}
           className="bg-cyan-900/20 backdrop-blur-2xl border border-cyan-500/50 p-6 rounded-xl"
         >
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-2xl font-bold text-[var(--text-primary)]">{selectedNode.name}</h2>
             <span className={`w-3 h-3 rounded-full ${selectedNode.status === 'active' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
           </div>
           <p className="text-gray-400 text-sm mb-4">
             Node ID: <span className="font-mono text-cyan-300">{selectedNode.id.toUpperCase()}</span>
           </p>
           <div className="grid grid-cols-2 gap-4">
             <button className="col-span-2 bg-cyan-600 hover:bg-cyan-500 text-[var(--text-primary)] font-bold py-2 rounded transition-colors">
               ENTER IMMERSION
             </button>
             <button className="border border-white/20 text-[var(--text-primary)] hover:bg-white/10 py-2 rounded text-sm">
               Audit Logs
             </button>
             <button className="border border-white/20 text-[var(--text-primary)] hover:bg-white/10 py-2 rounded text-sm">
               Config
             </button>
           </div>
         </motion.div>
        )}
      </div>

      {/* BOTTOM COMMAND CENTER */}
      <div className="flex justify-center mb-8 pointer-events-auto">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="flex space-x-6 bg-[var(--background)]/50 backdrop-blur-2xl border border-[var(--border)] px-8 py-4 rounded-full"
        >
           {/* Simulando ícones de controle */}
           {[1,2,3,4,5].map((i) => (
             <motion.button
              key={i}
              whileHover={{ scale: 1.2, y: -5 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-700 border border-[var(--border)] flex items-center justify-center hover:border-cyan-500 transition-colors"
             >
               <div className="w-6 h-6 bg-white/20 rounded-sm" />
             </motion.button>
           ))}
        </motion.div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function MetaversePage() {
  const [nodes, setNodes] = useState<SpatialNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<SpatialNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNodes() {
      try {
        const { data, error } = await supabase.from('analytics_events').select('*').limit(12);
        if (error) throw error;
        setNodes(buildNodes(data || []));
      } catch (err) {
        console.error('Erro ao carregar dados do metaverso', err);
        setNodes(buildNodes([]));
      } finally {
        setLoading(false);
      }
    }
    loadNodes();
  }, []);

  return (
    <div className="relative w-full h-screen bg-[var(--background)] overflow-hidden">
        
        {/* LOADING STATE */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 2 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--background)]"
            >
              <div className="text-center">
                <motion.div 
                  animate={{ rotate: 360, scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-4 border-t-cyan-500 border-r-purple-500 border-b-pink-500 border-l-transparent rounded-full mx-auto mb-8"
                />
                <h2 className="text-3xl font-light text-[var(--text-primary)] tracking-[0.5em]">INITIALIZING OMNIVERSE</h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD OVERLAY */}
        <HeadsUpDisplay selectedNode={selectedNode} metrics={{}} />

        {/* 3D WORLD */}
        <div className="absolute inset-0 z-0">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 20, 40], fov: 45 }}>
            <color attach="background" args={['#050505']} />
            
            {/* AMBIENTE */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
            
            {/* O MUNDO DE DADOS */}
            <group>
              <TheCore sentiment={0.8} />
              <DataStreams nodes={nodes} />
              {nodes.map((node) => (
                <SpatialNodeMesh key={node.id} node={node} onSelect={setSelectedNode} />
              ))}
            </group>

            {/* EFEITOS ESPECIAIS E PARTICULAS */}
            <Sparkles count={200} scale={25} size={4} speed={0.4} opacity={0.5} color="#cyan" />
            
            {/* CONTROLES */}
            <OrbitControls 
              enablePan={false} 
              minDistance={15} 
              maxDistance={60} 
              autoRotate 
              autoRotateSpeed={0.5}
            />

            {/* PÓS-PROCESSAMENTO */}
            <EffectComposer>
              <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
              <Noise opacity={0.02} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
          </Canvas>
        </div>
      </div>
  );
}
