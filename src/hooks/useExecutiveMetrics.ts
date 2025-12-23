import { useMemo } from 'react';

export const BOARDROOM_RULES = {
  EBITDA_EXCELLENT_THRESHOLD: 25,
  LTV_CAC_EXCELLENT: 3,
  RUNWAY_EXCELLENT: 18,
};

export interface ExecutiveMetrics {
  revenueYTD: number;
  revenueGrowth: number;
  revenueTrend: { month: string; revenue: number; profit?: number }[];
  ebitda: number;
  ebitdaMargin: number;
  ltvCacRatio: number;
  runwayMonths: number;
  headcount?: number;
  marketSentiment: number;
}

export interface DepartmentMetric {
  name: string;
  status: 'optimal' | 'warning' | 'critical';
  metric: string;
  value: string;
}

/**
 * Hook simplificado apenas para garantir compilação e demo local.
 * Substitua pelos dados reais do Supabase quando a API estiver pronta.
 */
export function useExecutiveMetrics() {
  const metrics = useMemo<ExecutiveMetrics>(() => ({
    revenueYTD: 12_400_000,
    revenueGrowth: 58,
    revenueTrend: [
      { month: 'JAN', revenue: 820000 },
      { month: 'FEV', revenue: 910000 },
      { month: 'MAR', revenue: 1030000 },
      { month: 'ABR', revenue: 1180000 },
      { month: 'MAI', revenue: 1260000 },
      { month: 'JUN', revenue: 1390000 },
      { month: 'JUL', revenue: 1510000 },
      { month: 'AGO', revenue: 1670000 },
      { month: 'SET', revenue: 1780000 },
      { month: 'OUT', revenue: 1910000 },
      { month: 'NOV', revenue: 2050000 },
      { month: 'DEZ', revenue: 2190000 },
    ],
    ebitda: 4_200_000,
    ebitdaMargin: 34.2,
    ltvCacRatio: 7.2,
    runwayMonths: 24,
    headcount: 180,
    marketSentiment: 92,
  }), []);

  const departments = useMemo<DepartmentMetric[]>(() => ([
    { name: 'GO-TO-MARKET', status: 'optimal', metric: 'Win-rate enterprise', value: '41%' },
    { name: 'PRODUTO', status: 'warning', metric: 'Bug burn-down semanal', value: '92%' },
    { name: 'SUPORTE', status: 'optimal', metric: 'CSAT | FCR', value: '98 • 87%' },
    { name: 'FINOPS', status: 'critical', metric: 'Burn múltiplo', value: '2.3x' },
  ]), []);

  return { metrics, departments, loading: false };
}










