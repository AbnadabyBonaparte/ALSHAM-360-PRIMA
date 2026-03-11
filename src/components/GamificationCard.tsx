import { motion } from "framer-motion";

interface GamificationCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  delay?: number;
}

export default function GamificationCard({
  title,
  value,
  subtitle,
  color = "text-[var(--accent-emerald)]",
  delay = 0,
}: GamificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-lg hover:border-[var(--accent-emerald)] transition-all"
    >
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-[var(--text-secondary)] text-sm mt-1">{subtitle}</p>}
    </motion.div>
  );
}
