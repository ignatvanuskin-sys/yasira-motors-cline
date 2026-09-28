/** Контейнер 1200px с полями 16/20/32px (разделы 14–15). */
export function Container({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`container-site ${className}`}>{children}</div>;
}
