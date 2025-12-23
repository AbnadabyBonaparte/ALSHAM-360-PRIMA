// src/pages/LeadScoring.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/supabase/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, Zap, ThermometerIcon, Filter } from 'lucide-react';

type ScoreBand = 'ALL' | 'HOT' | 'WARM' | 'COLD' | 'ICE';

type LeadScoringRow = {
  id: number;
  org_id: string;
  lead_id: string;
  score: number;
  factors: {
    demografico: number;
    comportamento: number;
    engajamento: number;
  };
  generated_at: string;
  leads_crm?: {
    nome: string | null;
    empresa: string | null;
    email: string | null;
  } | null;
};

function safeNumber(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp01(n: number) {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function formatNumber(n: number, digits = 0) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function getFactorColor(avg: number) {
  if (avg >= 76) return 'var(--accent-emerald)';
  if (avg >= 51) return 'var(--accent-sky)';
  if (avg >= 26) return 'var(--accent-warning)';
  return 'var(--accent-alert)';
}

function getScoreClassification(score: number) {
  if (score >= 76) {
    return {
      label: 'QUENTE',
      icon: '🔥',
      // ✅ EXACT: regra de badge (sem extras)
      badgeClass: 'bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]',
      barClass: 'bg-[var(--accent-emerald)]/20',
      barFillStyle: { backgroundColor: 'var(--accent-emerald)' } as React.CSSProperties,
      // ✅ toque final: row quente (sutil)
      hotRowStyle: {
        backgroundColor: 'color-mix(in srgb, var(--accent-emerald) 3%, transparent)',
      } as React.CSSProperties,
    };
  }
  if (score >= 51) {
    return {
      label: 'MORNO',
      icon: '☀️',
      badgeClass: 'bg-[var(--accent-sky)]/10 text-[var(--accent-sky)]',
      barClass: 'bg-[var(--accent-sky)]/20',
      barFillStyle: { backgroundColor: 'var(--accent-sky)' } as React.CSSProperties,
      hotRowStyle: undefined as React.CSSProperties | undefined,
    };
  }
  if (score >= 26) {
    return {
      label: 'FRIO',
      icon: '🌡️',
      badgeClass: 'bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]',
      barClass: 'bg-[var(--accent-warning)]/20',
      barFillStyle: { backgroundColor: 'var(--accent-warning)' } as React.CSSProperties,
      hotRowStyle: undefined as React.CSSProperties | undefined,
    };
  }
  return {
    label: 'GELADO',
    icon: '❄️',
    badgeClass: 'bg-[var(--accent-alert)]/10 text-[var(--accent-alert)]',
    barClass: 'bg-[var(--accent-alert)]/20',
    barFillStyle: { backgroundColor: 'var(--accent-alert)' } as React.CSSProperties,
    hotRowStyle: undefined as React.CSSProperties | undefined,
  };
}

function matchesBand(score: number, band: ScoreBand) {
  if (band === 'ALL') return true;
  if (band === 'HOT') return score >= 76 && score <= 100;
  if (band === 'WARM') return score >= 51 && score <= 75;
  if (band === 'COLD') return score >= 26 && score <= 50;
  return score >= 0 && score <= 25;
}

// Mini Radar (SVG puro, leve, sem libs) — cor varia pelo avg dos fatores
function MiniRadar({ factors }: { factors: LeadScoringRow['factors'] }) {
  const size = 54;
  const cx = size / 2;
  const cy = size / 2;
  const r = 18;

  const d = clamp01(safeNumber(factors.demografico) / 100);
  const c = clamp01(safeNumber(factors.comportamento) / 100);
  const e = clamp01(safeNumber(factors.engajamento) / 100);

  const avgFactors = ((d + c + e) / 3) * 100;
  const color = getFactorColor(avgFactors);

  // 3 eixos: topo, baixo-esquerda, baixo-direita
  const angles = [-Math.PI / 2, (2 * Math.PI) / 3 - Math.PI / 2, (4 * Math.PI) / 3 - Math.PI / 2];

  const axisPoints = angles.map((a) => ({
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  }));

  const values = [d, c, e];

  const poly = values
    .map((v, i) => {
      const a = angles[i];
      return {
        x: cx + r * v * Math.cos(a),
        y: cy + r * v * Math.sin(a),
      };
    })
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  const triangle = axisPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg width={size} height={size} role="img" aria-label="Radar de fatores">
      <polygon points={triangle} fill="none" stroke="var(--border)" strokeWidth="1" />
      <polyline points={`${cx},${cy} ${axisPoints[0].x},${axisPoints[0].y}`} stroke="var(--border)" strokeWidth="1" />
      <polyline points={`${cx},${cy} ${axisPoints[1].x},${axisPoints[1].y}`} stroke="var(--border)" strokeWidth="1" />
      <polyline points={`${cx},${cy} ${axisPoints[2].x},${axisPoints[2].y}`} stroke="var(--border)" strokeWidth="1" />

      <polygon points={poly} fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export default function LeadScoring() {
  const currentOrgId =
    useAuthStore((s: any) => s?.currentOrgId ?? s?.orgId ?? s?.org?.id ?? s?.profile?.org_id) ?? null;

  const [rows, setRows] = useState<LeadScoringRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [band, setBand] = useState<ScoreBand>('ALL');
  const [search, setSearch] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentOrgId) {
        setRows([]);
        setError('Org não encontrada. Verifique sua sessão/seleção de organização.');
        return;
      }

      const { data, error } = await supabase
        .from('lead_scoring')
        .select(
          `
          *,
          leads_crm (
            nome,
            empresa,
            email
          )
        `
        )
        .eq('org_id', currentOrgId) // ✅ SEMPRE filtrar por org_id
        .order('score', { ascending: false });

      if (error) throw error;

      const normalized = (data ?? []).map((r: any) => ({
        ...r,
        score: safeNumber(r?.score),
        factors: {
          demografico: safeNumber(r?.factors?.demografico),
          comportamento: safeNumber(r?.factors?.comportamento),
          engajamento: safeNumber(r?.factors?.engajamento),
        },
      })) as LeadScoringRow[];

      setRows(normalized);
    } catch (e: any) {
      setRows([]);
      setError(e?.message ?? 'Erro ao carregar Lead Scoring.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrgId]);

  // ✅ Busca por nome (e também empresa)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const nome = (r.leads_crm?.nome ?? '').toString().toLowerCase();
      const empresa = (r.leads_crm?.empresa ?? '').toString().toLowerCase();
      const okSearch = q.length === 0 || nome.includes(q) || empresa.includes(q);
      const okBand = matchesBand(r.score, band);
      return okSearch && okBand;
    });
  }, [rows, band, search]);

  // KPIs obrigatórios
  const kpis = useMemo(() => {
    const total = rows.length;
    const hot = rows.filter((r) => r.score >= 76).length;
    const warm = rows.filter((r) => r.score >= 51 && r.score <= 75).length;
    const avg = total ? rows.reduce((acc, r) => acc + safeNumber(r.score), 0) / total : 0;

    // Taxa de Conversão (proxy governável): % leads quentes
    const conversionRate = total ? (hot / total) * 100 : 0;

    return { total, hot, warm, avg, conversionRate };
  }, [rows]);

  // Distribuição por faixa (recomendado) — sem libs
  const distribution = useMemo(() => {
    const ice = rows.filter((r) => matchesBand(r.score, 'ICE')).length;
    const cold = rows.filter((r) => matchesBand(r.score, 'COLD')).length;
    const warm = rows.filter((r) => matchesBand(r.score, 'WARM')).length;
    const hot = rows.filter((r) => matchesBand(r.score, 'HOT')).length;
    const max = Math.max(1, ice, cold, warm, hot);

    return {
      max,
      items: [
        { label: '0–25', count: ice, cls: 'bg-[var(--accent-alert)]/20' },
        { label: '26–50', count: cold, cls: 'bg-[var(--accent-warning)]/20' },
        { label: '51–75', count: warm, cls: 'bg-[var(--accent-sky)]/20' },
        { label: '76–100', count: hot, cls: 'bg-[var(--accent-emerald)]/20' },
      ],
    };
  }, [rows]);

  return (
    <div className="p-6 space-y-6">
      {/* Header + animação leve */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Lead Scoring</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Score total (0–100) com leitura instantânea de fatores e priorização por temperatura.
        </p>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full bg-[var(--surface)] border border-[var(--border)]" />
            ))}
          </div>
          <Skeleton className="h-20 w-full bg-[var(--surface)] border border-[var(--border)]" />
          <Skeleton className="h-80 w-full bg-[var(--surface)] border border-[var(--border)]" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Card className="bg-[var(--surface)] border border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">Erro</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-sm text-[var(--text-secondary)]">{error}</p>
            <Button onClick={fetchData} className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!loading && !error && rows.length === 0 && (
        <Card className="bg-[var(--surface)] border border-[var(--border)]">
          <CardContent className="py-12 text-center space-y-2">
            <p className="text-[var(--text-primary)] font-medium">Nenhum lead pontuado ainda</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Quando o motor de scoring gerar pontuações, elas aparecerão aqui.
            </p>
            <div className="pt-4">
              <Button onClick={fetchData} className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]">
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main */}
      {!loading && !error && rows.length > 0 && (
        <>
          {/* KPIs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            <Card className="bg-[var(--surface)] border border-[var(--border)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Score Médio Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-[var(--text-secondary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-[var(--text-primary)]">{formatNumber(kpis.avg, 1)}</div>
                <p className="text-xs text-[var(--text-secondary)]">Base: {formatNumber(kpis.total)} leads</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--surface)] border border-[var(--border)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Leads Quentes</CardTitle>
                <Zap className="h-4 w-4 text-[var(--text-secondary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-[var(--text-primary)]">{formatNumber(kpis.hot)}</div>
                <p className="text-xs text-[var(--text-secondary)]">Score ≥ 76</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--surface)] border border-[var(--border)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Leads Mornos</CardTitle>
                <ThermometerIcon className="h-4 w-4 text-[var(--text-secondary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-[var(--text-primary)]">{formatNumber(kpis.warm)}</div>
                <p className="text-xs text-[var(--text-secondary)]">Score 51–75</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--surface)] border border-[var(--border)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Taxa de Conversão</CardTitle>
                <Target className="h-4 w-4 text-[var(--text-secondary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-[var(--text-primary)]">{formatNumber(kpis.conversionRate, 1)}%</div>
                <p className="text-xs text-[var(--text-secondary)]">Proxy: % de leads quentes</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filtros */}
          <Card className="bg-[var(--surface)] border border-[var(--border)]">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[var(--text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Filtros</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="w-full sm:w-64">
                    <Select value={band} onValueChange={(v) => setBand(v as ScoreBand)}>
                      <SelectTrigger className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]">
                        <SelectValue placeholder="Faixa de score" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--surface)] border border-[var(--border)]">
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="HOT">Quente (76–100)</SelectItem>
                        <SelectItem value="WARM">Morno (51–75)</SelectItem>
                        <SelectItem value="COLD">Frio (26–50)</SelectItem>
                        <SelectItem value="ICE">Gelado (0–25)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-80">
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por nome ou empresa..."
                      className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>

                  <Button onClick={fetchData} className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]">
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição */}
          <Card className="bg-[var(--surface)] border border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Distribuição por faixa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {distribution.items.map((it) => {
                  const pct = Math.round((it.count / distribution.max) * 100);
                  return (
                    <div key={it.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-secondary)]">{it.label}</span>
                        <span className="text-xs text-[var(--text-secondary)]">{formatNumber(it.count)}</span>
                      </div>
                      <div className="h-8 border border-[var(--border)] rounded-md overflow-hidden bg-[var(--surface)]">
                        <div className={`h-full ${it.cls}`} style={{ width: `${pct}%` }} aria-label={`Faixa ${it.label}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card className="bg-[var(--surface)] border border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Leads pontuados ({formatNumber(filtered.length)})</CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">Nenhum lead encontrado com os filtros atuais.</p>
                </div>
              ) : (
                <div className="w-full overflow-auto border border-[var(--border)] rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[var(--text-secondary)]">Lead</TableHead>
                        <TableHead className="text-[var(--text-secondary)]">Empresa</TableHead>
                        <TableHead className="text-[var(--text-secondary)]">Score Total</TableHead>
                        <TableHead className="text-[var(--text-secondary)]">Demográfico</TableHead>
                        <TableHead className="text-[var(--text-secondary)]">Comportamento</TableHead>
                        <TableHead className="text-[var(--text-secondary)]">Engajamento</TableHead>
                        <TableHead className="text-[var(--text-secondary)]">Radar</TableHead>
                        <TableHead className="text-[var(--text-secondary)]">Badge Status</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filtered.map((r) => {
                        const leadName = r.leads_crm?.nome ?? '—';
                        const leadCompany = r.leads_crm?.empresa ?? '—';
                        const leadEmail = r.leads_crm?.email ?? '';
                        const cls = getScoreClassification(r.score);
                        const pct = Math.round(clamp01(r.score / 100) * 100);

                        return (
                          <TableRow key={r.id} className="hover:bg-[var(--surface)]/60" style={cls.hotRowStyle}>
                            <TableCell className="text-[var(--text-primary)]">
                              <div className="flex flex-col">
                                <span className="font-medium">{leadName}</span>
                                <span className="text-xs text-[var(--text-secondary)]">{leadEmail}</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-[var(--text-primary)]">{leadCompany}</TableCell>

                            {/* Score: número + progress bar por status */}
                            <TableCell className="text-[var(--text-primary)]">
                              <div className="flex flex-col gap-2 min-w-[180px]">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-semibold">{formatNumber(r.score)}</span>
                                  <span className="text-xs text-[var(--text-secondary)]">/ 100</span>
                                </div>
                                <div className={`h-2 rounded-md overflow-hidden ${cls.barClass}`}>
                                  <div className="h-full" style={{ width: `${pct}%`, ...cls.barFillStyle }} aria-label="Progresso de score" />
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-[var(--text-primary)]">{formatNumber(r.factors.demografico)}</TableCell>
                            <TableCell className="text-[var(--text-primary)]">{formatNumber(r.factors.comportamento)}</TableCell>
                            <TableCell className="text-[var(--text-primary)]">{formatNumber(r.factors.engajamento)}</TableCell>

                            <TableCell className="text-[var(--text-primary)]">
                              <MiniRadar factors={r.factors} />
                            </TableCell>

                            {/* Badge status (EXACT regra) */}
                            <TableCell>
                              <Badge className={cls.badgeClass}>
                                <span className="mr-1">{cls.icon}</span>
                                {cls.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
