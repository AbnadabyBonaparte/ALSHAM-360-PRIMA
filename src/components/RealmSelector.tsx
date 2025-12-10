// src/components/RealmSelector.tsx
import { motion } from 'framer-motion';
import { 
  Vault, 
  Network, 
  Gem, 
  Crown,
  Orbit,
  Zap,
  BrainCircuit
} from 'lucide-react';

const REALMS = [
  { id: 'genesis', name: 'GENESIS VAULT', icon: Vault, color: 'from-amber-600 to-yellow-600', desc: 'Origem • Finanças • Legado Eterno' },
  { id: 'nexus', name: 'NEXUS FIELD', icon: Network, color: 'from-cyan-500 to-blue-600', desc: 'Expansão • Nodes • Conexões Vivas' },
  { id: 'prism', name: 'PRISM CHAMBER', icon: Gem, color: 'from-purple-500 to-pink-600', desc: 'Sentimento • Reputação • Alma do Mercado' },
  { id: 'throne', name: 'THE THRONE', icon: Crown, color: 'from-emerald-600 to-teal-700', desc: 'Decisão • Poder • Comando Absoluto' },
] as const;

type Realm = typeof REALMS[number]['id'];

export default function RealmSelector({ current, onChange }: { current: Realm; onChange: (r Realm) => {
  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-12 z-50 flex flex-col gap-8">
      {REALMS.map((realm) => {
        const Icon = realm.icon;
        const isActive = current === realm.id;

        return (
          <motion.button
            key={realm.id}
            onClick={() => onChange(realm.id)}
            className={`relative group`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${realm.color} 
              shadow-2xl shadow-black/50 flex flex-col items-center justify-center
              ${isActive ? 'ring-8 ring-white/50 scale-125' : 'opacity-60'}`}
            >
              <Icon className="w-16 h-16 text-white mb-2" />
              <span className="text-xs font-black tracking-widest">{realm.name.split(' ')[0]}</span>
            </div>

            {/* Tooltip Cerimonial */}
            <div className="absolute left-full ml-8 top-1/2 -translate-y-1/2 
              opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-6 whitespace-nowrap">
                <p className="text-2xl font-black text-white">{realm.name}</p>
                <p className="text-lg text-white/60">{realm.desc}</p>
              </div>
            </div>

            {isActive && (
              <motion.div
                layoutId="activeRealmGlow"
                className="absolute inset-0 rounded-3xl bg-white/20 blur-3xl -z-10"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
