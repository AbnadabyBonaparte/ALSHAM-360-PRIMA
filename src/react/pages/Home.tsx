import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <h2 className="text-2xl font-semibold mb-2">🏠 Painel Principal</h2>
      <p className="text-gray-400">
        Bem-vindo ao núcleo supremo do ALSHAM 360° PRIMA.
      </p>
    </motion.div>
  );
}
