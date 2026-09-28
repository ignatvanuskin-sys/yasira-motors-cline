'use client';

import { Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { CallLink, WhatsAppLink } from '@/components/layout/ContactLinks';
import { LiveStatus } from './LiveStatus';
import { site } from '@/content/site';
import { quickChips } from '@/content/services';
import { buildServiceMessage, whatsappLinkWithText } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n';

/**
 * Первый экран — раздел 10.2.
 * Тёмный фон, слева текст, справа карточка связи (десктоп 7/5).
 * На мобильном: H1, кнопки связи и полоса доверия видны в 100svh.
 *
 * Формы записи нет: главное действие — звонок, второе — WhatsApp.
 */
export function Hero({ dict, sideCard }: { dict: Dictionary; sideCard?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-bg-dark text-text-on-dark">
      <BlueprintPattern />

      <div className="container-site relative grid gap-8 pt-8 pb-10 md:pt-12 lg:grid-cols-12 lg:gap-10 lg:pt-14 lg:pb-16">
        <div className="lg:col-span-7">
          <p className="spec-label text-muted-on-dark">{dict.meta.eyebrow}</p>

          <h1 className="mt-3 text-[30px] leading-[1.06] font-extrabold tracking-[-0.02em] text-balance sm:text-[38px] md:text-[46px] lg:text-[60px]">
            {dict.meta.title}
          </h1>

          <p className="mt-4 max-w-[62ch] text-base text-muted-on-dark md:text-lg">
            {dict.meta.subtitle}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CallLink source="hero" label={dict.cta.call} tone="dark" size="lg" />
            <WhatsAppLink
              label={dict.cta.whatsapp}
              source="hero"
              tone="dark"
              size="lg"
            />
          </div>

          <p className="mt-3 text-sm text-muted-on-dark">
            {dict.meta.callOr}{' '}
            <a
              href={`tel:${site.phones.primary}`}
              className="tnum inline-flex min-h-11 items-center font-semibold text-text-on-dark underline decoration-accent decoration-2 underline-offset-4 hover:decoration-accent-hover"
            >
              {site.phones.primaryDisplay}
            </a>
          </p>

          {/* Полоса доверия: 3 пункта, на мобильном переносится на 2 строки. */}
          <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line-dark pt-5 text-sm">
            <li className="tnum inline-flex items-center gap-1.5 font-semibold">
              <Star className="size-4 fill-accent text-accent" strokeWidth={1.75} aria-hidden />
              {site.rating.value} · {site.rating.reviewsCount}{' '}
              <span className="font-normal text-muted-on-dark">{site.rating.source}</span>
            </li>
            <li>
              <LiveStatus />
            </li>
            <li className="text-muted-on-dark">{dict.trust.payment}</li>
          </ul>

          {/* Быстрый выбор услуги: сразу открывает WhatsApp с контекстом,
              минуя уточняющие вопросы. */}
          <div className="mt-4">
            <p className="spec-label text-muted-on-dark">{dict.hero.quickTitle}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {quickChips.map((service) => (
                <a
                  key={service.id}
                  href={whatsappLinkWithText(buildServiceMessage(service.title))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent('service_card_click', { service: service.id, source: 'hero_chip' })
                  }
                  className="inline-flex min-h-11 items-center rounded-full border border-line-dark px-4 text-sm font-medium text-text-on-dark transition-colors duration-160 hover:border-muted-on-dark hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {service.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Правая колонка: карточка связи (5/12), только на десктопе. */}
        {sideCard && (
          <div className="hidden lg:col-span-5 lg:block">
            <div className="rounded-card border border-line-dark bg-bg-dark-2 p-5">{sideCard}</div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Тонкий SVG-узор «сетка чертежа» ≤ 1 КБ — fallback фона hero,
 * пока нет реального фото цеха. Стоковые фото не используются.
 */
function BlueprintPattern() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg className="size-full" style={{ color: 'var(--color-line-dark)' }} focusable="false">
        <defs>
          <pattern id="blueprint" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint)" opacity="0.5" />
      </svg>
    </div>
  );
}
