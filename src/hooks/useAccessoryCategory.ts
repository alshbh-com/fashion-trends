import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hidden section: any category whose name matches one of these is treated as "Accessories"
// and excluded from the public listings. It's only accessible via /ax.
const ACCESSORY_NAME_PATTERNS = ['اكسسوار', 'إكسسوار', 'accessor'];

export const useAccessoryCategoryIds = () => {
  return useQuery({
    queryKey: ['accessory-category-ids'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (error) throw error;
      const ids = (data || [])
        .filter(c => {
          const n = (c.name || '').toLowerCase();
          return ACCESSORY_NAME_PATTERNS.some(p => n.includes(p.toLowerCase()));
        })
        .map(c => c.id);
      return ids;
    },
    staleTime: 5 * 60 * 1000,
  });
};
