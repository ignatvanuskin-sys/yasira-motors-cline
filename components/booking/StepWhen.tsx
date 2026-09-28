'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useBooking } from './BookingProvider';
import { Summary } from './Summary';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { getTimeSlots, canBookToday } from '@/lib/hours';
import { applyPhoneMask, normalizePhone, PHONE_ERROR } from '@/lib/phone';
import { MAX_BOOK_DAYS, MAX_NAME, SUBMIT_TIMEOUT_MS } from '@/lib/validation-constants';
import { submitLead } from './submitLead';
import type { Dictionary } from '@/lib/i18n';

/** Локальная дата в формате YYYY-MM-DD (без сдвига по UTC). */
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** «12 октября» для произвольной даты. */
function formatDayLabel(iso: string, locale: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}



type StepWhenProps = {
  dict: Dictionary;
  locale: 'ru' | 'kk';
};

export function StepWhen({ dict, locale }: StepWhenProps) {
  const { state, update, goToStep, setStatus } = useBooking();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Момент открытия шага 3 для защиты от слишком быстрой отправки.
  // Заполняется в эффекте, а не через Date.now() при рендере: рендер должен
  // оставаться чистым (React), иначе значение «прыгает» между проходами.
  const startedAt = useRef<number | null>(null);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const todayIso = useMemo(() => toISODate(new Date()), []);
  const minDate = todayIso;
  const maxDate = useMemo(() => toISODate(addDays(new Date(), MAX_BOOK_DAYS)), []);

  // «Сегодня» отключается, если сервис закрыт или закроется меньше чем через час.
  const todayDisabled = !canBookToday();
  const slots = getTimeSlots();
  const dayValue = state.day || 'today';
  const isCustomDay = dayValue.startsWith('d-');

  const submit = async () => {
    const phone = normalizePhone(state.phone) ?? '';
    if (state.name.trim().length < 2) {
      setError(dict.booking.errorName);
      nameRef.current?.focus();
      return;
    }
    if (!/^\+7[67]\d{9}$/.test(phone)) {
      setError(PHONE_ERROR);
      phoneRef.current?.focus();
      return;
    }
    setError('');

    setIsSubmitting(true);
    setStatus('sending');
    const result = await submitLead({
      ...state,
      phone,
      day: dayValue,
      fillTimeMs: startedAt.current === null ? 0 : Date.now() - startedAt.current,
      timeoutMs: SUBMIT_TIMEOUT_MS,
    });
    setIsSubmitting(false);

    if (result.ok) setStatus('success');
    else setStatus('error', result.message);
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-text md:text-2xl">{dict.booking.step3Title}</h2>


      <fieldset>
        <legend className="mb-2 text-sm font-medium text-text">{dict.booking.day}</legend>
        <div role="radiogroup" aria-label={dict.booking.day} className="flex flex-wrap gap-2">
          <Chip
            single
            groupName={dict.booking.day}
            selected={dayValue === 'today'}
            disabled={todayDisabled}
            onClick={() => update({ day: 'today' })}
          >
            {dict.booking.today}
          </Chip>
          <Chip
            single
            groupName={dict.booking.day}
            selected={dayValue === 'tomorrow'}
            onClick={() => update({ day: 'tomorrow' })}
          >
            {dict.booking.tomorrow}
          </Chip>
          <label
            className={
              'inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border bg-surface px-4 py-2.5 text-sm font-medium transition-colors duration-160 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ' +
              (isCustomDay ? 'border-accent text-text' : 'border-line-light text-muted hover:border-muted')
            }
          >
            <span>{isCustomDay ? formatDayLabel(dayValue.slice(2), locale) : dict.booking.otherDay}</span>
            <input
              type="date"
              min={minDate}
              max={maxDate}
              value={isCustomDay ? dayValue.slice(2) : ''}
              onChange={(e) => update({ day: `d-${e.target.value}` })}
              className="w-[7.5rem] bg-transparent text-sm text-text focus:outline-none"
              aria-label={dict.booking.otherDay}
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-text">{dict.booking.time}</legend>
        <div role="radiogroup" aria-label={dict.booking.time} className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <Chip
              key={slot.id}
              single
              groupName={dict.booking.time}
              selected={state.timeSlot === slot.id}
              onClick={() => update({ timeSlot: slot.id })}
            >
              {slot.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={dict.booking.name} value={state.name} onChange={() => {}}>
          <input
            ref={nameRef}
            type="text"
            value={state.name}
            onChange={(e) => {
              update({ name: e.target.value.slice(0, MAX_NAME) });
              if (error) setError('');
            }}
            placeholder={dict.booking.namePlaceholder}
            maxLength={MAX_NAME}
            autoComplete="name"
            required
            className={
              'h-13 min-h-13 w-full rounded-field border bg-surface px-3.5 text-base text-text ' +
              'transition-[border-color,box-shadow] duration-160 placeholder:text-muted focus:outline-none focus-visible:outline-none ' +
              (error === dict.booking.errorName
                ? 'border-error focus:shadow-[0_0_0_2px_rgba(214,69,69,.28)]'
                : 'border-line-light focus:border-text focus:shadow-[0_0_0_2px_rgba(242,169,0,.28)]')
            }
          />
        </Field>

        <Field
          label={dict.booking.phone}
          value={state.phone}
          onChange={() => {}}
          type="tel"
          error={error === PHONE_ERROR ? error : undefined}
        >
          <input
            ref={phoneRef}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={state.phone}
            onChange={(e) => {
              update({ phone: applyPhoneMask(e.target.value) });
              if (error) setError('');
            }}
            placeholder="+7 (___) ___-__-__"
            required
            className={
              'h-13 min-h-13 w-full rounded-field border bg-surface px-3.5 text-base text-text ' +
              'transition-[border-color,box-shadow] duration-160 placeholder:text-muted focus:outline-none focus-visible:outline-none ' +
              (error === PHONE_ERROR
                ? 'border-error focus:shadow-[0_0_0_2px_rgba(214,69,69,.28)]'
                : 'border-line-light focus:border-text focus:shadow-[0_0_0_2px_rgba(242,169,0,.28)]')
            }
          />
        </Field>
      </div>

      {error && error !== PHONE_ERROR && (
        <p className="text-sm font-medium text-error" aria-live="polite">
          {error}
        </p>
      )}

      <Summary dict={dict} locale={locale} />

      {/* Honeypot: скрыт от людей, заполняется ботами. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0"
      />

      <p className="text-sm text-muted">
        {dict.booking.consent}{' '}
        <a href="/privacy" className="underline underline-offset-2 hover:text-text">
          {dict.booking.privacy}
        </a>
      </p>

      <div className="mt-auto flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="h-13 min-h-13 rounded-btn border border-line-light px-5 text-base font-semibold text-text transition-colors duration-160 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {dict.booking.back}
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="h-13 min-h-13 flex-1 rounded-btn bg-accent px-5 text-base font-semibold text-on-accent transition-[background-color,transform] duration-160 ease-[cubic-bezier(.2,.7,.2,1)] hover:bg-accent-hover active:translate-y-px active:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? dict.booking.sending : dict.booking.submit}
        </button>
      </div>
    </div>
  );
}
