'use client';

import { useEffect, useRef, useState } from 'react';
import { Section } from '@/components/ui/Section';
import { processSteps } from '@/content/faq';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { Dictionary } from '@/lib/i18n';

/**
 * Как проходит визит — раздел 10.6.
 * Вертикальная нумерованная линия на мобильном, горизонтальная на десктопе.
 * Линия дорисовывается один раз при появлении блока (scaleY/scaleX, 600 мс).
 */
export function Process({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  // При включённом «уменьшить движение» линия нарисована сразу.
  const isDrawn = reduced || drawn;

  return (
    <Section id="kak-prohodit">
      <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[40px]">
        {dict.process.title}
      </h2>

      <ol ref={ref} className="relative mt-8 grid gap-6 md:grid-cols-4 md:gap-5">
        {/* Линия: вертикальная на мобильном, горизонтальная на десктопе. */}
        <span
          aria-hidden
          className={
            'absolute top-2 bottom-2 left-[19px] w-px origin-top bg-line-light md:top-[19px] md:right-2 md:bottom-auto md:left-2 md:h-px md:w-auto md:origin-left ' +
            (isDrawn
              ? 'scale-y-100 transition-transform duration-600 ease-[cubic-bezier(.2,.7,.2,1)] md:scale-x-100'
              : 'scale-y-0 md:scale-x-0')
          }
        />

        {processSteps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4 md:block">
            <span
              className="tnum relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-line-light bg-surface text-sm font-bold text-text"
              aria-hidden
            >
              {index + 1}
            </span>
            <div className="md:mt-4 md:pr-2">
              <h3 className="text-[18px] leading-[1.25] font-semibold md:text-[22px]">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
