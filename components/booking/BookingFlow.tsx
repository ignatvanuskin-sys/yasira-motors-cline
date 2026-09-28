'use client';

import { useEffect, useState } from 'react';
import { useBooking } from './BookingProvider';
import { BookingSheet } from './BookingSheet';
import { StepServices } from './StepServices';
import { StepCar } from './StepCar';
import { StepWhen } from './StepWhen';
import { Success } from './Success';
import { trackEvent } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n';

/**
 * Оркестратор системы записи — раздел 13.
 * Показывает индикатор «Шаг N из 3», кнопку «Назад» и нужный шаг.
 * Данные между шагами живут в BookingProvider.
 */
export function BookingFlow({ dict, locale }: { dict: Dictionary; locale: 'ru' | 'kk' }) {
  const { isOpen, step, goToStep, state } = useBooking();
  const [error, setError] = useState('');

  // Событие booking_open при каждом открытии.
  useEffect(() => {
    if (isOpen) trackEvent('booking_open', { source: state.source });
  }, [isOpen, state.source]);

  // События перехода на шаги 2 и 3.
  useEffect(() => {
    if (!isOpen) return;
    if (step === 2) trackEvent('booking_step_2', { source: state.source });
    if (step === 3) trackEvent('booking_step_3', { source: state.source });
  }, [isOpen, step, state.source]);

  const isResult = state.status === 'success' || state.status === 'error';

  return (
    <BookingSheet dict={dict}>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pt-4 pb-4 sm:px-6 sm:pt-5 sm:pb-5">
        {!isResult && (
          <div className="mb-4 flex items-center justify-between gap-3 pr-12">
            <p className="tnum spec-label text-muted" aria-live="polite">
              {dict.booking.step} {step} {dict.booking.of} 3
            </p>
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  goToStep((step - 1) as 1 | 2);
                }}
                className="min-h-11 rounded-btn px-3 text-sm font-semibold text-muted transition-colors duration-160 hover:bg-black/5 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {dict.booking.back}
              </button>
            )}
          </div>
        )}

        {state.status === 'success' || state.status === 'error' ? (
          <Success dict={dict} locale={locale} />
        ) : step === 1 ? (
          <StepServices dict={dict} error={error} setError={setError} />
        ) : step === 2 ? (
          <StepCar dict={dict} error={error} setError={setError} />
        ) : (
          <StepWhen dict={dict} locale={locale} />
        )}
      </div>
    </BookingSheet>
  );
}
