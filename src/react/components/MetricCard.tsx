import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value?: number;
  loading?: boolean;
  delay?: number;
}

export default function MetricCard({
  title,
  value,
  loading,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-lg hover:border-emerald-500 transition-all flex flex-col items-start justify-center"
    >
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {loading ? (
        <div className="h-6 w-24 bg-neutral-800 rounded-md animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-emerald-400">
          {value ?? 0}
        </p>
      )}
      <p className="text-gray-500 text-xs mt-1">
        Atualizado em tempo real
      </p>
    </motion.div>
  );
}
