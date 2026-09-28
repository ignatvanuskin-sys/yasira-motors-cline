import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { WhatsAppLink, CallLink } from './ContactLinks';
import { site } from '@/content/site';
import { SCHEDULE_SUMMARY } from '@/lib/hours';
import type { Dictionary } from '@/lib/i18n';

/**
 * Мобильное меню — раздел 10.1.
 * Полноэкранный лист (100dvh): две крупные кнопки связи сверху, ниже пункты
 * разделов, внизу адрес и часы. Закрытие: крестик, Esc, тап по пункту.
 * Radix обеспечивает role="dialog", aria-modal и блокировку фокуса;
 * фокус возвращается на кнопку меню.
 */
export function MobileMenu({
  dict,
  locale,
  open,
  onOpenChange,
}: {
  dict: Dictionary;
  locale: 'ru' | 'kk';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const prefix = locale === 'kk' ? '/kk' : '';

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const items = [
    { label: dict.nav.services, href: `${prefix}/#uslugi` },
    { label: dict.nav.prices, href: `${prefix}/#ceny` },
    { label: dict.nav.reviews, href: `${prefix}/#otzyvy` },
    { label: dict.nav.contacts, href: `${prefix}/#kontakty` },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 lg:hidden" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col bg-bg-dark text-text-on-dark outline-none lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Dialog.Title className="sr-only">{dict.nav.menu}</Dialog.Title>

          <div className="flex items-center justify-between border-b border-line-dark px-4 py-3">
            <p className="spec-label text-muted-on-dark">{site.address.full}</p>
            <Dialog.Close
              ref={triggerRef}
              className="flex size-11 shrink-0 items-center justify-center rounded-btn text-text-on-dark transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label={dict.nav.close}
            >
              <X className="size-6" strokeWidth={1.75} aria-hidden />
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {/* Два главных действия сразу наверху — это вся конверсия сайта. */}
            <CallLink
              source="menu"
              label={dict.cta.call}
              tone="dark"
              size="lg"
              full
              className="!text-base"
            />
            <WhatsAppLink
              label={dict.cta.whatsapp}
              source="menu"
              tone="dark"
              size="lg"
              full
              className="!text-base"
            />

            <nav aria-label="Разделы сайта" className="mt-2">
              <ul className="grid gap-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className="inline-flex min-h-14 w-full items-center rounded-btn px-3 text-lg font-semibold text-text-on-dark transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <address className="mt-auto pt-6 text-sm text-muted-on-dark not-italic">
              <p className="tnum">{site.address.full}</p>
              <p className="mt-1">{SCHEDULE_SUMMARY}</p>
            </address>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
