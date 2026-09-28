/**
 * Расчёт графика работы и живого статуса «Открыто / Закрыто».
 *
 * ВАЖНО: все расчёты ведутся в Asia/Aqtau (UTC+5) и не зависят от часового
 * пояса устройства пользователя или сервера. Это требование раздела 21.
 *
 * График берётся из content/site.ts (⚑ источники расходятся, используется
 * безопасный вариант: пн–сб 09:00–19:00, воскресенье — «уточняйте»).
 */

import { site } from '@/content/site';

export type DayRange = { from: string; to: string } | null;
export type Schedule = Record<number, DayRange>;

export const WEEKDAY_LABELS = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
] as const;

export const WEEKDAY_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'] as const;

export const schedule: Schedule = site.hours.schedule as unknown as Schedule;

/** «09:00» → 540 */
export function parseTime(time: string): number {
  const [h, m] = time.split(':');
  return Number(h) * 60 + Number(m ?? '0');
}

/** 540 → «09:00» */
export function formatMinutes(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Локальное время в Asia/Aqtau для произвольного момента.
 * Возвращает день недели (0=вс) и минуты с полуночи в актауском времени.
 */
export function getLocalParts(date: Date = new Date()): { weekday: number; minutes: number } {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: site.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekdayRaw = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return { weekday: weekdayMap[weekdayRaw] ?? 0, minutes: hour * 60 + minute };
}

export function getDayRange(weekday: number): DayRange {
  return schedule[weekday] ?? null;
}

export function isWorkingDay(weekday: number): boolean {
  return getDayRange(weekday) !== null;
}

export type OpenStatus = {
  isOpen: boolean;
  /** Открыто ли сегодня по графику (не значит, что сейчас внутри интервала). */
  worksToday: boolean;
  todayRange: DayRange;
  minutesToClose: number | null;
  nextOpenMinutes: number | null;
  nextOpenWeekday: number | null;
  label: string;
  /** Нейтральный серверный текст без расчёта — для SSR без смещения макета. */
  neutralLabel: string;
};

/**
 * Статус сервиса в заданный момент.
 * @param now момент времени (интерпретируется как абсолютное время).
 */
export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { weekday, minutes } = getLocalParts(now);
  const todayRange = getDayRange(weekday);

  if (todayRange) {
    const from = parseTime(todayRange.from);
    const to = parseTime(todayRange.to);
    if (minutes >= from && minutes < to) {
      return {
        isOpen: true,
        worksToday: true,
        todayRange,
        minutesToClose: to - minutes,
        nextOpenMinutes: null,
        nextOpenWeekday: null,
        label: `Открыто сегодня до ${todayRange.to}`,
        neutralLabel: 'Открыто сегодня до 19:00',
      };
    }
    if (minutes < from) {
      return {
        isOpen: false,
        worksToday: true,
        todayRange,
        minutesToClose: null,
        nextOpenMinutes: from,
        nextOpenWeekday: weekday,
        label: `Сейчас закрыто, откроемся в ${todayRange.from}`,
        neutralLabel: 'Открыто сегодня до 19:00',
      };
    }
    // Уже закрылись сегодня — ищем следующий рабочий день.
    const next = findNextOpening(weekday);
    return {
      isOpen: false,
      worksToday: true,
      todayRange,
      minutesToClose: null,
      nextOpenMinutes: next.minutes,
      nextOpenWeekday: next.weekday,
      label: next.label,
      neutralLabel: 'Открыто сегодня до 19:00',
    };
  }

  // Сегодня нерабочий день (по умолчанию — воскресенье).
  const next = findNextOpening(weekday);
  return {
    isOpen: false,
    worksToday: false,
    todayRange: null,
    minutesToClose: null,
    nextOpenMinutes: next.minutes,
    nextOpenWeekday: next.weekday,
    label: next.label,
    neutralLabel: 'Открыто сегодня до 19:00',
  };
}

/** Ближайший момент открытия после указанного дня недели. */
function findNextOpening(weekday: number): {
  minutes: number | null;
  weekday: number | null;
  label: string;
} {
  for (let step = 1; step <= 7; step += 1) {
    const candidate = (weekday + step) % 7;
    const range = getDayRange(candidate);
    if (range) {
      const todayWord = step === 1 ? 'завтра' : (WEEKDAY_LABELS[candidate] ?? '');
      return {
        minutes: parseTime(range.from),
        weekday: candidate,
        label: `Сейчас закрыто, откроемся ${todayWord} в ${range.from}`,
      };
    }
  }
  // Защитный сценарий: график полностью пуст.
  return { minutes: null, weekday: null, label: 'Уточняйте время по телефону' };
}

/** График одной строкой: «пн–сб 09:00–19:00» */
export function formatScheduleLine(): string {
  // Порядок недели для отображения: пн → вс.
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];

  // Группируем подряд идущие дни с одинаковым интервалом.
  type Run = { first: number; last: number; from: string; to: string };
  const runs: Run[] = [];

  for (const weekday of weekOrder) {
    const range = getDayRange(weekday);
    if (!range) continue;
    const last = runs[runs.length - 1];
    if (last && last.to === range.to && last.from === range.from && last.last === weekday - 1) {
      last.last = weekday;
    } else {
      runs.push({ first: weekday, last: weekday, from: range.from, to: range.to });
    }
  }

  if (runs.length === 0) return 'Уточняйте по телефону';

  return runs
    .map((run) => {
      const label =
        run.first === run.last
          ? (WEEKDAY_SHORT[run.first] ?? '')
          : `${WEEKDAY_SHORT[run.first]}–${WEEKDAY_SHORT[run.last]}`;
      return `${label} ${run.from}–${run.to}`;
    })
    .join(', ');
}

/** Нейтральный текст без расчёта — рендерится на сервере без смещений макета. */
export const NEUTRAL_STATUS = 'Ежедневно 09:00–19:00';

/** Подпись графика для блока контактов и футера. */
export const SCHEDULE_SUMMARY = formatScheduleLine();

/** Слоты времени для шага 3 записи — границы строятся из графика. */
export type TimeSlot = { id: string; label: string; from: number; to: number };

export function getTimeSlots(): TimeSlot[] {
  const dayRange = getDayRange(1) ?? { from: '09:00', to: '19:00' };
  const from = parseTime(dayRange.from);
  const to = parseTime(dayRange.to);
  const slots: TimeSlot[] = [
    { id: 'morning', label: `Утро ${dayRange.from}–12`, from, to: Math.min(12 * 60, to) },
    { id: 'day', label: 'День 12–16', from: Math.max(from, 12 * 60), to: Math.min(16 * 60, to) },
    { id: 'evening', label: `Вечер 16–${dayRange.to}`, from: Math.max(from, 16 * 60), to },
    { id: 'any', label: 'Не важно', from, to },
  ];
  return slots.filter((s) => s.to > s.from);
}

/**
 * Можно ли выбрать «сегодня»: сервис открыт и до закрытия осталось больше часа.
 * Используется в шаге 3 записи для дизейбла кнопки «Сегодня».
 */
export function canBookToday(now: Date = new Date()): boolean {
  const status = getOpenStatus(now);
  if (!status.isOpen) return false;
  return (status.minutesToClose ?? 0) > 60;
}

/** «14:32» по актаускому времени — для сообщения в Telegram. */
export function formatTimeAqtau(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: site.timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** «28.09.2026 14:32 (Актау)» */
export function formatDateTimeAqtau(date: Date = new Date()): string {
  const d = new Intl.DateTimeFormat('ru-RU', {
    timeZone: site.timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
  return `${d} ${formatTimeAqtau(date)} (Актау)`;
}
