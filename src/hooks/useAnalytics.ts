import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsSummary {
  visitors: number;
  addToCart: number;
  checkoutStarts: number;
  ordersComplete: number;
}

export const useAnalytics7Days = () => {
  return useQuery({
    queryKey: ['analytics-7days'],
    queryFn: async (): Promise<AnalyticsSummary> => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const since = sevenDaysAgo.toISOString();

      // Count by event_type using separate queries for accuracy
      const [visitors, addToCart, checkoutStarts, ordersComplete] = await Promise.all([
        supabase.from('analytics_events' as any).select('id', { count: 'exact', head: true })
          .eq('event_type', 'page_visit').gte('created_at', since),
        supabase.from('analytics_events' as any).select('id', { count: 'exact', head: true })
          .eq('event_type', 'add_to_cart').gte('created_at', since),
        supabase.from('analytics_events' as any).select('id', { count: 'exact', head: true })
          .eq('event_type', 'checkout_start').gte('created_at', since),
        supabase.from('analytics_events' as any).select('id', { count: 'exact', head: true })
          .eq('event_type', 'order_complete').gte('created_at', since),
      ]);

      return {
        visitors: visitors.count || 0,
        addToCart: addToCart.count || 0,
        checkoutStarts: checkoutStarts.count || 0,
        ordersComplete: ordersComplete.count || 0,
      };
    },
    refetchInterval: 60000, // refresh every minute
  });
};
