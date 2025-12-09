// src/hooks/useLeadsAI.ts
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';

interface UseLeadsAIResult {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  refreshLeads: () => Promise<void>;
  refetch?: () => Promise<void>;
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

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔧 FIX 1: VERIFICAR SESSÃO E ORG_ID
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Erro ao obter sessão: ${sessionError.message}`);
      }

      if (!session?.user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 Usuário autenticado:', session.user.email);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔧 FIX 2: BUSCAR ORG_ID DO USUÁRIO
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const { data: userOrgs, error: orgsError } = await supabase
        .from('user_organizations')
        .select('org_id')
        .eq('user_id', session.user.id)
        .single();

      if (orgsError) {
        console.warn('⚠️ Erro ao buscar organização do usuário:', orgsError);
        // Tentar buscar sem filtro de org_id (fallback)
      }

      const orgId = userOrgs?.org_id || 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe';
      console.log('🏢 Organização:', orgId);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔧 FIX 3: BUSCAR LEADS COM ORG_ID
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const { data, error: supabaseError, count } = await supabase
        .from('leads_crm')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      console.log('📊 Query executada:');
      console.log('  - Tabela: leads_crm');
      console.log('  - Filtro: org_id =', orgId);
      console.log('  - Count:', count);
      console.log('  - Dados:', data?.length || 0);

      if (supabaseError) {
        console.error('❌ Erro do Supabase:', supabaseError);
        throw supabaseError;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔧 FIX 4: DEBUG DETALHADO
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (!data || data.length === 0) {
        console.warn('⚠️ Nenhum lead encontrado!');
        console.warn('Verifique:');
        console.warn('  1. RLS permite acesso do usuário?');
        console.warn('  2. org_id está correto?');
        console.warn('  3. Leads existem no banco?');
        
        // Tentar buscar SEM filtro para debug
        const { data: allLeads, error: allError } = await supabase
          .from('leads_crm')
          .select('id, org_id', { count: 'exact' })
          .limit(5);
        
        if (!allError && allLeads) {
          console.warn(`📊 Total de leads no banco (amostra): ${allLeads.length}`);
          console.warn('Org IDs encontrados:', [...new Set(allLeads.map(l => l.org_id))]);
        }
      }

      if (isMountedRef.current) {
        setLeads(data || []);
        console.log(`✅ ${data?.length || 0} leads carregados`);
      }

    } catch (err) {
      console.error('❌ Erro ao carregar leads:', err);
      
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar leads';
        setError(errorMessage);
        
        // Mostrar erro mais amigável
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('💥 ERRO CRÍTICO:');
        console.error(errorMessage);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 FIX 5: REALTIME COM ORG_ID
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
      .subscribe((status) => {
        console.log('📡 Status do realtime:', status);
      });

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
    refreshLeads,
    refetch: refreshLeads
  };
}
