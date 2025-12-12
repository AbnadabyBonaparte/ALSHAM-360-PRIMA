/**
 * Hook mockado para rastrear eventos sem depender de um backend.
 * Substitua pela implementação real (Supabase / Segment / etc.) quando disponível.
 */
export function useAnalytics() {
  const logEvent = (event: string, payload?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      // Evita quebrar o build; apenas loga no console em desenvolvimento.
      console.debug(`[analytics] ${event}`, payload || {});
    }
  };

  return { logEvent };
}


