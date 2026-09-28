'use client';

import { useEffect, useState } from 'react';
import { NEUTRAL_STATUS, getOpenStatus, type OpenStatus } from '@/lib/hours';

/**
 * Живой статус «Открыто / Закрыто» — раздел 10.2.
 *  - на сервере рендерится нейтральный текст без расчёта;
 *  - на клиенте заменяется на актуальный статус по Asia/Aqtau;
 *  - место резервируется по высоте, поэтому макет не сдвигается (CLS = 0).
 */
export function LiveStatus({ className = '' }: { className?: string }) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getOpenStatus(new Date()));
    update();
    // Обновляем раз в минуту — часы меняются медленно, событие не нужно.
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const isOpen = status?.isOpen ?? true;
  const text = status ? status.label : NEUTRAL_STATUS;

  return (
    <span
      className={`inline-flex min-h-6 items-center gap-2 text-sm ${className}`}
      aria-live="polite"
    >
      {/* Точка статуса: цвет + форма, не только цвет (доступность). */}
      <span
        className={`inline-block size-2 shrink-0 rounded-full ${isOpen ? 'bg-success' : 'bg-muted'}`}
        aria-hidden
      />
      <span className={isOpen ? 'text-text-on-dark' : 'text-muted-on-dark'}>{text}</span>
    </span>
  );
}
