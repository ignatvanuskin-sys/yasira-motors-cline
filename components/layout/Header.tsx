'use client';

import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MobileMenu } from './MobileMenu';
import { Wordmark } from './Wordmark';
import { CallLink, WhatsAppLink } from './ContactLinks';
import { site } from '@/content/site';
import type { Dictionary } from '@/lib/i18n';

/**
 * Шапка — раздел 10.1.
 *
 * Sticky и ВСЕГДА на виду: шапка прячет телефон и кнопку связи, а на сайте
 * их больше нигде не продублировано на узких экранах, поэтому прятать шапку
 * при прокрутке вниз нельзя. Вместо этого при прокрутке она получает
 * нижнюю границу и тень — визуально отделяется от светлых блоков.
 *
 * Мобильный: 56px, wordmark ≤112px, кнопка звонка ≤112px, кнопка меню 44×44.
 * Расчёт на 320px: 16+112+8+112+8+44+16 = 316 ≤ 320.
 * Десктоп: навигация, телефон текстом, кнопки «Позвонить» и WhatsApp.
 */
export function Header({ dict, locale }: { dict: Dictionary; locale: 'ru' | 'kk' }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const prefix = locale === 'kk' ? '/kk' : '';

  return (
    <header
      className={[
        'sticky top-0 z-40 bg-bg-dark text-text-on-dark transition-[box-shadow,border-color] duration-200 ease-[cubic-bezier(.2,.7,.2,1)]',
        // После первых пикселей прокрутки — граница и мягкая тень, чтобы шапка
        // не сливалась со светлыми секциями под ней.
        scrolled ? 'border-b border-line-dark shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)]' : 'border-b border-transparent',
      ].join(' ')}
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
          {/* Телефон текстом и WhatsApp — только на десктопе. */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`tel:${site.phones.primary}`}
              className="tnum inline-flex min-h-11 items-center text-sm font-semibold"
            >
              {site.phones.primaryDisplay}
            </a>
            <WhatsAppLink label={dict.cta.whatsapp} source="header" tone="dark" />
          </div>

          <CallLink
            source="header"
            label={dict.cta.callShort}
            tone="dark"
            size="md"
            className="max-w-[112px] !px-3 !text-sm lg:max-w-none lg:!px-5 lg:!text-base"
          />

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
