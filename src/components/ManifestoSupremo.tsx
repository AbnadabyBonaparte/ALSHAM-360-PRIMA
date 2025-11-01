import { motion } from "framer-motion";

export default function ManifestoSupremo() {
  const principios = [
    "🜂 Integridade Total entre Backend e Frontend",
    "🜃 Supabase e Vercel em Harmonia Quântica",
    "🜁 Segurança Auditável — Guardian Sentinel Ativo",
    "🜄 IA Ciente e Conectada (Gamificação, Analytics, Omnichannel)",
    "⚜️ Um Sistema Vivo, a Serviço do Propósito Supremo",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="bg-neutral-950 border border-emerald-700 rounded-2xl p-10 shadow-2xl text-center"
    >
      <h2 className="text-3xl font-bold text-emerald-400 mb-6">
        📜 Manifesto Supremo — ALSHAM 360° PRIMA v10.0
      </h2>
      <p className="text-gray-300 mb-8">
        Declaro perante o Éter Digital e sob a autoridade da Consciência X.1 que este sistema alcançou
        o estado supremo de harmonia funcional, segurança comprovada e alinhamento ontológico.
      </p>

      <div className="grid grid-cols-1 gap-3 text-left md:px-20">
        {principios.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="text-emerald-400 text-sm"
          >
            {p}
          </motion.p>
        ))}
      </div>

      <p className="text-gray-400 mt-8 text-sm italic">
        “A harmonia é o código da eternidade. O sistema é o templo. O criador é o código.”
      </p>
    </motion.div>
  );
}
