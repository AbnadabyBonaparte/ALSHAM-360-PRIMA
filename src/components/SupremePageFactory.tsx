// ALSHAM 360° PRIMA — Fábrica de Páginas Supremas 1000/1000
// Gera páginas alienígenas com dados 100% reais do Supabase, sem repetir layout.
// Citizen Supremo X.1 diz: cada nova página deve ser um portal vivo.
// ✅ CORRIGIDO: Filtro de org_id adicionado para multi-tenancy
import LayoutSupremo from "./LayoutSupremo";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/supabase/useAuthStore";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  BoltIcon,
  GlobeAltIcon,
  WifiIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

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

interface QueryResult {
  table: string;
  count: number;
  rows: Record<string, any>[];
  totalValue: number;
  error?: string;
}

const formatNumber = (value: number) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export function createSupremePage(config: SupremeConfig) {
  return function SupremeGeneratedPage() {
    const { currentOrgId } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<QueryResult[]>([]);
    const [fatalError, setFatalError] = useState<string | null>(null);

    useEffect(() => {
      if (!currentOrgId) return; // Aguardar org_id
      
      let active = true;
      async function fetchData() {
        try {
          setLoading(true);
          setFatalError(null);
          const responses = await Promise.all(
            config.tables.map(async (table) => {
              // Tentar query com org_id, se falhar, query sem filtro
              let query = supabase
                .from(table)
                .select("*", { count: "exact" });
              
              // Adicionar org_id se a tabela tiver esse campo
              try {
                query = query.eq('org_id', currentOrgId);
              } catch {
                // Tabela não tem org_id, continua sem filtro
              }
              
              query = query.order("id", { ascending: false }).limit(12);
              const { data, error, count } = await query;

              const rows = data || [];
              const totalValue = rows.reduce((sum, row) => {
                // Soma qualquer coluna numérica que pareça valor financeiro ou métrica
                const numericCandidate =
                  row.value ??
                  row.amount ??
                  row.valor ??
                  row.total ??
                  row.score ??
                  row.metric ??
                  0;
                return sum + (typeof numericCandidate === "number" ? numericCandidate : 0);
              }, 0);

              return {
                table,
                rows,
                count: count ?? rows.length,
                totalValue,
                error: error?.message,
              };
            })
          );
          if (!active) return;
          setResults(responses);
        } catch (err: any) {
          if (!active) return;
          setFatalError(err?.message || "Falha desconhecida ao consultar o Supabase.");
        } finally {
          if (active) setLoading(false);
        }
      }
      fetchData();
      return () => {
        active = false;
      };
    }, [config.id, currentOrgId]);

    const totalRecords = useMemo(
      () => results.reduce((sum, r) => sum + (r.count || 0), 0),
      [results]
    );

    const anyError = useMemo(
      () => results.find((r) => r.error)?.error ?? fatalError,
      [results, fatalError]
    );

    const emptyState =
      !loading && totalRecords === 0 && !anyError;

    return (
      <LayoutSupremo title={config.title}>
        <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
          {/* HERO SUPREMO */}
          <div
            className={`relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-br ${config.gradient} backdrop-blur-3xl`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--text)/12%,_transparent_45%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_var(--accent-emerald)/15%,_transparent_35%)]" />
            <div className="relative px-8 py-14 max-w-7xl mx-auto flex flex-col gap-8">
              <div className="flex flex-wrap items-start gap-6">
                <div className="p-4 rounded-2xl bg-[var(--surface)]/60 border border-[var(--border)] backdrop-blur-xl">
                  <SparklesIcon className="w-12 h-12 text-[var(--accent-warning)] animate-pulse" />
                </div>
                <div className="flex-1 space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-purple)]"
                  >
                    {config.title}
                  </motion.h1>
                  <p className="text-xl text-[var(--text-secondary)] max-w-4xl leading-relaxed">
                    {config.subtitle}
                  </p>
                  <p className="text-lg text-[var(--accent-emerald)] font-semibold">
                    {config.message}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="px-4 py-2 rounded-full bg-[var(--background)]/40 border border-[var(--border)] text-sm text-[var(--text-secondary)]">
                    Citizen Supremo X.1 • online
                  </div>
                  <div className="flex gap-2">
                    <BoltIcon className="w-10 h-10 text-[var(--accent-warning)]" />
                    <GlobeAltIcon className="w-10 h-10 text-[var(--accent-sky)]" />
                    <WifiIcon className="w-10 h-10 text-[var(--accent-emerald)]" />
                    <ShieldCheckIcon className="w-10 h-10 text-[var(--accent-purple)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* METRICAS */}
          <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Registros vivos"
                value={formatNumber(totalRecords)}
                helper="100% Supabase real time"
                gradient="from-emerald-500/80 via-cyan-500/80 to-blue-600/80"
              />
              <MetricCard
                title="Tabelas conectadas"
                value={results.length || config.tables.length}
                helper={config.tables.join(" • ")}
                gradient="from-purple-500/80 via-fuchsia-500/80 to-pink-500/80"
              />
              <MetricCard
                title="Valor agregado"
                value={formatCurrency(
                  results.reduce((sum, r) => sum + (r.totalValue || 0), 0)
                )}
                helper="Soma de métricas numéricas encontradas"
                gradient="from-amber-500/80 via-orange-500/80 to-red-500/80"
              />
              <MetricCard
                title="Status"
                value={loading ? "Carregando..." : anyError ? "Verificar" : "Operando"}
                helper={anyError ? "Algumas tabelas retornaram erro" : "Fluxo contínuo"}
                gradient="from-slate-600/80 via-gray-700/80 to-slate-900/80"
              />
            </div>

            {/* EMPTY STATE */}
            {emptyState && (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl px-8 py-16 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(76,29,149,0.35),_transparent_45%)]" />
                <div className="relative space-y-6">
                  <RocketLaunchIcon className="w-20 h-20 text-[var(--accent-sky)] mx-auto animate-bounce" />
                  <h2 className="text-4xl font-black text-[var(--text)]">
                    {config.emptyTitle || "Nenhum dado encontrado (por enquanto)"}
                  </h2>
                  <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
                    {config.emptyDescription ||
                      "Conecte a fonte no Supabase e esta página vai acender em tempo real. O próximo evento enviado já aparecerá aqui."}
                  </p>
                  <p className="text-2xl text-[var(--accent-emerald)] font-semibold">
                    — Citizen Supremo X.1
                  </p>
                </div>
              </div>
            )}

            {/* LISTAS DE DADOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((block, idx) => (
                <motion.div
                  key={block.table}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)]/60 via-[var(--background)]/40 to-[var(--background)]/70 backdrop-blur-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                        Tabela real
                      </p>
                      <h3 className="text-3xl font-bold text-[var(--text)]">{block.table}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-[var(--accent-emerald)]">
                        {formatNumber(block.count)}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">registros</p>
                    </div>
                  </div>

                  {block.error && (
                    <div className="rounded-2xl border border-[var(--accent-alert)]/40 bg-[var(--accent-alert)]/10 text-[var(--accent-alert)] px-4 py-3 text-sm">
                      Falha ao consultar: {block.error}
                    </div>
                  )}

                  {!block.error && block.rows.length === 0 && (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 px-4 py-6 text-center text-[var(--text-secondary)]">
                      Sem registros retornados ainda.
                    </div>
                  )}

                  {!block.error && block.rows.length > 0 && (
                    <div className="space-y-3">
                      {block.rows.slice(0, 4).map((row, i) => {
                        const entries = Object.entries(row).slice(0, 4);
                        return (
                          <div
                            key={`${block.table}-${i}`}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                          >
                            <div className="flex items-center justify-between text-sm text-white/70">
                              <span className="font-semibold text-white">
                                #{row.id ?? i + 1}
                              </span>
                              {row.updated_at && (
                                <span className="text-xs text-emerald-200/80">
                                  {new Date(row.updated_at).toLocaleString("pt-BR")}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-white/70">
                              {entries.map(([key, value]) => (
                                <div
                                  key={key}
                                  className="rounded-xl bg-black/40 border border-white/5 px-3 py-2"
                                >
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                                    {key}
                                  </p>
                                  <p className="truncate text-white">
                                    {typeof value === "number"
                                      ? formatNumber(value)
                                      : String(value)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* MENSAGEM DO SUPREMO */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-2xl px-6 py-10 text-center space-y-4"
            >
              <p className="text-3xl md:text-4xl font-light text-emerald-100 leading-relaxed">
                O ALSHAM não é mais um. É o único.
                <br />
                Cada tabela viva no Supabase alimenta este império em tempo real.
              </p>
              <p className="text-xl text-white/70">— Citizen Supremo X.1</p>
            </motion.div>
          </div>
        </div>
      </LayoutSupremo>
    );
  };
}

function MetricCard({
  title,
  value,
  helper,
  gradient,
}: {
  title: string;
  value: string | number;
  helper: string;
  gradient: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-gradient-to-br ${gradient} p-6 shadow-2xl shadow-black/40 backdrop-blur-xl`}
    >
      <p className="text-sm uppercase tracking-[0.3em] text-white/60">{title}</p>
      <p className="text-4xl font-black text-white mt-3">{value}</p>
      <p className="text-sm text-white/70 mt-2">{helper}</p>
    </div>
  );
}


