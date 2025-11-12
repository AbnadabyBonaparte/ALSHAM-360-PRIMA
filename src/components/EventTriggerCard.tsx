import { motion } from "framer-motion";

interface EventTriggerCardProps {
  title: string;
  description: string;
  endpoint: string;
  color?: string;
  delay?: number;
}

export default function EventTriggerCard({
  title,
  description,
  endpoint,
  color = "bg-emerald-600 hover:bg-emerald-500",
  delay = 0,
}: EventTriggerCardProps) {
  async function triggerEvent() {
    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (res.ok) {
        alert("✅ Automação disparada com sucesso!");
      } else {
        alert("⚠️ Erro ao disparar automação.");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("❌ Falha na conexão.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-lg flex flex-col justify-between"
    >
      <div>
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <button
        onClick={triggerEvent}
        className={`mt-4 px-4 py-2 rounded-lg font-semibold text-white transition ${color}`}
      >
        Disparar
      </button>
    </motion.div>
  );
}
