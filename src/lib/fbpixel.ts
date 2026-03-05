// Facebook Pixel helper
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

export const fbTrack = (event: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data);
  }
};

export const fbTrackCustom = (event: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', event, data);
  }
};
