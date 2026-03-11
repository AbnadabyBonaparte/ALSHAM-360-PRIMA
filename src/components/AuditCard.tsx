import { motion } from "framer-motion";

interface AuditCardProps {
  policy: string;
  status: "OK" | "Warning" | "Critical";
  details?: string;
  delay?: number;
}

export default function AuditCard({ policy, status, details, delay = 0 }: AuditCardProps) {
  const colors = {
    OK: "border-[var(--accent-emerald)] text-[var(--accent-emerald)]",
    Warning: "border-[var(--accent-warning)] text-[var(--accent-warning)]",
    Critical: "border-[var(--accent-alert)] text-[var(--accent-alert)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`border ${colors[status]} bg-[var(--surface)] rounded-xl p-5 shadow-lg`}
    >
      <h3 className="text-lg font-semibold mb-2">{policy}</h3>
      <p className="text-sm mb-2 text-[var(--text-secondary)]">Status: {status}</p>
      {details && <p className="text-xs text-[var(--text-secondary)]">{details}</p>}
    </motion.div>
  );
}
