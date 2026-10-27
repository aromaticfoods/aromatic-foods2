import { META_PIXEL_ID } from '../config';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/** Loads the Meta Pixel (only if a Pixel ID is configured) and fires PageView. */
export function initPixel() {
  if (!META_PIXEL_ID || typeof window === 'undefined' || window.fbq) return;

  const n: any = (window.fbq = function (...args: any[]) {
    if (n.callMethod) {
      n.callMethod.apply(n, args);
    } else {
      n.queue.push(args);
    }
  });
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

/** Safe wrapper: does nothing if the Pixel is not loaded. */
export function trackEvent(event: string, params: Record<string, unknown> = {}, eventId?: string) {
  try {
    if (typeof window === 'undefined' || !window.fbq) return;
    if (eventId) {
      window.fbq('track', event, params, { eventID: eventId });
    } else {
      window.fbq('track', event, params);
    }
  } catch {
    // never break the shop because of tracking
  }
}
