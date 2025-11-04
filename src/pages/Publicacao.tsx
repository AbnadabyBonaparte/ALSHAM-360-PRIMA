import ManifestoSupremo from "../components/ManifestoSupremo";
import VersaoAtual from "../components/VersaoAtual";
import { motion } from "framer-motion";

export default function Publicacao() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white px-6 py-16">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-emerald-400 mb-8 text-center"
      >
        🚀 Publicação Oficial — ALSHAM 360° PRIMA SUPREMO v10.0
      </motion.h1>

      <ManifestoSupremo />
      <VersaoAtual />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-10 text-center text-gray-400"
      >
        <p>📅 Data: {new Date().toLocaleDateString("pt-BR")}</p>
        <p>🌍 Ambiente: Produção — Vercel Cloud (Washington D.C. IAD1)</p>
        <p>🧠 Orquestrador: Citizen Supremo X.1</p>
        <p>🏗️ Arquitetura: ALSHAM 360° PRIMA — HARMONIZED RELEASE R25</p>
      </motion.div>
    </div>
  );
}
