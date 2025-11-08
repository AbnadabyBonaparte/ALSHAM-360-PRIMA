import { useState, useEffect, useRef } from 'react';
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
  
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(true);

  const loadLeads = async () => {
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
        .from('leads_crm')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

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
    isMountedRef.current = true;

    loadLeads();

    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads_crm'
        },
        (payload) => {
          console.log('🔔 Mudança detectada em leads:', payload);
          if (isMountedRef.current && !isLoadingRef.current) {
            loadLeads();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Limpando useLeadsAI...');
      isMountedRef.current = false;
      isLoadingRef.current = false;
      
      if (channel && typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      }
    };
  }, []);

  return {
    leads,
    loading,
    error,
    refreshLeads
  };
}
