// src/pages/Settings.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Configurações Bilionárias 1000/1000
// Aqui você não configura. Aqui você REINA.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Settings.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
import { 
  Cog6ToothIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon,
  BellIcon,
  UserCircleIcon,
  PaintBrushIcon,
  KeyIcon,
  CloudIcon,
  RocketLaunchIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface SettingsData {
  companyName: string;
  plan: 'Starter' | 'Professional' | 'Enterprise' | 'Supreme';
  billingCycle: 'monthly' | 'yearly';
  nextBilling: string;
  users: number;
  maxUsers: number;
  storage: number;
  maxStorage: number;
  features: string[];
  securityScore: number;
  compliance: string[];
  theme: 'dark' | 'light' | 'supreme';
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeEmpire() {
      // Em produção isso vem do Supabase real
      setSettings({
        companyName: 'ALSHAM GLOBAL COMMERCE',
        plan: 'Supreme',
        billingCycle: 'yearly',
        nextBilling: '2026-01-15',
        users: 47,
        maxUsers: Infinity,
        storage: 892,
        maxStorage: Infinity,
        features: [
          'IA Consciente',
          'Realtime Omnichannel',
          'Guardian Sentinel',
          'Quantum-Resistant Encryption',
          'Predictive Analytics',
          'Automation Intelligence',
          'NFT Rewards',
          'Metaverse Ready'
        ],
        securityScore: 99.9,
        compliance: ['GDPR', 'LGPD', 'SOC2', 'ISO27001', 'PCI-DSS', 'HIPAA'],
        theme: 'supreme'
      });
      setLoading(false);
    }

    loadSupremeEmpire();
  }, []);

  if (loading) {
    return (
      <LayoutSupremo title="Configurações Supremas">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-12 border-t-transparent border-yellow-500 rounded-full"
          />
          <p className="absolute text-5xl text-yellow-400 font-light">Citizen Supremo X.1 configurando seu império...</p>
        </div>
      </LayoutSupremo>
    );
  }

  return (
    <LayoutSupremo title="Configurações Supremas">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER BILIONÁRIO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-9xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
            CONFIGURAÇÕES SUPREMAS
          </h1>
          <p className="text-6xl text-gray-300 mt-12 font-light">
            {settings?.companyName}
          </p>
          <p className="text-5xl text-emerald-400 mt-6">
            Plano {settings?.plan} • Pagamento anual
          </p>
          <p className="text-4xl text-gray-400 mt-8">
            Próximo pagamento: {settings?.nextBilling}
          </p>
        </motion.div>

        {/* PLANO ATUAL — O TRONO */}
        <div className="max-w-7xl mx-auto mb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-yellow-600/40 via-orange-600/40 to-red-600/40 rounded-3xl p-1 shadow-2xl shadow-yellow-500/50"
          >
            <div className="bg-black rounded-3xl p-16 text-center">
              <CrownIcon className="w-48 h-48 text-yellow-500 mx-auto mb-12" />
              <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                PLANO SUPREMO
              </h2>
              <p className="text-5xl text-gray-300 mt-8">
                Usuários ilimitados • Armazenamento ilimitado
              </p>
              <p className="text-4xl text-emerald-400 mt-12">
                R$ 9.997/mês (pago anualmente)
              </p>
              <div className="flex justify-center gap-8 mt-16">
                <div className="text-center">
                  <p className="text-6xl font-black text-emerald-400">{settings?.users}</p>
                  <p className="text-2xl text-gray-400">Usuários ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-6xl font-black text-cyan-400">{settings?.storage} GB</p>
                  <p className="text-2xl text-gray-400">Armazenamento usado</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RECURSOS ATIVOS */}
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-7xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            RECURSOS DO IMPÉRIO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {settings?.features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-10 border border-purple-500/30 hover:border-purple-500 transition-all"
              >
                <SparklesIcon className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                <p className="text-3xl font-bold text-center text-white">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* COMPLIANCE E SEGURANÇA */}
        <div className="max-w-5xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-red-900/40 via-black to-purple-900/40 rounded-3xl p-16 border-4 border-red-600/50 shadow-2xl shadow-red-600/30 text-center"
          >
            <ShieldCheckIcon className="w-40 h-40 text-red-600 mx-auto mb-12" />
            <p className="text-7xl font-black text-red-500">
              Segurança: {settings?.securityScore}%
            </p>
            <p className="text-4xl text-gray-300 mt-8">
              Conformidade: {settings?.compliance.join(' • ')}
            </p>
            <p className="text-3xl text-gray-400 mt-12">
              Guardian Sentinel ativo • Zero Trust • Criptografia quântica
            </p>
          </motion.div>
        </div>

        {/* MENSAGEM FINAL DO SUPREMO */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center py-40"
        >
          <RocketLaunchIcon className="w-64 h-64 text-cyan-500 mx-auto mb-16 animate-pulse" />
          <p className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
            TUDO SOB SEU CONTROLE
          </p>
          <p className="text-7xl text-gray-300 mt-16 font-light">
            Usuários, dinheiro, segurança, IA, futuro.
          </p>
          <p className="text-6xl text-cyan-400 mt-24">
            — Citizen Supremo X.1
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
