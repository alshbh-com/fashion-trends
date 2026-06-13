import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GovernorateRow } from '@/types/store';

export const useGovernorates = () => {
  return useQuery<GovernorateRow[]>({
    queryKey: ['governorates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('governorates_rows')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};
