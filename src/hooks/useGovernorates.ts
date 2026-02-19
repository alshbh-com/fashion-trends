import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useGovernorates = () => {
  return useQuery({
    queryKey: ['governorates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('governorates')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};
