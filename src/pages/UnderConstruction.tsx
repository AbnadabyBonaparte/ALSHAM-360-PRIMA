import { AlertTriangle } from "lucide-react";

interface UnderConstructionProps {
  pageName: string;
}

export default function UnderConstruction({ pageName }: UnderConstructionProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-content-center rounded-full border border-[var(--accent-amber)]/40 bg-[var(--accent-amber)]/10">
        <AlertTriangle className="h-8 w-8 text-[var(--accent-amber)]" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          {pageName} em construção
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Estamos finalizando os últimos detalhes para liberar esta experiência.
        </p>
      </div>
    </div>
  );
}
