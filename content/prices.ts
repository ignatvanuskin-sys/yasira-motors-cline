/**
 * Прайс-лист.
 *
 * ⚡ ВАЖНО: вкладка «Цены» в карточке 2ГИС не отображается, прайс от владельца
 * не получен. Ориентир из отзыва клиента (замена масла 5W-30, 4 л + фильтр —
 * порядка 20 000 ₸) НЕ публикуется: это не официальная цена.
 *
 * Пока массив пуст — блок «Цены» на сайте показывает безопасный fallback
 * (блок 10.5), а не выдуманные цифры.
 *
 * КАК ДОБАВИТЬ ПРАЙС: владелец присылает список работ. Достаточно заполнить
 * массив `priceRows` — компонент Prices сам подхватит данные, а подпись
 * «Источник: прайс YASIRA MOTORS» появится автоматически.
 * Одна строка = { service, title, priceFrom, includes }.
 */
export type PriceRow = {
  /** id услуги из content/services.ts, чтобы связать с записью. */
  serviceId: string;
  title: string;
  /** Цена «от» в тенге. */
  priceFrom: number;
  /** Что входит в цену — коротко, без обещаний. */
  includes: string;
};

export const priceRows: PriceRow[] = [];

export const prices = {
  /** Есть ли хотя бы одна строка прайса. */
  hasPrices: priceRows.length > 0,
  currency: '₸',
  /** Подпись под таблицей. */
  sourceLabel: 'Источник: прайс YASIRA MOTORS',
  lastUpdated: null as string | null,
};

export function getPriceForService(serviceId: string): PriceRow | null {
  return priceRows.find((row) => row.serviceId === serviceId) ?? null;
}

/** Форматирование цены с разделителем разрядов: 20 000 ₸ */
export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)} ${prices.currency}`;
}
