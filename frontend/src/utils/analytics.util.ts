/**
 * Lightweight analytics scaffolding for page views and conversion events.
 * Wire `VITE_GA_MEASUREMENT_ID` and `VITE_META_PIXEL_ID` when ready.
 */

type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Tracks a page view across configured analytics providers.
 *
 * @param path - Current route path
 * @param title - Optional document title
 */
export function trackPageView(path: string, title?: string): void {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (gaId && typeof window.gtag === 'function') {
    window.gtag('config', gaId, { page_path: path, page_title: title });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }

  if (import.meta.env.DEV) {
    console.debug('[analytics] page_view', { path, title });
  }
}

/**
 * Tracks a named conversion or interaction event.
 *
 * @param name - Event name (e.g. `cta_click`, `signup_complete`)
 * @param params - Optional event parameters
 */
export function trackEvent(name: string, params?: AnalyticsEventParams): void {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', name, params);
  }

  if (import.meta.env.DEV) {
    console.debug('[analytics] event', name, params);
  }
}
