'use client';

import { MAX_SERVICES, useBooking } from './BookingProvider';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { allBookingOptions } from '@/content/services';
import { validateStep1 } from '@/lib/validation';
import type { Dictionary } from '@/lib/i18n';

/**
 * Шаг 1. «Что нужно сделать?» — раздел 13.
 * Мультивыбор чипов (максимум 4) + необязательное описание симптома.
 * Валидация: хотя бы один чип ИЛИ не менее 5 символов симптома.
 */
export function StepServices({
  dict,
  error,
  setError,
}: {
  dict: Dictionary;
  error: string;
  setError: (message: string) => void;
}) {
  const { state, toggleService, update, goToStep } = useBooking();

  const handleNext = () => {
    const message = validateStep1(state.services, state.symptom);
    if (message) {
      setError(message);
      return;
    }
    setError('');
    goToStep(2);
  };

  const atLimit = state.services.length >= MAX_SERVICES;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-text md:text-2xl">{dict.booking.step1Title}</h2>
        <p className="mt-1 text-sm text-muted">{dict.booking.step1Hint}</p>
      </div>

      <div
        role="group"
        aria-label={dict.booking.step1Title}
        className="flex flex-wrap gap-2"
      >
        {allBookingOptions.map((service) => {
          const selected = state.services.includes(service.id);
          const disabled = !selected && atLimit;
          return (
            <Chip
              key={service.id}
              selected={selected}
              disabled={disabled}
              onClick={() => toggleService(service.id)}
            >
              {service.title}
            </Chip>
          );
        })}
      </div>

      <div>
        <Field
          label={dict.booking.symptom}
          value={state.symptom}
          onChange={(value) => {
            update({ symptom: value });
            if (error) setError('');
          }}
          placeholder={dict.booking.symptomPlaceholder}
          maxLength={300}
          hint={`${state.symptom.length}/300`}
          error={error}
        />
      </div>

      <div className="mt-auto pt-2">
        <button
          type="button"
          onClick={handleNext}
          className="h-13 min-h-13 w-full rounded-btn bg-accent px-5 text-base font-semibold text-on-accent transition-[background-color,transform] duration-160 ease-[cubic-bezier(.2,.7,.2,1)] hover:bg-accent-hover active:translate-y-px active:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {dict.booking.next}
        </button>
      </div>
    </div>
  );
}
