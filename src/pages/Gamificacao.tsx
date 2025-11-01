import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";
import GamificationCard from "../components/GamificationCard";
import ChartSupremo from "../components/ChartSupremo";

export default function Gamificacao() {
  const [stats, setStats] = useState({
    pontos: 0,
    nivel: "Bronze",
    tendencia: [],
    metas: 0,
  });
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadGamification() {
      setLoading(true);
      try {
        const client = await getSupabaseClient();
        const { data: user } = await client.auth.getUser();
        const email = user?.user?.email;

        if (!email) {
          throw new Error("Usuário não autenticado");
        }

        const baseQuery = client
          .from("gamificacao_usuarios")
          .select("pontos, metas_batidas, semana, nivel")
          .eq("email", email);

        const { data } = (await (typeof (baseQuery as any).order === "function"
          ? (baseQuery as any).order("semana", { ascending: true })
          : baseQuery)) as { data?: any[] };

        const labels = data?.map((r) => `Sem ${r.semana}`) ?? [];
        const tendencia = data?.map((r) => r.pontos) ?? [];

        const pontosAtuais = tendencia[tendencia.length - 1] || 0;
        const metas = data?.reduce((acc, r) => acc + (r.metas_batidas || 0), 0) || 0;
        const nivel = calcularNivel(pontosAtuais);

        if (active) {
          setStats({ pontos: pontosAtuais, nivel, tendencia, metas });
          setLabels(labels);
        }
      } catch (err) {
        console.error("Erro ao carregar gamificação:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadGamification();

    return () => {
      active = false;
    };
  }, []);

  function calcularNivel(pontos: number) {
    if (pontos >= 2000) return "Supremo";
    if (pontos >= 1000) return "Ouro";
    if (pontos >= 500) return "Prata";
    return "Bronze";
  }

  return (
    <div className="min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">🏆 Gamificação & IA Preditiva</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <GamificationCard
          title="Pontuação Atual"
          value={stats.pontos}
          subtitle="Pontos acumulados na semana"
          color="text-emerald-400"
          delay={0.1}
        />
        <GamificationCard
          title="Nível Atual"
          value={stats.nivel}
          subtitle="Progresso de status"
          color="text-amber-400"
          delay={0.3}
        />
        <GamificationCard
          title="Metas Batidas"
          value={stats.metas}
          subtitle="Total de objetivos cumpridos"
          color="text-indigo-400"
          delay={0.5}
        />
        <GamificationCard
          title="Tendência Semanal"
          value={
            stats.tendencia.length > 1
              ? `${tendenciaTexto(stats.tendencia)}`
              : "Estável"
          }
          subtitle="Projeção por IA"
          color="text-pink-400"
          delay={0.7}
        />
      </div>

      <ChartSupremo
        title="Evolução de Pontuação Semanal"
        labels={labels}
        dataValues={stats.tendencia}
        color="rgb(147, 51, 234)" // violet
      />
    </div>
  );

  function tendenciaTexto(arr: number[]) {
    const diff = arr[arr.length - 1] - arr[arr.length - 2];
    if (diff > 0) return "⬆️ Alta";
    if (diff < 0) return "⬇️ Queda";
    return "⏸ Estável";
  }
}
