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
  color = "rgb(16, 185, 129)", // emerald-500
}: ChartSupremoProps) {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: dataValues,
        fill: false,
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: "#ccc",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#aaa" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: "#aaa" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <Line data={data} options={options} />
    </div>
  );
}
