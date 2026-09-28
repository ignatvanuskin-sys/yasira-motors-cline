'use client';

import { ShieldCheck, Star, Wrench } from 'lucide-react';
import { CallLink, WhatsAppLink } from '@/components/layout/ContactLinks';
import { LiveStatus } from './LiveStatus';
import { site } from '@/content/site';
import { quickChips } from '@/content/services';
import { buildServiceMessage, whatsappLinkWithText } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n';

/**
 * Первый экран — раздел 10.2.
 *
 * Задача экрана — за несколько секунд ответить на три вопроса клиента:
 * кто вы, где находитесь и как записаться. Компоновка на всю ширину:
 * правая панель убрана по решению владельца, поэтому контент идёт
 * одним потоком: адрес → крупный заголовок → два действия связи →
 * телефон → доверие → быстрый выбор услуги.
 *
 * Формы записи нет: главное действие — звонок, второе — WhatsApp.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative isolate overflow-hidden bg-bg-dark text-text-on-dark">
      <HeroBackdrop />

      <div className="container-site relative max-w-[880px] pt-10 pb-12 md:pt-14 md:pb-16 lg:pt-20 lg:pb-24">
          {/* Адрес вынесен в плашку — сразу отвечает на вопрос «где находитесь». */}
          <p className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line-dark bg-white/4 px-3.5 text-[13px] text-muted-on-dark">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            {dict.meta.eyebrow}
          </p>

          <h1 className="mt-5 text-[32px] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-[42px] md:text-[52px] lg:text-[64px]">
            {dict.meta.title}
          </h1>

          <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-muted-on-dark md:text-lg">
            {dict.meta.subtitle}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CallLink source="hero" label={dict.cta.call} tone="dark" size="lg" />
            <WhatsAppLink label={dict.cta.whatsapp} source="hero" tone="dark" size="lg" />
          </div>

          <p className="mt-4 text-sm text-muted-on-dark">
            {dict.meta.callOr}{' '}
            <a
              href={`tel:${site.phones.primary}`}
              className="tnum inline-flex min-h-11 items-center font-semibold text-text-on-dark underline decoration-accent decoration-2 underline-offset-4 hover:decoration-accent-hover"
            >
              {site.phones.primaryDisplay}
            </a>
          </p>

          {/* Полоса доверия: три пункта в одинаковых карточках. */}
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-3">
            <li className="flex items-center gap-2.5 rounded-btn border border-line-dark bg-white/4 px-3.5 py-3 text-sm">
              <Star
                className="size-4 shrink-0 fill-accent text-accent"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="tnum font-semibold">
                {site.rating.value} · {site.rating.reviewsCount}{' '}
                <span className="font-normal text-muted-on-dark">{site.rating.source}</span>
              </span>
            </li>
            <li className="flex items-center gap-2.5 rounded-btn border border-line-dark bg-white/4 px-3.5 py-3 text-sm">
              <ShieldCheck className="size-4 shrink-0 text-accent" strokeWidth={1.75} aria-hidden />
              <LiveStatus />
            </li>
            <li className="flex items-center gap-2.5 rounded-btn border border-line-dark bg-white/4 px-3.5 py-3 text-sm text-muted-on-dark">
              <Wrench className="size-4 shrink-0 text-accent" strokeWidth={1.75} aria-hidden />
              {dict.trust.payment}
            </li>
          </ul>

          {/* Быстрый выбор услуги: сразу открывает WhatsApp с контекстом,
              минуя уточняющие вопросы. */}
          <div className="mt-7">
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
                  className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-line-dark px-4 text-sm font-medium text-text-on-dark transition-colors duration-160 hover:border-accent hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {service.title}
                  <span
                    className="text-muted-on-dark transition-transform duration-160 group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden
                  >
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>
      </div>

      {/* Плавный переход тёмного экрана в светлое тело страницы. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-bg-light"
      />
    </section>
  );
}

/**
 * Фон первого экрана: янтарное свечение + сетка «чертежа» ≤ 1 КБ.
 * Стоковые фото не используются — вместо них свет и фактура, чтобы фон
 * не спорил с текстом и не выглядел как шаблонная картинка.
 */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Свечение слева сверху — фокус взгляда на заголовке. */}
      <div className="absolute -top-32 -left-24 size-[520px] rounded-full bg-accent/12 blur-[120px]" />
      {/* Холодное свечение справа снизу — отделяет карточку от фона. */}
      <div className="absolute -right-16 bottom-0 size-[420px] rounded-full bg-white/5 blur-[100px]" />
      <svg className="size-full" style={{ color: 'var(--color-line-dark)' }} focusable="false">
        <defs>
          <pattern id="blueprint" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          {/* Узор гаснет к низу экрана, чтобы не конкурировать с контентом. */}
          <linearGradient id="blueprint-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="white" stopOpacity="0.12" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="blueprint-mask">
            <rect width="100%" height="100%" fill="url(#blueprint-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint)" mask="url(#blueprint-mask)" />
      </svg>
    </div>
  );
}
