/**
 * Список событий. Формы записи на сайте нет, поэтому событий записи не осталось:
 * отслеживаются только реальные действия клиента.
 */
export const ANALYTICS_EVENTS = [
  'whatsapp_click',
  'call_click',
  'route_click',
  'service_card_click',
  'price_cta_click',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Параметры, которые разрешено передавать. Всё остальное отбрасывается. */
const ALLOWED_PARAMS = new Set(['source', 'service', 'step', 'lang', 'provider', 'reason']);

/**
 * Отправляет событие в dataLayer/gtag, если аналитика подключена.
 * Без GA_ID функция — no-op и не тянет скрипты.
 */
export function trackEvent(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_GA_ID) return;

  const safeParams: Params = {};
  for (const [key, value] of Object.entries(params)) {
    if (ALLOWED_PARAMS.has(key)) safeParams[key] = value;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...safeParams });

  if (typeof window.gtag === 'function') {
    window.gtag('event', event, safeParams);
  }
}

/** Событие с ограниченным набором параметров — используется в кнопках. */
export function trackClick(kind: 'whatsapp' | 'call' | 'route' | 'price', source: string): void {
  const map = {
    whatsapp: 'whatsapp_click',
    call: 'call_click',
    route: 'route_click',
    price: 'price_cta_click',
  } as const;
  trackEvent(map[kind], { source });
}
