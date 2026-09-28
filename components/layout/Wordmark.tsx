/** Текстовый wordmark YASIRA MOTORS — вместо ненайденного логотипа (⚑). */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex flex-col leading-none font-extrabold tracking-[-0.02em] ${className}`}
    >
      <span className="text-text-on-dark">YASIRA</span>
      {/* Маркер-янтарь под словом MOTORS — единственный акцент. */}
      <span className="mt-0.5 flex items-center gap-1 text-text-on-dark">
        MOTORS
        <span className="h-0.5 w-3 bg-accent" aria-hidden />
      </span>
    </span>
  );
}
