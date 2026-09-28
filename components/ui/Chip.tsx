'use client';

import { Check } from 'lucide-react';

/**
 * Чип — переключатель внутри групп (шаги записи) и быстрые чипы в hero.
 * Чипы- checkbox/multiselect имеют role="checkbox" с aria-checked;
 * одиночный выбор (radio) передаётся пропом single.
 *
 * Минимальная тап-цель 48px по высоте (раздел 14).
 */
type ChipProps = {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  /** Одиночный выбор внутри группы (role="radio"). */
  single?: boolean;
  disabled?: boolean;
  id?: string;
  groupName?: string;
  className?: string;
  /** Тон поверхности: светлый контент или тёмная карточка. */
  tone?: 'light' | 'dark';
};

export function Chip({
  children,
  selected = false,
  onClick,
  single = false,
  disabled = false,
  id,
  groupName,
  className = '',
  tone = 'light',
}: ChipProps) {
  const role = single ? 'radio' : 'checkbox';

  // Стили задаются по тону, а не дописываются в className: иначе базовые
  // цвета чипа перебивают цвета тёмной карточки и текст становится нечитаемым.
  const shell =
    tone === 'dark'
      ? 'border-line-dark bg-bg-dark text-text-on-dark hover:border-muted-on-dark'
      : 'border-line-light bg-surface text-text hover:border-muted';

  const selectedStyles =
    tone === 'dark'
      ? 'border-accent bg-accent/15 text-text-on-dark'
      : 'border-accent bg-accent/12 text-text';

  return (
    <button
      type="button"
      id={id}
      role={role}
      aria-checked={selected}
      aria-label={typeof children === 'string' ? children : undefined}
      disabled={disabled}
      onClick={onClick}
      data-selected={selected ? 'true' : 'false'}
      className={
        'inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 ' +
        'text-left text-sm font-medium transition-[background-color,border-color,color,transform] ' +
        'duration-160 ease-[cubic-bezier(.2,.7,.2,1)] ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
        'disabled:opacity-40 disabled:pointer-events-none active:scale-[.98] ' +
        (selected ? selectedStyles : shell) +
        ` ${className}`
      }
    >
      {selected && (
        <Check
          className={`size-4 shrink-0 ${tone === 'dark' ? 'text-accent' : 'text-text'}`}
          strokeWidth={2.25}
          aria-hidden
        />
      )}
      <span>{children}</span>
      {role === 'radio' && groupName ? <span className="sr-only">{groupName}</span> : null}
    </button>
  );
}
