'use client';

import { BookingFlow } from '@/components/booking/BookingFlow';
import { BookingProvider } from '@/components/booking/BookingProvider';
import type { Dictionary } from '@/lib/i18n';

/**
 * Клиентская обёртка страницы: провайдер записи + система записи.
 * Всё остальное рендерится на сервере.
 */
export function SiteShell({
  dict,
  locale,
  children,
}: {
  dict: Dictionary;
  locale: 'ru' | 'kk';
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      {children}
      <BookingFlow dict={dict} locale={locale} />
    </BookingProvider>
  );
}
