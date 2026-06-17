import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AppSettingsRow } from '@/types/store';

export const useAppSettings = () => {
  const query = useQuery<AppSettingsRow>({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 'main')
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60,
  });

  // Realtime subscription for live theme updates
  const { refetch } = query;
  useEffect(() => {
    const channel = supabase.channel(`app-settings-realtime-${Math.random().toString(36).slice(2)}`);
    channel
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings_rows' }, () => {
        refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return query;
};
