import { useMemo } from "react";
import { getLeadById } from "../lib/leads";

interface LeadsDetailsProps {
  leadId: string;
  onBack: () => void;
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export default function LeadsDetails({ leadId, onBack }: LeadsDetailsProps) {
  const lead = useMemo(() => getLeadById(leadId), [leadId]);

  if (!lead) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-100">
          <h2 className="text-xl font-semibold">Lead não encontrado</h2>
          <p className="mt-2 text-sm text-rose-100/80">
            O identificador informado não corresponde a nenhum registro disponível. Volte para a lista e
            selecione um lead válido para consultar o painel completo.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-white"
          >
            Voltar para a lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
      >
        ← Voltar para leads
      </button>

      <header className="rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-300/70">Lead selecionado</p>
            <h1 className="mt-2 text-3xl font-bold text-white">{lead.nome}</h1>
            <p className="text-sm text-gray-400">{lead.empresa}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-4 text-right text-emerald-200">
            <p className="text-xs uppercase tracking-widest text-emerald-200/70">Valor potencial</p>
            <p className="text-2xl font-semibold">{formatCurrency(lead.valorPotencial)}</p>
            <p className="text-xs text-emerald-200/70">Score de fechamento: {lead.score}%</p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">Contato</h2>
          <dl className="mt-4 space-y-2 text-sm text-gray-200">
            <div className="flex justify-between gap-3">
              <dt>Email</dt>
              <dd className="text-right text-gray-300">{lead.email}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Telefone</dt>
              <dd className="text-right text-gray-300">{lead.telefone}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Origem</dt>
              <dd className="text-right text-gray-300">{lead.origem}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">Linha do tempo</h2>
          <dl className="mt-4 space-y-2 text-sm text-gray-200">
            <div className="flex justify-between gap-3">
              <dt>Criado em</dt>
              <dd className="text-right text-gray-300">{formatDate(lead.criadoEm)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Última atividade</dt>
              <dd className="text-right text-gray-300">{formatDate(lead.ultimaAtividade)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Próxima ação</dt>
              <dd className="text-right text-gray-300">{lead.proximaAcao}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">Notas executivas</h2>
        <ul className="mt-4 space-y-3 text-sm text-gray-200">
          {lead.notas.map((nota, index) => (
            <li key={index} className="flex gap-3 rounded-xl bg-white/5 p-3 text-gray-200">
              <span className="text-emerald-300">•</span>
              <span>{nota}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
