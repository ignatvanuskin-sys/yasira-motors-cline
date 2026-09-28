import { Container } from './Container';
import { Reveal } from './Reveal';

type SectionProps = {
  id: string;
  children: React.ReactNode;
  /** Светлый контентный блок (по умолчанию) или тёмный. */
  tone?: 'light' | 'dark';
  className?: string;
  /** Отключить анимацию появления (первый экран, LCP). */
  noReveal?: boolean;
};

/**
 * Секция контента. Один H2 на секцию, семантический <section> с id для якорей.
 */
export function Section({
  id,
  children,
  tone = 'light',
  className = '',
  noReveal = false,
}: SectionProps) {
  const bg = tone === 'dark' ? 'bg-bg-dark text-text-on-dark' : 'bg-bg-light text-text';
  const content = (
    <Container className={`py-16 md:py-20 ${className}`}>{children}</Container>
  );

  if (noReveal) {
    return (
      <section id={id} className={`${bg} scroll-mt-18`}>
        {content}
      </section>
    );
  }

  return (
    <section id={id} className={`${bg} scroll-mt-18`}>
      <Reveal>{content}</Reveal>
    </section>
  );
}
