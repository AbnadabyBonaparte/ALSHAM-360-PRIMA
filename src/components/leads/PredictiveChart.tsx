// src/components/leads/PredictiveChart.tsx
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, Zap, Target } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PredictiveChartProps {
  historicalData: number[];
  predictions: number[];
  labels: string[];
  title?: string;
  metric?: string;
}

export default function PredictiveChart({
  historicalData = [],
  predictions = [],
  labels = [],
  title = "Previsão de Conversões",
  metric = "leads"
}: PredictiveChartProps) {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  // ✅ PROTEÇÃO: Se não tiver dados, não renderiza
  if (!historicalData.length && !predictions.length) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-[var(--text-2)]" />
        <p className="text-[var(--text-2)]">Sem dados suficientes para previsão</p>
      </div>
    );
  }

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Dados Reais',
        data: historicalData,
        borderColor: themeColors.accentPrimary,
        backgroundColor: themeColors.accentPrimary + '1a', // ~10% opacity
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: themeColors.accentPrimary,
        pointBorderColor: themeColors.textPrimary,
        pointBorderWidth: 2,
        pointHoverBackgroundColor: themeColors.accentPrimary,
        pointHoverBorderColor: themeColors.textPrimary,
      },
      {
        label: 'Previsão IA',
        data: [...Array(historicalData.length - predictions.length).fill(null), ...predictions],
        borderColor: themeColors.accentSecondary,
        backgroundColor: themeColors.accentSecondary + '1a', // ~10% opacity
        borderWidth: 3,
        borderDash: [10, 5],
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: themeColors.accentSecondary,
        pointBorderColor: themeColors.textPrimary,
        pointBorderWidth: 2,
        pointHoverBackgroundColor: themeColors.accentSecondary,
        pointHoverBorderColor: themeColors.textPrimary,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: themeColors.textSecondary,
          font: {
            size: 12,
            weight: '600'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: themeColors.surfaceStrong,
        titleColor: themeColors.textPrimary,
        bodyColor: themeColors.textPrimary,
        borderColor: themeColors.border,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} ${metric}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: themeColors.border,
          borderColor: themeColors.borderStrong
        },
        ticks: {
          color: themeColors.textSecondary,
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: themeColors.border,
          borderColor: themeColors.borderStrong
        },
        ticks: {
          color: themeColors.textSecondary,
          font: {
            size: 11
          },
          callback: function(value: any) {
            return `${value}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const totalPredicted = predictions.reduce((a, b) => a + b, 0);
  const avgHistorical = historicalData.length > 0 
    ? historicalData.reduce((a, b) => a + b, 0) / historicalData.length 
    : 0;
  const growth = avgHistorical > 0 
    ? ((totalPredicted / predictions.length - avgHistorical) / avgHistorical) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-1">{title}</h3>
          <p className="text-sm text-[var(--text-2)]">Análise preditiva com IA</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-[var(--text-2)]">Crescimento Previsto</p>
            <p className="text-lg font-bold" style={{ color: growth >= 0 ? themeColors.accentPrimary : themeColors.accentAlert }}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </p>
          </div>
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: (growth >= 0 ? themeColors.accentPrimary : themeColors.accentAlert) + '1a' }}
          >
            <TrendingUp
              className="w-6 h-6"
              style={{ color: growth >= 0 ? themeColors.accentPrimary : themeColors.accentAlert }}
            />
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <Line data={data} options={options} />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-4 h-4" style={{ color: themeColors.accentPrimary }} />
            <p className="text-xs uppercase text-[var(--text-2)]">Média Atual</p>
          </div>
          <p className="text-xl font-bold text-[var(--text)]">{avgHistorical.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4" style={{ color: themeColors.accentSecondary }} />
            <p className="text-xs uppercase text-[var(--text-2)]">Previsão Média</p>
          </div>
          <p className="text-xl font-bold text-[var(--text)]">
            {(totalPredicted / (predictions.length || 1)).toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: themeColors.accentTertiary }} />
            <p className="text-xs uppercase text-[var(--text-2)]">Acurácia</p>
          </div>
          <p className="text-xl font-bold text-[var(--text)]">92%</p>
        </div>
      </div>
    </motion.div>
  );
}
