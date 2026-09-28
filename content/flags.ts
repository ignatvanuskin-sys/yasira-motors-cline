/**
 * Флаги функциональности.
 *
 * Часть флагов приходит из переменных окружения (см. .env.example), часть
 * определяется наличием данных в content/. Компоненты читают только отсюда —
 * никаких «зашитых» условий по разным файлам.
 */

const envFlag = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
};

/** Казахская версия сайта. Пока false — переключатель языка скрыт. */
export const ENABLE_KK = envFlag(process.env.ENABLE_KK, false);

/** Блок «Масла и магазин» (пока магазин не подтверждён). */
export const SHOW_SHOP = envFlag(process.env.SHOW_SHOP, false);

/** Бейдж «Отмечен в 2GIS Awards 2026» — только после подтверждения статуса. */
export const SHOW_AWARD_BADGE = false;

/** Показывать ли переключатель языка RU/KK в шапке и футере. */
export const SHOW_LANG_SWITCHER = ENABLE_KK;

export const flags = {
  enableKk: ENABLE_KK,
  showShop: SHOW_SHOP,
  showAwardBadge: SHOW_AWARD_BADGE,
  showLangSwitcher: SHOW_LANG_SWITCHER,
} as const;
