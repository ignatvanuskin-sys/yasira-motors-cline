'use client';

import { useBooking } from './BookingProvider';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { brandChips, carYears } from '@/content/services';
import { MAX_CARS } from '@/lib/validation-constants';
import type { Dictionary } from '@/lib/i18n';

/**
 * Шаг 2. «Ваш автомобиль» — раздел 13.
 * Чипы брендов — подсказка ввода, а НЕ заявление «работаем с этими марками»
 * (список марок ⚑ не подтверждён). По тапу чип подставляется в поле.
 */
export function StepCar({
  dict,
  error,
  setError,
}: {
  dict: Dictionary;
  error: string;
  setError: (message: string) => void;
}) {
  const { state, update, goToStep } = useBooking();

  const handleNext = () => {
    const trimmed = state.car.trim();
    if (trimmed.length < 2) {
      setError(dict.booking.errorCar);
      return;
    }
    setError('');
    goToStep(3);
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-text md:text-2xl">{dict.booking.step2Title}</h2>

      <div
        role="group"
        aria-label={dict.booking.car}
        className="snap-row -mx-4 gap-2 px-4 pb-1 md:mx-0 md:flex-wrap md:px-0"
      >
        {brandChips.map((brand) => (
          <Chip
            key={brand}
            className="snap-item"
            single
            groupName={dict.booking.car}
            selected={state.car === brand}
            onClick={() => update({ car: state.car === brand ? '' : brand })}
          >
            {brand}
          </Chip>
        ))}
      </div>

      <Field
        label={dict.booking.car}
        value={state.car}
        onChange={(value) => {
          update({ car: value.slice(0, MAX_CARS) });
          if (error) setError('');
        }}
        placeholder={dict.booking.carPlaceholder}
        maxLength={MAX_CARS}
        autoComplete="off"
        required
        error={error}
      />

      <Field label={dict.booking.year}>
        <select
          value={state.year}
          onChange={(e) => update({ year: e.target.value })}
          className="h-13 min-h-13 w-full rounded-field border border-line-light bg-surface px-3.5 text-base text-text transition-[border-color,box-shadow] duration-160 focus:border-text focus:shadow-[0_0_0_2px_rgba(242,169,0,.28)] focus:outline-none"
        >
          <option value="">{dict.booking.yearAny}</option>
          {carYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </Field>

      <div className="mt-auto flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => {
            setError('');
            goToStep(1);
          }}
          className="h-13 min-h-13 rounded-btn border border-line-light px-5 text-base font-semibold text-text transition-colors duration-160 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {dict.booking.back}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="h-13 min-h-13 flex-1 rounded-btn bg-accent px-5 text-base font-semibold text-on-accent transition-[background-color,transform] duration-160 ease-[cubic-bezier(.2,.7,.2,1)] hover:bg-accent-hover active:translate-y-px active:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {dict.booking.next}
        </button>
      </div>
    </div>
  );
}
