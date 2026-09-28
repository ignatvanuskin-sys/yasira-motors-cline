'use client';

import { Check, MessageCircle, RotateCcw } from 'lucide-react';
import { useBooking } from './BookingProvider';
import { getServiceById } from '@/content/services';
import { canBookToday, getTimeSlots } from '@/lib/hours';
import { formatBookingWhen } from '@/lib/bookingView';
import { buildBookingMessage, whatsappLinkWithText } from '@/lib/whatsapp';
import type { Dictionary } from '@/lib/i18n';

/**
 * Экран результата отправки — раздел 13.
 *  - успех: галочка, понятный текст, кнопки WhatsApp и «Закрыть»;
 *  - ошибка: заявка НЕ теряется — WhatsApp с уже собранным текстом + «Повторить».
 */
export function Success({ dict, locale }: { dict: Dictionary; locale: 'ru' | 'kk' }) {
  const { state, close, setStatus, reset } = useBooking();

  const serviceNames = state.services
    .map((id) => getServiceById(id)?.title)
    .filter((title): title is string => Boolean(title));

  const slotLabel = getTimeSlots().find((s) => s.id === state.timeSlot)?.label;
  const whenText = formatBookingWhen(state.day, slotLabel, locale, dict);

  const waUrl = whatsappLinkWithText(
    buildBookingMessage({ services: serviceNames, car: state.car, when: whenText, name: state.name }),
  );

  if (state.status === 'error') {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold text-text md:text-2xl">{dict.booking.errorTitle}</h2>
          <p className="mt-1.5 text-base text-muted">{dict.booking.errorText}</p>
        </div>

        <div className="rounded-card border border-line-light bg-surface p-4">
          <p className="spec-label mb-2 text-muted">{dict.booking.summary}</p>
          <p className="text-sm text-text">
            {serviceNames.join(', ')}
            {state.car ? ` · ${state.car}` : ''}
            {whenText ? ` · ${whenText}` : ''}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-13 min-h-13 w-full items-center justify-center gap-2 rounded-btn border border-wa bg-transparent px-5 text-base font-semibold text-wa transition-colors duration-160 hover:bg-wa/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <MessageCircle className="size-5" strokeWidth={1.75} aria-hidden />
            {dict.cta.whatsapp}
          </a>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="inline-flex h-13 min-h-13 w-full items-center justify-center gap-2 rounded-btn bg-accent px-5 text-base font-semibold text-on-accent transition-[background-color,transform] duration-160 hover:bg-accent-hover active:translate-y-px active:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <RotateCcw className="size-5" strokeWidth={1.75} aria-hidden />
            {dict.booking.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <span className="flex size-14 items-center justify-center rounded-full border-2 border-success">
          <Check
            className="check-draw size-7 text-success motion-safe:animate-[draw-check_500ms_var(--ease-out)_both]"
            strokeWidth={2.5}
            aria-hidden
          />
        </span>
        <h2 className="text-xl font-bold text-text md:text-2xl" aria-live="polite">
          {dict.booking.successTitle}
        </h2>
        <p className="text-base text-muted">{dict.booking.successText}</p>
        {!canBookToday() && <p className="text-sm text-muted">{dict.booking.successClosed}</p>}
      </div>

      <div className="rounded-card border border-line-light bg-surface p-4">
        <p className="spec-label mb-2 text-muted">{dict.booking.summary}</p>
        <dl className="grid gap-1.5 text-sm">
          {serviceNames.length > 0 && (
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-muted">{dict.booking.servicesLabel}</dt>
              <dd className="min-w-0 flex-1 text-text">{serviceNames.join(', ')}</dd>
            </div>
          )}
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 text-muted">{dict.booking.carLabel}</dt>
            <dd className="min-w-0 flex-1 text-text">
              {state.car}
              {state.year ? `, ${state.year}` : ''}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 text-muted">{dict.booking.whenLabel}</dt>
            <dd className="min-w-0 flex-1 text-text">{whenText}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-13 min-h-13 w-full items-center justify-center gap-2 rounded-btn border border-wa bg-transparent px-5 text-base font-semibold text-wa transition-colors duration-160 hover:bg-wa/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <MessageCircle className="size-5" strokeWidth={1.75} aria-hidden />
          {dict.cta.whatsapp}
        </a>
        <button
          type="button"
          onClick={() => {
            reset();
            close();
          }}
          className="inline-flex h-13 min-h-13 w-full items-center justify-center rounded-btn border border-line-light px-5 text-base font-semibold text-text transition-colors duration-160 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {dict.booking.close}
        </button>
      </div>
    </div>
  );
}
