import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * Кнопки — раздел 6.
 *  - высота 52px для основной на мобильном, 48px для вторичной;
 *  - радиус 12px, без градиентов;
 *  - hover — осветление, active — translateY(1px) + потемнение;
 *  - focus-visible — кольцо 2px янтарное с отступом 2px;
 *  - disabled — opacity .5 без hover.
 */
type Variant = 'primary' | 'secondary' | 'ghost' | 'wa' | 'onDark';
type Size = 'lg' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-btn font-semibold ' +
  'transition-[background-color,border-color,color,transform,opacity] duration-160 ' +
  'ease-[cubic-bezier(.2,.7,.2,1)] select-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:opacity-50 disabled:pointer-events-none active:translate-y-px';

const variants: Record<Variant, string> = {
  // Янтарный фон, тёмный текст. Янтарь НЕ используется как цвет текста.
  primary: 'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-press',
  secondary: 'border border-line-light bg-transparent text-text hover:bg-black/5 active:bg-black/10',
  ghost: 'text-text hover:bg-black/5 active:bg-black/10',
  wa: 'border border-wa bg-transparent text-wa-text hover:bg-wa/8 active:bg-wa/15',
  onDark: 'border border-line-dark bg-transparent text-text-on-dark hover:bg-white/8 active:bg-white/12',
};

const sizes: Record<Size, string> = {
  lg: 'h-13 min-h-13 px-5 text-base',
  md: 'h-12 min-h-12 px-4 text-base',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  full?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  full = false,
  children,
  ...rest
}: CommonProps & ComponentProps<'button'>) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  full = false,
  children,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
