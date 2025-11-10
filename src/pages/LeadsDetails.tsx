// src/pages/LeadsDetails.tsx (ou similar)
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { getLead, updateLead, subscribeLeads, getLeadInteractions } from "../lib/supabase"; // Funções do Supabase
import { Loader2, Edit, Trash } from "lucide-react"; // Ícones

export default function LeadsDetails({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch inicial
  useEffect(() => {
    const fetchLead = async () => {
      try {
        const { data: leadData } = await getLead(leadId);
        const { data: interactionsData } = await getLeadInteractions(leadId);
        setLead(leadData);
        setInteractions(interactionsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();

    // Realtime subscription
    const unsubscribe = subscribeLeads((payload) => {
      if (payload.new.id === leadId) {
        setLead(payload.new); // Atualiza em tempo real
      }
    });
    return () => unsubscribe?.();
  }, [leadId]);

  // KPIs memoizados
  const kpis = useMemo(() => ({
    score: lead?.score || 0,
    interactionsCount: interactions.length,
    conversionProbability: Math.round(lead?.score * 1.5) + '%', // Exemplo de cálculo
  }), [lead, interactions]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[var(--bg-dark)] text-white p-8"
    >
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Detalhes do Lead: {lead?.name}</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] p-4 rounded-lg shadow-lg">
          <h3>Score</h3>
          <p className="text-2xl">{kpis.score}</p>
        </div>
        {/* Mais KPIs... */}
      </div>

      {/* Perfil */}
      <div className="bg-[var(--bg-card)] p-6 rounded-lg mb-8">
        <h2>Perfil</h2>
        {/* Campos editáveis */}
      </div>

      {/* Timeline */}
      <div className="bg-[var(--bg-card)] p-6 rounded-lg">
        <h2>Timeline de Interações</h2>
        <ul>
          {interactions.map((item) => (
            <li key={item.id}>{item.date}: {item.description}</li>
          ))}
        </ul>
      </div>

      {/* Ações */}
      <div className="flex gap-4 mt-6">
        <button onClick={() => updateLead(leadId, { /* updates */ })}><Edit /> Editar</button>
        {/* Mais botões */}
      </div>
    </motion.div>
  );
}
