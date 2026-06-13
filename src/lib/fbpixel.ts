// Facebook Pixel + Conversions API helper
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    __FB_TEST_EVENT_CODE?: string;
  }
}

const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
};

const genEventId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// Cache the test event code (loaded once from app_settings)
let testCodePromise: Promise<string | undefined> | null = null;
const getTestEventCode = (): Promise<string | undefined> => {
  if (typeof window !== 'undefined' && window.__FB_TEST_EVENT_CODE) {
    return Promise.resolve(window.__FB_TEST_EVENT_CODE);
  }
  if (!testCodePromise) {
    testCodePromise = (async () => {
      try {
        const { data } = await supabase
          .from('app_settings_rows')
          .select('custom_settings')
          .eq('id', 'main')
          .single();
        const cs = (data?.custom_settings ?? {}) as Record<string, unknown>;
        const code = typeof cs.fb_test_event_code === 'string' ? cs.fb_test_event_code : undefined;
        if (typeof window !== 'undefined' && code) window.__FB_TEST_EVENT_CODE = code;
        return code;
      } catch {
        return undefined;
      }
    })();
  }
  return testCodePromise;
};

const sendCapi = async (
  event_name: string,
  event_id: string,
  custom_data?: Record<string, unknown>,
  user_fields?: { email?: string; phone?: string },
) => {
  try {
    const test_event_code = await getTestEventCode();
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
        test_event_code,
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
