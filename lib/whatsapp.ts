/**
 * Ссылки WhatsApp — раздел 13 мастер-промпта.
 *
 * Сайта-записи на сайте нет: клиент звонит или пишет администратору напрямую.
 * Поэтому здесь важна одна вещь — чтобы сообщение приходило уже с контекстом
 * (какая услуга интересует), и администратору не нужно задавать уточняющие
 * вопросы с нуля.
 *
 * Ссылка ведёт на официальный WhatsApp (wa.me) и корректно открывается внутри
 * браузеров Instagram и 2ГИС. Текст обязательно URL-кодируется.
 */

import { toWhatsappDigits } from './phone';
import { site } from '@/content/site';

/** Ссылка на WhatsApp без текста. */
export function whatsappLink(phone: string = site.phones.primary): string {
  const digits = toWhatsappDigits(phone);
  return digits ? `https://wa.me/${digits}` : 'https://wa.me/';
}

/** Ссылка на WhatsApp с предзаполненным текстом. */
export function whatsappLinkWithText(text: string, phone: string = site.phones.primary): string {
  return `${whatsappLink(phone)}?text=${encodeURIComponent(text)}`;
}

/** Приветствие администратора. */
const GREETING = 'Здравствуйте!';

/**
 * Сообщение по конкретной услуге: «Хочу записаться: Замена масла и фильтров».
 * Используется в карточках услуг и на странице услуги.
 */
export function buildServiceMessage(serviceTitle: string): string {
  return `${GREETING} Хочу записаться на сервис: ${serviceTitle}.`;
}

/** Вопрос по цене — подставляется название услуги, если оно известно. */
export function buildPriceMessage(serviceTitle?: string): string {
  return serviceTitle
    ? `${GREETING} Подскажите, сколько стоит: ${serviceTitle}?`
    : `${GREETING} Хочу узнать стоимость ремонта.`;
}

/** Клиент не знает, что сломалось. */
export function buildUnknownIssueMessage(): string {
  return `${GREETING} Не знаю, что сломалось. Подскажите, с чего начать осмотр?`;
}

/** Текст для кнопки «Подобрать масло». */
export function buildOilMessage(): string {
  return `${GREETING} Нужен подбор масла.`;
}

