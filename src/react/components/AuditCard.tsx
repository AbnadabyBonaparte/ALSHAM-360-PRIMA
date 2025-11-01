import { motion } from "framer-motion";

interface AuditCardProps {
  policy: string;
  status: "OK" | "Warning" | "Critical";
  details?: string;
  delay?: number;
}

export default function AuditCard({ policy, status, details, delay = 0 }: AuditCardProps) {
  const colors = {
    OK: "border-emerald-600 text-emerald-400",
    Warning: "border-amber-500 text-amber-400",
    Critical: "border-red-600 text-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`border ${colors[status]} bg-neutral-900 rounded-xl p-5 shadow-lg`}
    >
      <h3 className="text-lg font-semibold mb-2">{policy}</h3>
      <p className="text-sm mb-2 text-gray-400">Status: {status}</p>
      {details && <p className="text-xs text-gray-500">{details}</p>}
    </motion.div>
  );
}
