/**
 * Схема валидации заявки — раздел 13.
 *
 * Одна и та же схема используется на клиенте (для показа ошибок) и на сервере
 * (для отсечения некорректных данных). Значения санитизируются и ограничиваются
 * по длине. Персональные данные (имя, телефон) не пишутся в логи.
 */

import { z } from 'zod';
import { normalizePhone, PHONE_ERROR } from './phone';

/** Убираем управляющие символы и обрезаем пробелы; HTML-экранирование — при отправке. */
export const sanitize = (value: string): string =>
  value
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const MAX_LENGTHS = {
  services: 4,
  symptom: 300,
  car: 60,
  year: 4,
  timeSlot: 16,
  date: 10,
  name: 40,
  phone: 18,
  comment: 300,
  source: 40,
  locale: 5,
} as const;

export const leadSchema = z.object({
  services: z
    .array(z.string().min(1).max(40))
    .min(1, 'Выберите хотя бы одну услугу')
    .max(MAX_LENGTHS.services, 'Не больше 4 услуг'),
  symptom: z.string().max(MAX_LENGTHS.symptom, 'Не больше 300 символов').optional().default(''),
  car: z
    .string()
    .transform(sanitize)
    .pipe(
      z
        .string()
        .min(2, 'Укажите марку и модель: минимум 2 символа')
        .max(MAX_LENGTHS.car, 'Не больше 60 символов'),
    ),
  year: z.string().max(MAX_LENGTHS.year).optional().default(''),
  timeSlot: z.string().max(MAX_LENGTHS.timeSlot).optional().default(''),
  date: z.string().max(MAX_LENGTHS.date).optional().default(''),
  name: z
    .string()
    .transform(sanitize)
    .pipe(
      z.string().min(2, 'Укажите имя: минимум 2 символа').max(MAX_LENGTHS.name, 'Не больше 40 символов'),
    ),
  phone: z
    .string()
    .transform((v) => normalizePhone(v) ?? '')
    .pipe(z.string().regex(/^\+7[67]\d{9}$/, PHONE_ERROR)),
  comment: z.string().max(MAX_LENGTHS.comment, 'Не больше 300 символов').optional().default(''),
  source: z.string().max(MAX_LENGTHS.source).optional().default(''),
  locale: z.string().max(MAX_LENGTHS.locale).optional().default('ru'),
  /** Honeypot: должно остаться пустым. */
  company: z.string().max(0).optional().default(''),
});

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;

/** Результат валидации с полями для подсветки. */
export type ValidationResult =
  | { success: true; data: Lead }
  | { success: false; fieldErrors: Record<string, string> };

export function validateLead(input: unknown): ValidationResult {
  const result = leadSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}

/** Клиентская валидация шага 1: хотя бы один чип или 5+ символов симптома. */
export function validateStep1(services: string[], symptom: string): string | null {
  if (services.length > 0) return null;
  if (symptom.trim().length >= 5) return null;
  return 'Выберите услугу или опишите симптом хотя бы 5 символами';
}
