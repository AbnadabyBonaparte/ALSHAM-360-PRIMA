// ALSHAM 360° PRIMA — Fábrica de Páginas (stub honesto + multi-tenant)
// Estas páginas são MÓDULOS EM DESENVOLVIMENTO. Não fingem ser dashboards
// finalizados: exibem um estado claro de "em desenvolvimento" e, quando a
// organização já tem dados nas tabelas de origem, apenas indicam a contagem
// real (escopada por tenant) — sem despejar linhas de outros clientes.
//
// 🔒 SEGURANÇA (multi-tenant / defense-in-depth):
// Toda query emitida aqui é filtrada por `.eq('org_id', currentOrgId)`, exceto
// tabelas explicitamente globais no whitelist ORG_EXEMPT_TABLES. Nunca usar
// `.select('*')` sem escopo de org — isso vazaria linhas entre tenants caso o
// RLS falhe. Além disso usamos `head: true` (apenas contagem, zero linhas).
import LayoutSupremo from "./LayoutSupremo";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/supabase/useAuthStore";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Hammer, Database, ShieldCheck, Clock } from "lucide-react";

export interface SupremeConfig {
  id: string;
  title: string;
  subtitle: string;
  message: string;
  gradient: string;
  tables: string[];
  emptyTitle?: string;
  emptyDescription?: string;
}

interface TableStatus {
  table: string;
  count: number;
  error?: string;
}

// 🔓 Tabelas globais que NÃO possuem coluna org_id.
// Qualquer tabela fora deste conjunto é obrigatoriamente filtrada por org_id.
// Mantenha este whitelist mínimo e explícito.
const ORG_EXEMPT_TABLES = new Set<string>([
  "organizations",
  "system_manifests",
  "system_health",
]);

const formatNumber = (value: number) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export function createSupremePage(config: SupremeConfig) {
  return function SupremeGeneratedPage() {
    const orgId = useAuthStore((s) => s.currentOrgId);
    const [loading, setLoading] = useState(true);
    const [statuses, setStatuses] = useState<TableStatus[]>([]);

    useEffect(() => {
      let active = true;

      async function fetchCounts() {
        // Sem organização selecionada não emitimos nenhuma query de dados.
        if (!orgId) {
          if (active) {
            setStatuses([]);
            setLoading(false);
          }
          return;
        }

        try {
          setLoading(true);
          const responses = await Promise.all(
            config.tables.map(async (table): Promise<TableStatus> => {
              // 🔒 Apenas contagem (head: true) — nenhuma linha é retornada.
              let query = supabase
                .from(table)
                .select("id", { count: "exact", head: true });

              // 🔒 Escopo de tenant obrigatório, salvo tabelas globais.
              if (!ORG_EXEMPT_TABLES.has(table)) {
                query = query.eq("org_id", orgId);
              }

              const { count, error } = await query;
              return {
                table,
                count: count ?? 0,
                error: error?.message,
              };
            })
          );
          if (!active) return;
          setStatuses(responses);
        } catch {
          if (active) setStatuses([]);
        } finally {
          if (active) setLoading(false);
        }
      }

      fetchCounts();
      return () => {
        active = false;
      };
    }, [config.id, orgId]);

    const totalRecords = useMemo(
      () => statuses.reduce((sum, s) => sum + (s.count || 0), 0),
      [statuses]
    );

    return (
      <LayoutSupremo title={config.title}>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
          {/* HERO — honesto: módulo em desenvolvimento */}
          <div
            className={`relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-br ${config.gradient} backdrop-blur-3xl`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.10),_transparent_45%)]" />
            <div className="relative px-8 py-14 max-w-5xl mx-auto flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="p-4 rounded-2xl bg-[var(--surface)]/10 border border-[var(--border)] backdrop-blur-xl">
                  <Hammer className="w-10 h-10 text-[var(--accent-warning)]" />
                </div>
                <div className="flex-1 min-w-[240px] space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-warning)]/15 border border-[var(--accent-warning)]/40 text-[var(--accent-warning)] text-xs font-semibold uppercase tracking-[0.2em]">
                    <Clock className="w-3.5 h-3.5" />
                    Módulo em desenvolvimento
                  </div>
                  <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-black tracking-tight text-[var(--text)]"
                  >
                    {config.title}
                  </motion.h1>
                  <p className="text-lg text-[var(--text)]/70 max-w-3xl leading-relaxed">
                    Este módulo ainda não foi implementado. A interface final
                    está em construção — nenhuma funcionalidade deste módulo está
                    ativa no momento.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CORPO — estado honesto */}
          <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/5 backdrop-blur-2xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[var(--accent-emerald)]" />
                <h2 className="text-2xl font-bold text-[var(--text)]">
                  Em construção
                </h2>
              </div>
              <p className="text-[var(--text)]/70 leading-relaxed">
                Estamos desenvolvendo este módulo. Enquanto isso, ele não exibe
                dados operacionais nem executa ações. Assim que estiver pronto,
                aparecerá aqui com a experiência completa — sempre isolado por
                organização.
              </p>

              {/* Indicador de prontidão dos dados — contagens reais, escopadas por tenant */}
              {!orgId ? (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/40 px-4 py-4 text-sm text-[var(--text)]/60">
                  Selecione uma organização para ver a prontidão dos dados.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-[var(--text)]/60">
                    <Database className="w-4 h-4" />
                    Prontidão dos dados na sua organização
                    {!loading && (
                      <span className="text-[var(--text)]/40">
                        • {formatNumber(totalRecords)} registro(s)
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {config.tables.map((table) => {
                      const status = statuses.find((s) => s.table === table);
                      return (
                        <div
                          key={table}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/40 px-4 py-3"
                        >
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text)]/40 truncate">
                            {table}
                          </p>
                          <p className="text-lg font-bold text-[var(--text)] mt-1">
                            {loading
                              ? "…"
                              : status?.error
                              ? "—"
                              : formatNumber(status?.count ?? 0)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </LayoutSupremo>
    );
  };
}
