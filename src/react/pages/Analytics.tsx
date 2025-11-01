import { motion } from "framer-motion";

export default function Analytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <h2 className="text-2xl font-semibold mb-2">📊 Analytics & BI</h2>
      <p className="text-gray-400">
        Métricas dinâmicas e relatórios inteligentes do Supabase em breve.
      </p>
    </motion.div>
  );
}
