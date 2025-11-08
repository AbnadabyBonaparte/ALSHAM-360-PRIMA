typescriptimport { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';

interface UseLeadsAIResult {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  refreshLeads: () => Promise<void>;
}

export function useLeadsAI(): UseLeadsAIResult {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs para evitar múltiplas execuções
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(true);

  const loadLeads = async () => {
    // Previne execução simultânea
    if (isLoadingRef.current) {
      console.log('⏭️ loadLeads já está executando, pulando...');
      return;
    }

    isLoadingRef.current = true;
    console.log('🔄 Iniciando carregamento de leads...');
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      // Só atualiza se o componente ainda estiver montado
      if (isMountedRef.current) {
        setLeads(data || []);
        console.log(`✅ ${data?.length || 0} leads carregados`);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar leads:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar leads');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isLoadingRef.current = false;
    }
  };

  const refreshLeads = async () => {
    await loadLeads();
  };

  useEffect(() => {
    // Marca componente como montado
    isMountedRef.current = true;

    // Carrega dados iniciais
    loadLeads();

    // Configura subscription para realtime
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('🔔 Mudança detectada em leads:', payload);
          // Recarrega apenas quando há mudança real
          if (isMountedRef.current && !isLoadingRef.current) {
            loadLeads();
          }
        }
      )
      .subscribe();

    // Cleanup ao desmontar
    return () => {
      console.log('🧹 Limpando useLeadsAI...');
      isMountedRef.current = false;
      isLoadingRef.current = false;
      
      // Remove subscription
      if (channel && typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      }
    };
  }, []); // Array vazio = executa apenas uma vez

  return {
    leads,
    loading,
    error,
    refreshLeads
  };
}
