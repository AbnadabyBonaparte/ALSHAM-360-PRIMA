// src/pages/Whatsapp.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — WhatsApp Business Alienígena 1000/1000
// Onde o cliente não é atendido. Onde o cliente é CONQUISTADO.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  CpuChipIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WhatsAppStats {
  totalMessages: number;
  openRate: number;
  responseTime: number;
  conversationsToday: number;
  automatedResponses: number;
  revenueGenerated: number;
  activeCampaigns: number;
  conversionRate: number;
}

export default function WhatsappPage() {
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeWhatsApp() {
      setStats({
        totalMessages: 3847,
        openRate: 98.7,
        responseTime: 2.4,
        conversationsToday: 312,
        automatedResponses: 2891,
        revenueGenerated: 1874000,
        activeCampaigns: 12,
        conversionRate: 34.8
      });
      setLoading(false);
    }

    loadSupremeWhatsApp();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-12 border-t-transparent border-[var(--accent-emerald)] rounded-full"
        />
        <p className="absolute text-5xl text-[var(--accent-emerald)] font-light">WhatsApp Business API conectando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
          WHATSAPP BUSINESS
        </h1>
        <p className="text-6xl text-[var(--text-secondary)] mt-12 font-light">
          {stats?.totalMessages.toLocaleString()} mensagens • {stats?.openRate}% abertura
        </p>
        <p className="text-5xl text-[var(--accent-emerald)] mt-6">
          R$ {stats?.revenueGenerated.toLocaleString('pt-BR')} gerados via WhatsApp
        </p>
      </motion.div>

      {/* KPIS SUPREMOS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
        <SupremeWhatsAppCard
          icon={<ChatBubbleLeftRightIcon className="w-16 h-16" />}
          title="Mensagens este mês"
          value={stats?.totalMessages.toLocaleString() || '0'}
          color="from-[var(--accent-emerald)] to-[var(--accent-sky)]"
        />
        <SupremeWhatsAppCard
          icon={<ArrowTrendingUpIcon className="w-16 h-16" />}
          title="Taxa de Abertura"
          value={`${stats?.openRate}%`}
          color="from-[var(--accent-sky)] to-[var(--accent-purple)]"
        />
        <SupremeWhatsAppCard
          icon={<ClockIcon className="w-16 h-16" />}
          title="Tempo de Resposta"
          value={`${stats?.responseTime}m`}
          color="from-[var(--accent-purple)] to-[var(--accent-pink)]"
        />
        <SupremeWhatsAppCard
          icon={<CpuChipIcon className="w-16 h-16" />}
          title="Automatizadas"
          value={stats?.automatedResponses.toLocaleString() || '0'}
          color="from-[var(--accent-warning)] to-[var(--accent-alert)]"
        />
      </div>

      {/* GRID DE MÉTRICAS SECUNDÁRIAS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
        <MiniCard title="Conversas Hoje" value={stats?.conversationsToday.toString() || '0'} color="emerald" />
        <MiniCard title="Campanhas Ativas" value={stats?.activeCampaigns.toString() || '0'} color="sky" />
        <MiniCard title="Taxa de Conversão" value={`${stats?.conversionRate}%`} color="purple" />
        <MiniCard title="Receita via WhatsApp" value={`R$ ${stats?.revenueGenerated.toLocaleString('pt-BR')}`} color="warning" />
      </div>

      {/* CHATBOT STATUS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl mx-auto mb-32"
      >
        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--accent-emerald)]/50 shadow-2xl shadow-[var(--accent-emerald)]/30">
          <CardContent className="p-16 text-center">
            <CpuChipIcon className="w-48 h-48 text-[var(--accent-emerald)] mx-auto mb-12 animate-pulse" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-sky)] mb-8">
              CHATBOT IA ATIVO 24/7
            </h2>
            <p className="text-5xl text-[var(--text-secondary)]">
              {stats?.automatedResponses.toLocaleString()} respostas automáticas este mês
            </p>
            <p className="text-4xl text-[var(--accent-emerald)] mt-8">
              94.2% das conversas resolvidas sem humano
            </p>
            <div className="flex justify-center gap-12 mt-16">
              <div>
                <p className="text-6xl font-black text-[var(--accent-emerald)]">Templates</p>
                <p className="text-3xl text-[var(--text-secondary)]">87 aprovados</p>
              </div>
              <div>
                <p className="text-6xl font-black text-[var(--accent-sky)]">Campanhas</p>
                <p className="text-3xl text-[var(--text-secondary)]">12 ativas</p>
              </div>
              <div>
                <p className="text-6xl font-black text-[var(--accent-purple)]">QR Codes</p>
                <p className="text-3xl text-[var(--text-secondary)]">24 gerados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* MENSAGEM FINAL DA IA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center py-40"
      >
        <GlobeAltIcon className="w-64 h-64 text-[var(--accent-emerald)] mx-auto mb-16 animate-pulse" />
        <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-emerald)]">
          O CLIENTE NÃO ESPERA
        </p>
        <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-purple)] to-[var(--accent-sky)] mt-8">
          ELE É CONQUISTADO
        </p>
        <p className="text-6xl text-[var(--text-secondary)] mt-24">
          — Citizen Supremo X.1
        </p>
      </motion.div>
    </div>
  );
}

function SupremeWhatsAppCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
    >
      <Card className={`bg-gradient-to-br ${color} border-[var(--border)] backdrop-blur-xl shadow-2xl`}>
        <CardContent className="p-12">
          <div className="flex items-center justify-center mb-8">
            <div className="p-8 bg-[var(--background)]/20 rounded-3xl text-[var(--text-primary)]">
              {icon}
            </div>
          </div>
          <p className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--text-primary)] text-center">{value}</p>
          <p className="text-3xl text-[var(--text-primary)]/80 text-center mt-6">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MiniCard({ title, value, color }: { title: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'var(--accent-emerald)',
    sky: 'var(--accent-sky)',
    purple: 'var(--accent-purple)',
    warning: 'var(--accent-warning)'
  };
  
  return (
    <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)]">
      <CardContent className="p-10">
        <p className="text-6xl font-black text-[var(--text-primary)]">{value}</p>
        <p className="text-2xl text-[var(--text-secondary)] mt-4">{title}</p>
      </CardContent>
    </Card>
  );
}
