import { motion } from "framer-motion";

export default function Financeiro() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <h2 className="text-2xl font-semibold mb-2">💰 Gestão Financeira</h2>
      <p className="text-gray-400">
        Controle de receita, despesas e previsões financeiras automáticas.
      </p>
    </motion.div>
  );
}
