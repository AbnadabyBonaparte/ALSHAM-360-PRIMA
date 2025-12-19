import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "@/hooks/useTheme";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartSupremoProps {
  title: string;
  labels: string[];
  dataValues: number[];
  color?: string;
}

export default function ChartSupremo({
  title,
  labels,
  dataValues,
  color,
}: ChartSupremoProps) {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  // Use color from props or default to theme accent
  const chartColor = color || themeColors.accentPrimary;

  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: dataValues,
        fill: false,
        borderColor: chartColor,
        backgroundColor: chartColor,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: themeColors.textSecondary,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: themeColors.textSecondary },
        grid: { color: themeColors.border },
      },
      y: {
        ticks: { color: themeColors.textSecondary },
        grid: { color: themeColors.border },
      },
    },
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-[var(--text)] mb-4">{title}</h2>
      <Line data={data} options={options} />
    </div>
  );
}
