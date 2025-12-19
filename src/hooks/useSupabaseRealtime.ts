// src/hooks/useSupabaseRealtime.ts
// Hook para usar Supabase Realtime

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSupabaseRealtimeOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback?: (payload: any) => void;
}

export function useSupabaseRealtime({ table, event = '*', callback }: UseSupabaseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);

    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event, schema: 'public', table }, (payload) => {
        if (callback) {
          callback(payload);
        }
      })
      .subscribe();

    return () => {
      setIsConnected(false);
      supabase.removeChannel(channel);
    };
  }, [table, event, callback]);

  return { isConnected };
}
