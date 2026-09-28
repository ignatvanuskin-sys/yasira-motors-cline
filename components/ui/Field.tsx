'use client';

import { AlertCircle } from 'lucide-react';
import { cloneElement, useId, type InputHTMLAttributes, type ReactElement } from 'react';

/**
 * Поле формы — раздел 6.
 *  - высота 52px, радиус 10px, граница 1px;
 *  - подпись НАД полем, ошибка ПОД полем: красным + иконка (не только цвет);
 *  - aria-invalid и aria-describedby; ошибки объявляются через aria-live.
 */
type FieldProps = {
  label: string;
  /**
   * Дочерний контент передаётся через children — значит value/onChange
   * контролируются самим полем внутри. Обязательные только для рендера
   * полем самого компонента Field.
   */
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'tel' | 'date' | 'select';
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: 'text' | 'tel';
  maxLength?: number;
  min?: string;
  max?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  onBlur?: () => void;
};

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  hint,
  required = false,
  autoComplete,
  inputMode,
  maxLength,
  min,
  max,
  disabled = false,
  children,
  onBlur,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
        {required && (
          <span className="ml-1 text-muted" aria-hidden>
            *
          </span>
        )}
      </label>

      {children
        ? // Кастомный input получает id и aria-атрибуты от Field:
          // иначе <label htmlFor> не указывал бы ни на одно поле.
          cloneElement(children as ReactElement<InputHTMLAttributes<HTMLInputElement>>, {
            id,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy || undefined,
          })
        : (
          <input
            id={id}
            type={type}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            min={min}
            max={max}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            className={
              'h-13 min-h-13 w-full rounded-field border bg-surface px-3.5 text-base text-text ' +
              'transition-[border-color,box-shadow] duration-160 placeholder:text-muted ' +
              'focus:outline-none focus-visible:outline-none ' +
              (error
                ? 'border-error focus:shadow-[0_0_0_2px_rgba(214,69,69,.28)]'
                : 'border-line-light focus:border-text focus:shadow-[0_0_0_2px_rgba(242,169,0,.28)]') +
              ' disabled:opacity-50'
            }
          />
        )}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-error"
          aria-live="polite"
        >
          <AlertCircle className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
