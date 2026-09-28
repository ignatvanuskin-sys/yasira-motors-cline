/**
 * Адрес сайта для canonical, sitemap, robots и микроразметки.
 *
 * Почему не `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://…'`:
 * `??` срабатывает только на null/undefined. В Vercel переменная часто задана
 * как пустая строка, `??` молча пропускает её, и `new URL('')` падает с
 * ERR_INVALID_URL прямо во время сборки — ровно так ломался деплой.
 * Поэтому здесь проверяем и пустое значение, и сам формат URL.
 */

/** Запасной адрес, если переменная не задана или битая. */
export const FALLBACK_SITE_URL = 'https://yasira-motors.vercel.app';

/** Нормализованный адрес сайта без завершающего слэша. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;

  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return FALLBACK_SITE_URL;
    // Без слэша на конце: дальше адрес склеивается как `${SITE_URL}/privacy`.
    return url.toString().replace(/\/+$/, '');
  } catch {
    return FALLBACK_SITE_URL;
  }
}
