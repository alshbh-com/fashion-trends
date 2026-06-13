import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// Generate/retrieve a session ID for anonymous tracking
const getSessionId = (): string => {
  let sid = sessionStorage.getItem('analytics_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sid);
  }
  return sid;
};

export const trackEvent = async (
  eventType: 'page_visit' | 'add_to_cart' | 'checkout_start' | 'order_complete',
  productId?: string,
  metadata?: Record<string, unknown>
) => {
  try {
    await supabase.from('analytics_events_rows').insert({
      event_type: eventType,
      product_id: productId || null,
      session_id: getSessionId(),
      metadata: (metadata || {}) as Json,
    });
  } catch {
    // Silent fail — analytics should never block UX
  }
};
