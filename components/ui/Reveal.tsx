'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

/**
 * Появление блока при прокрутке — раздел 16.
 * Одна лёгкая утилита на весь сайт: IntersectionObserver + только
 * transform/opacity, одно срабатывание. Блоки первого экрана не анимируются
 * (noReveal), чтобы не задерживать LCP.
 *
 * ВАЖНО: контент не должен зависеть от срабатывания наблюдателя. Если по
 * какой-то причине он не сработал (отключённый JS, экранная печать, поиск по
 * странице), блок всё равно станет видимым по таймауту.
 */
export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Уважаем системную настройку: без анимации сразу показываем.
    if (reduced) return;

    const show = () => setVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.unobserve(entry.target);
          }
        }
      },
      // Нижняя граница с запасом: блок раскрывается чуть раньше, чем виден.
      { rootMargin: '0px 0px 15% 0px', threshold: 0.01 },
    );

    observer.observe(node);

    // Страховка: контент обязан быть виден в любом случае.
    const fallback = window.setTimeout(() => {
      show();
      observer.disconnect();
    }, 1500);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [reduced]);

  // При включённом «уменьшить движение» блок виден сразу, без наблюдателя.
  const shown = reduced || visible;
  return <div ref={ref} className={shown ? 'reveal-visible' : 'reveal'}>{children}</div>;
}
