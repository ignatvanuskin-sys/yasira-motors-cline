'use client';

import { useBooking } from './BookingProvider';
import { getServiceById } from '@/content/services';
import { getTimeSlots } from '@/lib/hours';
import { formatBookingWhen } from '@/lib/bookingView';
import type { Dictionary } from '@/lib/i18n';

/**
 * Компактная сводка выбранного перед кнопкой «Отправить заявку» (раздел 13).
 * Показывает, что именно уйдёт менеджеру, — это снижает страх ошибиться.
 */
export function Summary({ dict, locale }: { dict: Dictionary; locale: 'ru' | 'kk' }) {
  const { state } = useBooking();
  const slot = getTimeSlots().find((s) => s.id === state.timeSlot);

  const serviceNames = state.services
    .map((id) => getServiceById(id)?.title)
    .filter((title): title is string => Boolean(title))
    .join(', ');

  const when = formatBookingWhen(state.day, slot?.label, locale, dict);

  if (!serviceNames && !state.car) return null;

  return (
    <div className="rounded-card border border-line-light bg-surface p-4">
      <p className="spec-label mb-2 text-muted">{dict.booking.summary}</p>
      <dl className="grid gap-1.5 text-sm">
        {serviceNames && (
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 text-muted">{dict.booking.servicesLabel}</dt>
            <dd className="min-w-0 flex-1 text-text">{serviceNames}</dd>
          </div>
        )}
        {state.car && (
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 text-muted">{dict.booking.carLabel}</dt>
            <dd className="min-w-0 flex-1 text-text">{state.car}</dd>
          </div>
        )}
        {(state.day || state.timeSlot) && (
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 text-muted">{dict.booking.whenLabel}</dt>
            <dd className="min-w-0 flex-1 text-text">{when}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
