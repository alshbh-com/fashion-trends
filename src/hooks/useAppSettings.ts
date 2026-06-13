import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AppSettingsRow } from '@/types/store';

export const useAppSettings = () => {
  const query = useQuery<AppSettingsRow>({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings_rows')
        .select('*')
        .eq('id', 'main')
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60,
  });

  // Realtime subscription for live theme updates
  useEffect(() => {
    const channel = supabase
      .channel('app-settings-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings_rows' }, () => {
        query.refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [query.refetch]);

  return query;
};
