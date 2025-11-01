import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ChartSupremo from "../components/ChartSupremo";

export default function Analytics() {
  const [labels, setLabels] = useState<string[]>([]);
  const [leadsData, setLeadsData] = useState<number[]>([]);
  const [vendasData, setVendasData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        // Exemplo: busca dados agregados semanais
        const { data: leads } = await supabase
          .from("leads_crm")
          .select("created_at")
          .order("created_at", { ascending: true });

        const { data: vendas } = await supabase
          .from("sales_pipeline")
          .select("created_at")
          .order("created_at", { ascending: true });

        const groupedLeads = groupByWeek(leads || []);
        const groupedVendas = groupByWeek(vendas || []);

        setLabels(Object.keys(groupedLeads));
        setLeadsData(Object.values(groupedLeads));
        setVendasData(Object.values(groupedVendas));
      } catch (err) {
        console.error("Erro ao carregar dados de analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  function groupByWeek(rows: any[]) {
    const map: Record<string, number> = {};
    for (const row of rows) {
      const date = new Date(row.created_at);
      const week = `${date.getFullYear()}-W${getWeek(date)}`;
      map[week] = (map[week] || 0) + 1;
    }
    return map;
  }

  function getWeek(d: Date) {
    const onejan = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  }

  if (loading) {
    return (
      <div className="text-gray-400 text-center mt-10">Carregando dados...</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ChartSupremo
        title="Evolução de Leads por Semana"
        labels={labels}
        dataValues={leadsData}
        color="rgb(99, 102, 241)" // indigo
      />
      <ChartSupremo
        title="Evolução de Vendas por Semana"
        labels={labels}
        dataValues={vendasData}
        color="rgb(16, 185, 129)" // emerald
      />
    </div>
  );
}
