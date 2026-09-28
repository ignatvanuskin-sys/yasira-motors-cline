import { describe, it, expect } from 'vitest';
import { formatBookingDay, formatBookingWhen } from '@/lib/bookingView';
import type { Dictionary } from '@/lib/i18n';

// Словарь не импортируем: node:test не умеет JSON без import-атрибута.
// Эти функции читают только booking.today и booking.tomorrow.
const dict = {
  booking: { today: 'Сегодня', tomorrow: 'Завтра' },
} as unknown as Dictionary;

describe('formatBookingDay', () => {
  it('пустой день означает «сегодня»', () => {
    // Именно это значение уходит в заявку, если клиент не выбрал день.
    expect(formatBookingDay('', 'ru', dict)).toBe('сегодня');
  });

  it('склоняет «сегодня» и «завтра» в нижний регистр', () => {
    expect(formatBookingDay('today', 'ru', dict)).toBe('сегодня');
    expect(formatBookingDay('tomorrow', 'ru', dict)).toBe('завтра');
  });

  it('произвольную дату показывает по-человечески, а не как d-2026-10-05', () => {
    expect(formatBookingDay('d-2026-10-05', 'ru', dict)).toBe('5 октября');
    expect(formatBookingDay('2026-10-05', 'ru', dict)).toBe('5 октября');
  });

  it('битую дату не превращает в мусор', () => {
    expect(formatBookingDay('d- nonsense', 'ru', dict)).toBe('сегодня');
  });
});

describe('formatBookingWhen', () => {
  it('склеивает день и слот через запятую', () => {
    expect(formatBookingWhen('today', 'Утро 09:00–12', 'ru', dict)).toBe(
      'сегодня, Утро 09:00–12',
    );
  });

  it('без слота показывает только день, без висячей запятой', () => {
    expect(formatBookingWhen('tomorrow', undefined, 'ru', dict)).toBe('завтра');
  });

  it('никогда не возвращает пустую строку', () => {
    // Регрессия: на экране успеха строка «Когда» была пустой.
    expect(formatBookingWhen('', undefined, 'ru', dict)).toBe('сегодня');
  });
});
import { getOpenStatus, getLocalParts, canBookToday, getTimeSlots, formatScheduleLine } from '@/lib/hours';

/**
 * Время в Asia/Aqtau (UTC+5). Моменты передаются как абсолютные даты UTC:
 * чтобы получить 14:00 в Актау, нужно передать 09:00 UTC.
 */
const at = (utcHour: number, utcMinute = 0) => new Date(Date.UTC(2026, 8, 28, utcHour, utcMinute));

// 2026-09-28 — понедельник. 2026-09-27 — воскресенье.
describe('getLocalParts', () => {
  it('переводит UTC в актауское время UTC+5', () => {
    // 09:00 UTC = 14:00 в Актау, понедельник.
    const parts = getLocalParts(at(9));
    expect(parts.weekday).toBe(1);
    expect(parts.minutes).toBe(14 * 60);
  });

  it('учитывает переход через полночь', () => {
    // 21:00 UTC в понедельник = 02:00 вторника в Актау.
    const parts = getLocalParts(at(21));
    expect(parts.weekday).toBe(2);
    expect(parts.minutes).toBe(2 * 60);
  });
});

describe('getOpenStatus', () => {
  it('открыт в середине рабочего дня понедельника', () => {
    // 08:00 UTC = 13:00 Актау, понедельник.
    const status = getOpenStatus(at(8));
    expect(status.isOpen).toBe(true);
    expect(status.label).toBe('Открыто сегодня до 19:00');
    expect(status.minutesToClose).toBe(6 * 60);
  });

  it('закрыт до открытия, называет время открытия', () => {
    // 02:00 UTC = 07:00 Актау — до 09:00.
    const status = getOpenStatus(at(2));
    expect(status.isOpen).toBe(false);
    expect(status.worksToday).toBe(true);
    expect(status.label).toBe('Сейчас закрыто, откроемся в 09:00');
  });

  it('после закрытия предлагает завтра', () => {
    // 16:00 UTC = 21:00 Актау, понедельник — уже закрыто.
    const status = getOpenStatus(at(16));
    expect(status.isOpen).toBe(false);
    expect(status.nextOpenWeekday).toBe(2);
    expect(status.label).toBe('Сейчас закрыто, откроемся завтра в 09:00');
  });

  it('в воскресенье не показывает «Открыто» (график не подтверждён)', () => {
    // 2026-09-27 — воскресенье. 08:00 UTC = 13:00 Актау.
    const sunday = new Date(Date.UTC(2026, 8, 27, 8));
    const status = getOpenStatus(sunday);
    expect(status.isOpen).toBe(false);
    expect(status.worksToday).toBe(false);
    // Из воскресенья ближайшее открытие — «завтра» (понедельник).
    expect(status.nextOpenWeekday).toBe(1);
    expect(status.label).toBe('Сейчас закрыто, откроемся завтра в 09:00');
  });

  it('в субботу вечером предлагает понедельник, а не воскресенье', () => {
    // 2026-10-03 — суббота. 16:00 UTC = 21:00 Актау.
    const saturday = new Date(Date.UTC(2026, 9, 3, 16));
    const status = getOpenStatus(saturday);
    expect(status.isOpen).toBe(false);
    expect(status.nextOpenWeekday).toBe(1);
  });

  it('на границе закрытия: в 19:00 уже закрыто', () => {
    // 14:00 UTC = 19:00 Актау — правая граница интервала исключается.
    const status = getOpenStatus(at(14));
    expect(status.isOpen).toBe(false);
  });

  it('на границе открытия: в 09:00 уже открыто', () => {
    // 04:00 UTC = 09:00 Актау.
    const status = getOpenStatus(at(4));
    expect(status.isOpen).toBe(true);
  });
});

describe('canBookToday', () => {
  it('разрешает «сегодня» в середине дня', () => {
    expect(canBookToday(at(8))).toBe(true);
  });

  it('запрещает «сегодня» в последний час перед закрытием', () => {
    // 13:00 UTC = 18:00 Актау, до закрытия час.
    expect(canBookToday(at(13))).toBe(false);
  });

  it('запрещает «сегодня» в нерабочее время', () => {
    expect(canBookToday(at(2))).toBe(false);
  });
});

describe('график', () => {
  it('строит слоты времени из графика 09:00–19:00', () => {
    const slots = getTimeSlots();
    expect(slots.length).toBe(4);
    expect(slots[0]?.label).toBe('Утро 09:00–12');
    expect(slots[3]?.label).toBe('Не важно');
  });

  it('печатает график одной строкой без воскресенья', () => {
    expect(formatScheduleLine()).toBe('пн–сб 09:00–19:00');
  });
});
