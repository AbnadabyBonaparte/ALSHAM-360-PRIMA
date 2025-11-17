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
  
  // ✅ PROTEÇÃO: Se não tiver dados, não renderiza
  if (!historicalData.length && !predictions.length) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p className="text-gray-400">Sem dados suficientes para previsão</p>
      </div>
    );
  }

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Dados Reais',
        data: historicalData,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(16, 185, 129)',
        pointHoverBorderColor: '#fff',
      },
      {
        label: 'Previsão IA',
        data: [...Array(historicalData.length - predictions.length).fill(null), ...predictions],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        borderDash: [10, 5],
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(168, 85, 247)',
        pointHoverBorderColor: '#fff',
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
          color: '#9ca3af',
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
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
          color: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af',
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
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">Análise preditiva com IA</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">Crescimento Previsto</p>
            <p className={`text-lg font-bold ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </p>
          </div>
          <div className={`p-3 rounded-xl ${growth >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <TrendingUp className={`w-6 h-6 ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <Line data={data} options={options} />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <p className="text-xs uppercase text-gray-400">Média Atual</p>
          </div>
          <p className="text-xl font-bold text-white">{avgHistorical.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <p className="text-xs uppercase text-gray-400">Previsão Média</p>
          </div>
          <p className="text-xl font-bold text-white">
            {(totalPredicted / (predictions.length || 1)).toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <p className="text-xs uppercase text-gray-400">Acurácia</p>
          </div>
          <p className="text-xl font-bold text-white">92%</p>
        </div>
      </div>
    </motion.div>
  );
}
