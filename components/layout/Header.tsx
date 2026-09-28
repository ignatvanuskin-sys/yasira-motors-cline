'use client';

import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MobileMenu } from './MobileMenu';
import { useBooking } from '@/components/booking/BookingProvider';
import { Wordmark } from './Wordmark';
import { WhatsAppLink } from './ContactLinks';
import { site } from '@/content/site';
import type { Dictionary } from '@/lib/i18n';

/**
 * Шапка — раздел 10.1.
 * Sticky, при прокрутке вниз скрывается (200 мс), при прокрутке вверх появляется.
 * Мобильный: 56px, wordmark ≤112px, янтарная кнопка «Записаться» ≤108px,
 * кнопка меню 44×44. Расчёт на 320px: 16+112+8+108+8+44+16 = 312 ≤ 320.
 * Десктоп: навигация, телефон текстом, иконка WhatsApp, кнопка записи.
 */
export function Header({ dict, locale }: { dict: Dictionary; locale: 'ru' | 'kk' }) {
  const { open } = useBooking();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        // Скрываем только при явной прокрутке вниз и за пределами первых 100px.
        setHidden(y > lastY && y > 100);
        setLastY(y);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY]);

  const prefix = locale === 'kk' ? '/kk' : '';

  return (
    <header
      className={
        'sticky top-0 z-40 bg-bg-dark text-text-on-dark transition-transform duration-200 ease-[cubic-bezier(.2,.7,.2,1)] ' +
        (hidden ? '-translate-y-full' : 'translate-y-0')
      }
    >
      <div className="container-site flex h-14 items-center gap-2 lg:h-16">
        <a
          href={`${prefix}/`}
          className="inline-flex min-h-11 shrink-0 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={site.name}
        >
          <Wordmark className="w-[104px] lg:w-[128px]" />
        </a>

        {/* Десктопная навигация. */}
        <nav aria-label="Основная навигация" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-6 text-sm font-medium">
            <li>
              <a href={`${prefix}/#uslugi`} className="inline-flex min-h-11 items-center hover:text-muted-on-dark">
                {dict.nav.services}
              </a>
            </li>
            <li>
              <a href={`${prefix}/#ceny`} className="inline-flex min-h-11 items-center hover:text-muted-on-dark">
                {dict.nav.prices}
              </a>
            </li>
            <li>
              <a href={`${prefix}/#otzyvy`} className="inline-flex min-h-11 items-center hover:text-muted-on-dark">
                {dict.nav.reviews}
              </a>
            </li>
            <li>
              <a href={`${prefix}/#kontakty`} className="inline-flex min-h-11 items-center hover:text-muted-on-dark">
                {dict.nav.contacts}
              </a>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          {/* Телефон и WhatsApp — только на десктопе.
              Контейнер скрыт на мобильном, чтобы не конфликтовать
              с базовым display у ссылок ниже. */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`tel:${site.phones.primary}`}
              className="tnum inline-flex min-h-11 items-center text-sm font-semibold"
            >
              {site.phones.primaryDisplay}
            </a>
            <WhatsAppLink label={dict.cta.whatsapp} source="header" tone="dark" />
          </div>


          <button
            type="button"
            onClick={() => open(undefined, 'header')}
            className="inline-flex h-11 max-w-[108px] items-center justify-center rounded-btn bg-accent px-3 text-sm font-semibold text-on-accent transition-[background-color,transform] duration-160 ease-[cubic-bezier(.2,.7,.2,1)] hover:bg-accent-hover active:translate-y-px active:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:h-12 lg:max-w-none lg:px-5 lg:text-base"
          >
            <span className="truncate">{dict.cta.bookShort}</span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={dict.nav.menu}
            aria-expanded={menuOpen}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-btn text-text-on-dark transition-colors duration-160 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
          >
            <Menu className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <MobileMenu dict={dict} locale={locale} open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}
