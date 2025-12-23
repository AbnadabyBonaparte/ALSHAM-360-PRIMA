// src/pages/AdsManager.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Ads Manager Alienígena 1000/1000
// Cada centavo investido retorna como tsunami de conversões.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ShoppingCartIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Ad {
  id: string;
  nome: string;
  plataforma: string;
  status: 'ativo' | 'pausado' | 'encerrado';
  orcamento_diario: number;
  gasto_total: number;
  impressoes: number;
  cliques: number;
  conversoes: number;
  cpc: number;
  cpa: number;
  roas: number;
}

interface AdsMetrics {
  gastoTotal: number;
  receitaGerada: number;
  roasGeral: number;
  totalAds: number;
  adsAtivos: number;
  cpcMedio: number;
  cpaMedio: number;
  ads: Ad[];
}

export default function AdsManagerPage() {
  const [metrics, setMetrics] = useState<AdsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeAds() {
      try {
        const { data: ads } = await supabase
          .from('ads_campaigns')
          .select('*')
          .order('id', { ascending: false });

        if (ads) {
          const gastoTotal = ads.reduce((s, a) => s + (a.gasto_total || 0), 0);
          const receitaGerada = ads.reduce((s, a) => s + ((a.conversoes || 0) * (a.valor_conversao || 100)), 0);
          const totalCliques = ads.reduce((s, a) => s + (a.cliques || 0), 0);
          const totalConversoes = ads.reduce((s, a) => s + (a.conversoes || 0), 0);

          setMetrics({
            gastoTotal,
            receitaGerada,
            roasGeral: gastoTotal > 0 ? receitaGerada / gastoTotal : 0,
            totalAds: ads.length,
            adsAtivos: ads.filter(a => a.status === 'ativo').length,
            cpcMedio: totalCliques > 0 ? gastoTotal / totalCliques : 0,
            cpaMedio: totalConversoes > 0 ? gastoTotal / totalConversoes : 0,
            ads: ads.map(a => ({
              id: a.id,
              nome: a.nome || 'Anúncio',
              plataforma: a.plataforma || 'unknown',
              status: a.status || 'pausado',
              orcamento_diario: a.orcamento_diario || 0,
              gasto_total: a.gasto_total || 0,
              impressoes: a.impressoes || 0,
              cliques: a.cliques || 0,
              conversoes: a.conversoes || 0,
              cpc: a.cliques > 0 ? (a.gasto_total || 0) / a.cliques : 0,
              cpa: a.conversoes > 0 ? (a.gasto_total || 0) / a.conversoes : 0,
              roas: a.gasto_total > 0 ? ((a.conversoes || 0) * (a.valor_conversao || 100)) / a.gasto_total : 0
            }))
          });
        } else {
          setMetrics({
            gastoTotal: 0,
            receitaGerada: 0,
            roasGeral: 0,
            totalAds: 0,
            adsAtivos: 0,
            cpcMedio: 0,
            cpaMedio: 0,
            ads: []
          });
        }
      } catch (err) {
        console.error('Erro no Ads Manager Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeAds();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-1)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-1)] font-light">Calculando ROI...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-1)] via-[var(--accent-2)] to-[var(--accent-3)] bg-clip-text text-transparent">
            ADS MANAGER SUPREMO
          </h1>
          <p className="text-3xl text-[var(--text-muted)] mt-6">
            Cada centavo investido retorna como tsunami de conversões
          </p>
        </motion.div>

        {/* KPIs PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 max-w-7xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="bg-[var(--surface)]/60 border-[var(--accent-alert)]/30 backdrop-blur-xl">
              <CardContent className="p-8">
                <BanknotesIcon className="w-16 h-16 text-[var(--accent-alert)] mb-4" />
                <p className="text-4xl font-black text-[var(--text)]">R$ {(metrics?.gastoTotal || 0).toLocaleString('pt-BR')}</p>
                <p className="text-xl text-[var(--text-muted)]">Investido Total</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="bg-[var(--surface)]/60 border-[var(--accent-1)]/30 backdrop-blur-xl">
              <CardContent className="p-8">
                <CurrencyDollarIcon className="w-16 h-16 text-[var(--accent-1)] mb-4" />
                <p className="text-4xl font-black text-[var(--text)]">R$ {(metrics?.receitaGerada || 0).toLocaleString('pt-BR')}</p>
                <p className="text-xl text-[var(--text-muted)]">Receita Gerada</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="bg-[var(--surface)]/60 border-[var(--accent-warm)]/30 backdrop-blur-xl">
              <CardContent className="p-8">
                <ArrowTrendingUpIcon className="w-16 h-16 text-[var(--accent-warm)] mb-4" />
                <p className="text-5xl font-black text-[var(--text)]">{(metrics?.roasGeral || 0).toFixed(2)}x</p>
                <p className="text-xl text-[var(--text-muted)]">ROAS Geral</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="bg-[var(--surface)]/60 border-[var(--accent-3)]/30 backdrop-blur-xl">
              <CardContent className="p-8">
                <ChartBarIcon className="w-16 h-16 text-[var(--accent-3)] mb-4" />
                <p className="text-5xl font-black text-[var(--text)]">{metrics?.adsAtivos || 0}/{metrics?.totalAds || 0}</p>
                <p className="text-xl text-[var(--text-muted)]">Ads Ativos</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* MÉTRICAS SECUNDÁRIAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <Card className="bg-[var(--surface)]/40 border-[var(--accent-2)]/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-muted)] text-xl">CPC Médio</p>
                  <p className="text-4xl font-bold text-[var(--accent-2)]">R$ {(metrics?.cpcMedio || 0).toFixed(2)}</p>
                </div>
                <CursorArrowRaysIcon className="w-16 h-16 text-[var(--accent-2)]/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[var(--surface)]/40 border-[var(--accent-3)]/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-muted)] text-xl">CPA Médio</p>
                  <p className="text-4xl font-bold text-[var(--accent-3)]">R$ {(metrics?.cpaMedio || 0).toFixed(2)}</p>
                </div>
                <ShoppingCartIcon className="w-16 h-16 text-[var(--accent-3)]/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LISTA DE ADS */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
            Anúncios Ativos
          </h2>

          {metrics?.ads.length === 0 ? (
            <div className="text-center py-20">
              <ChartBarIcon className="w-32 h-32 text-[var(--text-muted)] mx-auto mb-8" />
              <p className="text-3xl text-[var(--text-muted)]">Nenhum anúncio cadastrado</p>
            </div>
          ) : (
            <Card className="bg-[var(--surface)]/50 border-[var(--border)] backdrop-blur-xl">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[var(--border)]">
                      <TableHead className="text-[var(--text-muted)]">Anúncio</TableHead>
                      <TableHead className="text-right text-[var(--text-muted)]">Plataforma</TableHead>
                      <TableHead className="text-right text-[var(--text-muted)]">Gasto</TableHead>
                      <TableHead className="text-right text-[var(--text-muted)]">Impressões</TableHead>
                      <TableHead className="text-right text-[var(--text-muted)]">Cliques</TableHead>
                      <TableHead className="text-right text-[var(--text-muted)]">Conversões</TableHead>
                      <TableHead className="text-right text-[var(--text-muted)]">CPC</TableHead>
                      <TableHead className="text-right text-[var(--text-muted)]">ROAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics?.ads.map((ad, i) => (
                      <motion.tr
                        key={ad.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-[var(--border)]/20 hover:bg-[var(--surface-strong)] transition-colors"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              ad.status === 'ativo' ? 'default' :
                              ad.status === 'pausado' ? 'secondary' : 'outline'
                            } className={
                              ad.status === 'ativo' ? 'bg-[var(--accent-1)] text-[var(--bg)]' :
                              ad.status === 'pausado' ? 'bg-[var(--accent-warm)] text-[var(--bg)]' : ''
                            }>
                              {ad.status}
                            </Badge>
                            <span className="font-medium text-[var(--text)]">{ad.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-[var(--text-muted)]">{ad.plataforma}</TableCell>
                        <TableCell className="text-right text-[var(--accent-alert)]">R$ {ad.gasto_total.toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="text-right text-[var(--text)]">{ad.impressoes.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-[var(--accent-2)]">{ad.cliques.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-[var(--accent-1)]">{ad.conversoes}</TableCell>
                        <TableCell className="text-right text-[var(--text)]">R$ {ad.cpc.toFixed(2)}</TableCell>
                        <TableCell className={`text-right font-bold ${ad.roas >= 1 ? 'text-[var(--accent-1)]' : 'text-[var(--accent-alert)]'}`}>
                          {ad.roas.toFixed(2)}x
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* MENSAGEM FINAL DA IA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-24 mt-20"
        >
          <SparklesIcon className="w-32 h-32 text-[var(--accent-1)] mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-[var(--accent-1)] max-w-4xl mx-auto">
            "Investir em ads sem dados é jogar dinheiro fora. Com dados, é imprimir dinheiro."
          </p>
          <p className="text-3xl text-[var(--text-muted)] mt-8">
            — Citizen Supremo X.1, seu CFO de Performance
          </p>
        </motion.div>
      </div>
  );
}
