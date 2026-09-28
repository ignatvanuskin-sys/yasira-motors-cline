import { describe, it, expect } from 'vitest';
import { normalizePhone, isValidPhone, formatPhone, applyPhoneMask, toWhatsappDigits } from '@/lib/phone';
import { PHONE_ERROR } from '@/lib/phone';

describe('normalizePhone', () => {
  it('приводит 8XXXXXXXXXX к +7XXXXXXXXXX', () => {
    expect(normalizePhone('87770884436')).toBe('+77770884436');
  });

  it('приводит 7XXXXXXXXXX (10 цифр) к +7XXXXXXXXXX', () => {
    expect(normalizePhone('7770884436')).toBe('+77770884436');
  });

  it('отбрасывает код 7 у 11-значного номера', () => {
    expect(normalizePhone('77770884436')).toBe('+77770884436');
  });

  it('убирает пробелы, скобки и дефисы', () => {
    expect(normalizePhone('+7 (777) 088-44-36')).toBe('+77770884436');
    expect(normalizePhone('  +7 777 088 44 36  ')).toBe('+77770884436');
  });

  it('сохраняет уже нормализованный номер', () => {
    expect(normalizePhone('+77770884436')).toBe('+77770884436');
  });

  it('возвращает null для пустой строки и мусора', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('абв')).toBeNull();
    expect(normalizePhone('123')).toBeNull();
  });

  it('возвращает null при неверной длине', () => {
    expect(normalizePhone('123456789')).toBeNull();
  });
});

describe('isValidPhone', () => {
  it('принимает номера с префиксом 7 и 6', () => {
    expect(isValidPhone('+77770884436')).toBe(true);
    expect(isValidPhone('+76000000000')).toBe(true);
  });

  it('отклоняет номера других операторов и длины', () => {
    expect(isValidPhone('+79990884436')).toBe(false);
    expect(isValidPhone('8777')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });
});

describe('formatPhone', () => {
  it('печатает в читаемом виде', () => {
    expect(formatPhone('+77770884436')).toBe('+7 777 088 44 36');
    expect(formatPhone('77770884436')).toBe('+7 777 088 44 36');
  });

  it('возвращает исходное значение, если номер не распознан', () => {
    expect(formatPhone('абв')).toBe('абв');
  });
});

describe('applyPhoneMask', () => {
  it('набирает маску по мере ввода (частичный ввод = цифры номера)', () => {
    expect(applyPhoneMask('')).toBe('+7');
    expect(applyPhoneMask('7')).toBe('+7 (7');
    expect(applyPhoneMask('77')).toBe('+7 (77');
    expect(applyPhoneMask('777')).toBe('+7 (777)');
    expect(applyPhoneMask('7777')).toBe('+7 (777) 7');
    expect(applyPhoneMask('77770')).toBe('+7 (777) 70');
  });

  it('распознаёт полный номер с кодом 7 или 8', () => {
    expect(applyPhoneMask('77770884436')).toBe('+7 (777) 088-44-36');
    expect(applyPhoneMask('87770884436')).toBe('+7 (777) 088-44-36');
    expect(applyPhoneMask('+7 (777) 088-44-36')).toBe('+7 (777) 088-44-36');
  });

  it('обрезает лишние цифры после 10', () => {
    expect(applyPhoneMask('77770884436999')).toBe('+7 (777) 088-44-36');
  });
});

describe('toWhatsappDigits', () => {
  it('возвращает 11 цифр без плюса', () => {
    expect(toWhatsappDigits('+7 (777) 088-44-36')).toBe('7770884436');
  });
});

describe('тексты ошибок', () => {
  it('сообщение об ошибке телефона корректно', () => {
    expect(PHONE_ERROR).toBe('Проверьте номер: нужно 10 цифр после +7');
  });
});
