/**
 * Работа с телефонными номерами — раздел 13 мастер-промпта.
 *
 * Правила:
 *  - принимаем ввод в любом формате (8XXXXXXXXXX, 7XXXXXXXXXX, +7..., с пробелами);
 *  - приводим к единому виду +7XXXXXXXXXX;
 *  - проверяем шаблоном ^\+7[67]\d{9}$;
 *  - маска ввода +7 (7XX) XXX-XX-XX.
 */

/** Единственный допустимый формат хранения. */
export const PHONE_REGEX = /^\+7[67]\d{9}$/;

/** Текст ошибки из раздела 13. */
export const PHONE_ERROR = 'Проверьте номер: нужно 10 цифр после +7';

/**
 * Приводит любой пользовательский ввод к +7XXXXXXXXXX.
 * Возвращает null, если в номере не 10 цифр.
 */
export function normalizePhone(input: string): string | null {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/\D/g, '');
  if (digits.length === 0) return null;

  // 11 и более цифр с ведущим 7/8 — это код country, отбрасываем его.
  // 10 цифр считаем уже национальным номером (7XXXXXXXXXX из раздела 13).
  const national = digits.length > 10 && (digits.startsWith('7') || digits.startsWith('8'))
    ? digits.slice(1)
    : digits;

  if (national.length !== 10) return null;
  return `+7${national}`;
}

/** Проверка уже нормализованного номера. */
export function isValidPhone(input: string): boolean {
  return PHONE_REGEX.test(normalizePhone(input) ?? '');
}

/** Человекочитаемый вид: +7 777 088 44 36 */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return phone.trim();
  const d = normalized.slice(2);
  return `+7 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

/**
 * Форматирование ввода по мере набора. Пробелы и скобки добавляются на лету,
 * чтобы пользователю было видеть привычный формат.
 */
export function applyPhoneMask(input: string): string {
  const digits = input.replace(/\D/g, '');
  // Ведущий код 7/8 отбрасываем, чтобы в маску попало ровно 10 цифр.
  const national = digits.length > 10 && (digits.startsWith('7') || digits.startsWith('8'))
    ? digits.slice(1)
    : digits;
  const d = national.slice(0, 10);

  let out = '+7';
  if (d.length > 0) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ')';
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

/** Номер без пробелов для ссылки wa.me — ожидает 11 цифр без плюса. */
export function toWhatsappDigits(phone: string): string | null {
  const normalized = normalizePhone(phone);
  return normalized ? normalized.slice(2) : null;
}
