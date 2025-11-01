import { useState } from "react";
import EventTriggerCard from "../components/EventTriggerCard";
import LogEntry from "../components/LogEntry";

export default function Automacoes() {
  const [logs, setLogs] = useState<string[]>([]);

  const eventos = [
    {
      title: "🧩 Novo Lead Capturado",
      description: "Envia os dados do lead para o pipeline e aciona o N8N Guardian.",
      endpoint: "https://n8n.alshamglobal.com/webhook/lead_capturado",
      delay: 0.1,
    },
    {
      title: "💸 Nova Venda Confirmada",
      description: "Cria registro financeiro no Supabase e envia alerta para WhatsApp.",
      endpoint: "https://n8n.alshamglobal.com/webhook/venda_confirmada",
      delay: 0.3,
    },
    {
      title: "📨 Mensagem de Boas-Vindas",
      description: "Dispara mensagem personalizada via WhatsApp e e-mail.",
      endpoint: "https://n8n.alshamglobal.com/webhook/boas_vindas",
      delay: 0.5,
    },
    {
      title: "🧠 IA de Recomendação",
      description: "Executa IA preditiva e gera recomendações automáticas no Notion.",
      endpoint: "https://n8n.alshamglobal.com/webhook/recomendacao_ia",
      delay: 0.7,
    },
  ];

  async function handleTrigger(endpoint: string) {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] → Evento disparado: ${endpoint}`, ...prev]);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (res.ok) {
        setLogs((prev) => [`[${timestamp}] ✅ Sucesso: ${endpoint}`, ...prev]);
      } else {
        setLogs((prev) => [`[${timestamp}] ⚠️ Erro ao enviar evento`, ...prev]);
      }
    } catch {
      setLogs((prev) => [`[${timestamp}] ❌ Falha de conexão`, ...prev]);
    }
  }

  return (
    <div className="min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">⚙️ Automação Omnichannel Suprema</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {eventos.map((e, i) => (
          <EventTriggerCard
            key={i}
            title={e.title}
            description={e.description}
            endpoint={e.endpoint}
            delay={e.delay}
          />
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">🧾 Logs de Execução</h3>
        <div className="h-40 overflow-y-auto text-gray-300 font-mono">
          {logs.length === 0 ? (
            <p className="text-gray-500">Nenhum evento registrado ainda.</p>
          ) : (
            logs.map((log, i) => <LogEntry key={i} message={log} />)
          )}
        </div>
      </div>
    </div>
  );
}
