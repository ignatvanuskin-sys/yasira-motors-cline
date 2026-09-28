/**
 * Лёгкий i18n без рантайм-зависимостей.
 *
 * Почему не next-intl: тексты нужны только на сервере (SEO) и в клиентских
 * компонентах записи. Словари импортируются статически и попадают в бандл
 * только при реальном использовании — это дешевле по весу и не тянет middleware
 * и лишние зависимости. Архитектура при этом полностью готова к включению
 * казахской версии (ENABLE_KK) без изменения кода компонентов.
 */

import ru from '@/messages/ru.json';
import kk from '@/messages/kk.json';

export type Locale = 'ru' | 'kk';
export type Dictionary = typeof ru;

const dictionaries: Record<Locale, Dictionary> = {
  ru: ru as Dictionary,
  kk: kk as unknown as Dictionary,
};

export const locales: Locale[] = ['ru', 'kk'];
export const defaultLocale: Locale = 'ru';

export function isLocale(value: string): value is Locale {
  return value === 'ru' || value === 'kk';
}

/** Словарь для локали. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Хелпер доступа по ключу: t('nav.services').
 * Тип ключей выводится из словаря, опечатка не соберётся.
 */
export function makeT(locale: Locale) {
  const dict = getDictionary(locale);
  return function t<K extends keyof Dictionary>(section: K): Dictionary[K] {
    return dict[section];
  };
}

export type T = ReturnType<typeof makeT>;

/** Словарь можно передать в клиентский компонент одним пропом. */
export type DictionaryProp = { dict: Dictionary; locale: Locale };
