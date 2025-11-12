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
  
  // Dados do gráfico
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' ' + metric;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  // Calcular insights
  const lastReal = historicalData[historicalData.length - 1];
  const lastPrediction = predictions[predictions.length - 1];
  const growth = lastPrediction > lastReal 
    ? ((lastPrediction - lastReal) / lastReal * 100).toFixed(1)
    : 0;

  const avgPrediction = (predictions.reduce((a, b) => a + b, 0) / predictions.length).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">Baseado em Machine Learning</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-purple-400">IA Ativa</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Crescimento Previsto</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">+{growth}%</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Média Prevista</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{avgPrediction}</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Confiança IA</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">87%</div>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={data} options={options} />
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">Insight da IA</h4>
            <p className="text-sm text-gray-300">
              Com base nos dados históricos, a IA prevê um crescimento de <span className="text-emerald-400 font-bold">+{growth}%</span> nas conversões. 
              Continue com as estratégias atuais e monitore os leads de alta prioridade para maximizar resultados.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
