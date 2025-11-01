import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MetricCard from "../components/MetricCard";
import ChartSupremo from "../components/ChartSupremo";

export default function Financeiro() {
  const [metrics, setMetrics] = useState({
    receita: 0,
    despesas: 0,
    lucro: 0,
    mrr: 0,
  });

  const [labels, setLabels] = useState<string[]>([]);
  const [lucroMensal, setLucroMensal] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinance() {
      setLoading(true);
      try {
        // Buscar dados agregados
        const { data, error } = await supabase
          .from("registros_financeiros")
          .select("tipo, valor, data_registro")
          .order("data_registro", { ascending: true });

        if (error) throw error;

        let receita = 0;
        let despesas = 0;
        const lucroMap: Record<string, number> = {};

        data?.forEach((r: any) => {
          const date = new Date(r.data_registro);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

          if (!lucroMap[month]) lucroMap[month] = 0;

          if (r.tipo === "receita") {
            receita += r.valor;
            lucroMap[month] += r.valor;
          } else if (r.tipo === "despesa") {
            despesas += r.valor;
            lucroMap[month] -= r.valor;
          }
        });

        const lucro = receita - despesas;
        const sortedMonths = Object.keys(lucroMap).sort();
        const lucroMensalArray = sortedMonths.map((m) => lucroMap[m]);
        const mrr = receita / (sortedMonths.length || 1);

        setMetrics({ receita, despesas, lucro, mrr });
        setLabels(sortedMonths);
        setLucroMensal(lucroMensalArray);
      } catch (err) {
        console.error("Erro ao carregar dados financeiros:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFinance();

    // Atualização em tempo real
    const sub = supabase
      .channel("public:financeiro")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registros_financeiros" },
        () => loadFinance()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">💰 Financeiro Vivo</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Receita Total"
          value={metrics.receita}
          loading={loading}
          delay={0.1}
        />
        <MetricCard
          title="Despesas Totais"
          value={metrics.despesas}
          loading={loading}
          delay={0.3}
        />
        <MetricCard
          title="Lucro Líquido"
          value={metrics.lucro}
          loading={loading}
          delay={0.5}
        />
        <MetricCard
          title="MRR (Receita Recorrente Mensal)"
          value={metrics.mrr}
          loading={loading}
          delay={0.7}
        />
      </div>

      <ChartSupremo
        title="Lucro Mensal (Histórico)"
        labels={labels}
        dataValues={lucroMensal}
        color="rgb(245, 158, 11)" // amber
      />
    </div>
  );
}
