import { describe, it, expect } from 'vitest';
import { getOpenStatus, getLocalParts, formatScheduleLine } from '@/lib/hours';

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

describe('график', () => {
  it('печатает график одной строкой без воскресенья', () => {
    expect(formatScheduleLine()).toBe('пн–сб 09:00–19:00');
  });
});
