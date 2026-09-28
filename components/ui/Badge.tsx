/** Бейдж — рейтинг, счётчик, статус. Табличные цифры (раздел 6). */
export function Badge({
  children,
  tone = 'light',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'light' | 'dark' | 'accent';
  className?: string;
}) {
  const tones = {
    light: 'border border-line-light bg-surface text-text',
    dark: 'border border-line-dark bg-bg-dark-2 text-text-on-dark',
    accent: 'border border-accent bg-accent/12 text-text',
  } as const;

  return (
    <span
      className={`tnum inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
