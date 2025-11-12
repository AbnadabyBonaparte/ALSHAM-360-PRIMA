import { useEffect, useState } from "react";
import { getSupabaseClient, type SupabaseClient } from "../lib/supabase";
import MetricCard from "../components/MetricCard";

export default function Home() {
  const [metrics, setMetrics] = useState({
    leads: 0,
    vendas: 0,
    campanhas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let client: SupabaseClient | null = null;
    let subscription: ReturnType<SupabaseClient["channel"]> | null = null;

    async function loadMetrics(currentClient: SupabaseClient) {
      setLoading(true);
      try {
        const [{ count: leads }, { count: vendas }, { count: campanhas }] =
          await Promise.all([
            currentClient
              .from("leads_crm")
              .select("*", { count: "exact", head: true }),
            currentClient
              .from("sales_pipeline")
              .select("*", { count: "exact", head: true }),
            currentClient
              .from("marketing_campaigns")
              .select("*", { count: "exact", head: true }),
          ]);

        if (active) {
          setMetrics({
            leads: leads ?? 0,
            vendas: vendas ?? 0,
            campanhas: campanhas ?? 0,
          });
        }
      } catch (err) {
        console.error("Erro ao carregar métricas:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    async function initialize() {
      try {
        client = await getSupabaseClient();
        await loadMetrics(client);

        subscription = client
          .channel("public:metrics")
          .on(
            "postgres_changes",
            { event: "*", schema: "public" },
            () => loadMetrics(client!)
          )
          .subscribe();
      } catch (error) {
        console.error("Erro ao inicializar métricas:", error);
        if (active) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      active = false;
      if (subscription && client) {
        client.removeChannel(subscription);
      }
    };
  }, []);

  return (
    <div className="min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">📊 Visão Geral em Tempo Real</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Leads Ativos"
          value={metrics.leads}
          loading={loading}
          delay={0.1}
        />
        <MetricCard
          title="Vendas em Andamento"
          value={metrics.vendas}
          loading={loading}
          delay={0.3}
        />
        <MetricCard
          title="Campanhas Ativas"
          value={metrics.campanhas}
          loading={loading}
          delay={0.5}
        />
      </div>
    </div>
  );
}
