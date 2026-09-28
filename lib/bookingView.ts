import type { Dictionary } from './i18n';

/**
 * Форматирование данных записи для показа клиенту.
 *
 * Раньше логика «Сегодня / Завтра / 12 октября» была продублирована в трёх
 * местах (StepWhen, Summary, Success) и разошлась: на экране успеха строка
 * «Когда» оставалась пустой, а произвольная дата показывалась как `d-2026-10-05`.
 */

/** «Сегодня» / «Завтра» / «12 октября» из значения дня в состоянии записи. */
export function formatBookingDay(
  day: string,
  locale: 'ru' | 'kk',
  dict: Dictionary,
): string {
  // Пустое значение равносильно «сегодня»: именно это значение уходит в
  // заявку, если клиент не выбрал день явно (дефолт чипа в StepWhen).
  if (!day || day === 'today') return dict.booking.today.toLowerCase();
  if (day === 'tomorrow') return dict.booking.tomorrow.toLowerCase();

  const [y, m, d] = day.replace(/^d-/, '').split('-').map(Number);
  if (!y || !m || !d) return dict.booking.today.toLowerCase();

  return new Date(y, m - 1, d).toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

/** «сегодня, Утро 09:00–12» — единый формат для сводки и экрана успеха. */
export function formatBookingWhen(
  day: string,
  slotLabel: string | undefined,
  locale: 'ru' | 'kk',
  dict: Dictionary,
): string {
  return [formatBookingDay(day, locale, dict), slotLabel].filter(Boolean).join(', ');
}
