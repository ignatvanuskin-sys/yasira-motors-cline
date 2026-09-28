'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { useBooking } from './BookingProvider';
import type { Dictionary } from '@/lib/i18n';

/**
 * Лист записи — раздел 13.
 *  - мобильный: полноэкранный лист на 100dvh, блокировка фонового скролла,
 *    overscroll-behavior: contain, учёт safe-area и экранной клавиатуры;
 *  - десктоп: центрированное модальное окно;
 *  - Radix обеспечивает role="dialog", aria-modal, ловушку фокуса, Esc
 *    и возврат фокуса на триггер.
 */
export function BookingSheet({
  dict,
  children,
}: {
  dict: Dictionary;
  children: ReactNode;
}) {
  const { isOpen, close } = useBooking();

  // Блокировка фонового скролла на время открытия.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          className={
            'fixed z-50 flex flex-col bg-bg-light outline-none ' +
            // Мобильный: полноэкранный лист.
            'inset-0 h-[100dvh] w-full overscroll-contain ' +
            // Десктоп: центрированная модалка.
            'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[88dvh] sm:w-[min(560px,calc(100vw-32px))] ' +
            'sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-card sm:border sm:border-line-light'
          }
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Dialog.Title className="sr-only">{dict.booking.step1Title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {dict.booking.step1Hint}. {dict.booking.consent} {dict.booking.privacy}.
          </Dialog.Description>

          <div className="flex min-h-0 flex-1 flex-col">{children}</div>

          <Dialog.Close
            className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-btn text-muted transition-colors duration-160 hover:bg-black/5 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={dict.nav.close}
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
