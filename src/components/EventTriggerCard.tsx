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
  color = "bg-[var(--accent-emerald)] hover:bg-[var(--accent-emerald)]",
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
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-lg flex flex-col justify-between"
    >
      <div>
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-[var(--text-secondary)] text-sm">{description}</p>
      </div>
      <button
        onClick={triggerEvent}
        className={`mt-4 px-4 py-2 rounded-lg font-semibold text-[var(--text)] transition ${color}`}
      >
        Disparar
      </button>
    </motion.div>
  );
}
