/**
 * Иконки, которых нет в lucide-react (брендовые).
 * Рисуем линейно, stroke 1.75 — в едином стиле с остальными иконками.
 * Раздел 6 запрещает эмодзи и разноцветные иконки.
 */
export function InstagramIcon({
  className = 'size-5',
  strokeWidth = 1.75,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
