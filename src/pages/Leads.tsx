import { useMemo } from "react";
import { getLeads, type Lead } from "../lib/leads";

interface LeadsProps {
  onNavigateToDetails: (leadId: string) => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function statusBadge(status: Lead["status"]) {
  const map: Record<Lead["status"], string> = {
    novo: "bg-sky-500/20 text-sky-300 border border-sky-500/40",
    qualificado: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
    "em-negociacao": "bg-amber-500/20 text-amber-200 border border-amber-500/40",
    conquistado: "bg-purple-500/20 text-purple-200 border border-purple-500/40",
    perdido: "bg-rose-500/20 text-rose-200 border border-rose-500/40"
  };

  return map[status];
}

export default function Leads({ onNavigateToDetails }: LeadsProps) {
  const leads = useMemo(() => getLeads(), []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3">
        <div>
          <p className="uppercase text-xs tracking-widest text-emerald-400/70">
            CRM • Inteligência Comercial
          </p>
          <h1 className="text-3xl font-bold text-white">Leads estratégicos</h1>
        </div>
        <p className="text-sm text-gray-400 max-w-3xl">
          Acompanhe a temperatura de cada oportunidade, próximas ações e o potencial de receita
          diretamente do núcleo ALSHAM 360°. Clique em um lead para abrir o painel mestre-detalhe e
          sincronizar com Supabase em tempo real.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {leads.map((lead) => (
          <article
            key={lead.id}
            className="group rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur transition hover:border-emerald-400/60 hover:bg-emerald-400/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{lead.nome}</h2>
                <p className="text-sm text-gray-400">{lead.empresa}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(lead.status)}`}>
                {lead.status.replace("-", " ")}
              </span>
            </div>

            <dl className="mt-6 space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <dt>Valor potencial</dt>
                <dd className="font-semibold text-emerald-300">{formatCurrency(lead.valorPotencial)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Score</dt>
                <dd>{lead.score}%</dd>
              </div>
              <div className="flex justify-between">
                <dt>Origem</dt>
                <dd className="text-right text-gray-400">{lead.origem}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => onNavigateToDetails(lead.id)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
              Abrir detalhes
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
