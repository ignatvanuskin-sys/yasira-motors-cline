/**
 * Формирование ссылок WhatsApp — раздел 13 мастер-промпта.
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

/** Текст заявки для WhatsApp — из раздела 13. */
export function buildBookingMessage(data: {
  services: string[];
  car: string;
  when: string;
  name: string;
}): string {
  return [
    'Здравствуйте! Хочу записаться в YASIRA MOTORS.',
    `Услуги: ${data.services.length > 0 ? data.services.join(', ') : 'не указаны'}.`,
    `Авто: ${data.car}.`,
    `Когда: ${data.when}.`,
    `Имя: ${data.name}.`,
  ].join(' ');
}

/** Короткий текст для кнопки «Спросить цену». */
export function buildPriceMessage(): string {
  return 'Здравствуйте! Хочу узнать стоимость ';
}

/** Текст для кнопки «Подобрать масло». */
export function buildOilMessage(): string {
  return 'Здравствуйте! Нужен подбор масла.';
}
