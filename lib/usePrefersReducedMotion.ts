'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Подписка на системную настройку «уменьшить движение» — раздел 16.
 *
 * Сделано через useSyncExternalStore, а не через
 * `useState + useEffect + setState`: чтение медиазапроса — это внешняя
 * система, и React рекомендует подписываться на неё именно так. Побочный
 * плюс — правильное серверное значение (на сервере всегда «нет»).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(QUERY);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(QUERY).matches,
    // Сервер не знает настройки пользователя: считаем, что анимации нужны.
    () => false,
  );
}
