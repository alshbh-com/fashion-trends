// Facebook Pixel + Conversions API helper
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
};

const genEventId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const sendCapi = async (
  event_name: string,
  event_id: string,
  custom_data?: Record<string, unknown>,
  user_fields?: { email?: string; phone?: string },
) => {
  try {
    await supabase.functions.invoke('fb-capi', {
      body: {
        event_name,
        event_id,
        event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        fbp: getCookie('_fbp'),
        fbc: getCookie('_fbc'),
        email: user_fields?.email,
        phone: user_fields?.phone,
        custom_data,
      },
    });
  } catch (e) {
    console.warn('CAPI send failed', e);
  }
};

export const fbTrack = (
  event: string,
  data?: Record<string, unknown>,
  user_fields?: { email?: string; phone?: string },
) => {
  const eventID = genEventId();
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data, { eventID });
  }
  // Server-side dedup via the same eventID
  void sendCapi(event, eventID, data, user_fields);
};

export const fbTrackCustom = (
  event: string,
  data?: Record<string, unknown>,
  user_fields?: { email?: string; phone?: string },
) => {
  const eventID = genEventId();
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', event, data, { eventID });
  }
  void sendCapi(event, eventID, data, user_fields);
};
