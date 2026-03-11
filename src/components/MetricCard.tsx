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
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-lg hover:border-[var(--accent-emerald)] transition-all flex flex-col items-start justify-center"
    >
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {loading ? (
        <div className="h-6 w-24 bg-[var(--surface-strong)] rounded-md animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-[var(--accent-emerald)]">
          {value ?? 0}
        </p>
      )}
      <p className="text-[var(--text-secondary)] text-xs mt-1">
        Atualizado em tempo real
      </p>
    </motion.div>
  );
}
