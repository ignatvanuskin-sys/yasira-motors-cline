'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { useBooking } from '@/components/booking/BookingProvider';
import { services, unknownIssueService } from '@/content/services';
import { formatPrice } from '@/content/prices';
import { trackEvent } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n';

/**
 * Услуги — раздел 10.3. Порядок карточек фиксирован.
 * Мобильный: вертикальный список строк ≥64px, без двухколоночных сеток.
 * Десктоп: сетка 4×2. Карточки 1–6 ведут на страницы услуг по ссылке
 * «Подробнее», основная зона тапа открывает запись.
 */
export function ServicesGrid({ dict, locale }: { dict: Dictionary; locale: 'ru' | 'kk' }) {
  const { open } = useBooking();

  return (
    <Section id="uslugi">
      <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[40px]">
        {dict.services.title}
      </h2>
      <p className="mt-2.5 max-w-[62ch] text-base text-muted">{dict.services.subtitle}</p>

      <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <li key={service.id} className="h-full">
              <article className="group flex h-full flex-col rounded-card border border-line-light bg-surface transition-colors duration-160 hover:border-muted focus-within:border-muted">
                {/* Основная зона карточки открывает запись с выбранной услугой. */}
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('service_card_click', { service: service.id, source: 'services' });
                    open(service.id, 'services');
                  }}
                  className="flex flex-1 flex-col items-start gap-3 rounded-t-card p-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  <Icon className="size-6 text-text" strokeWidth={1.75} aria-hidden />
                  <span className="spec-label text-muted tnum">
                    Услуга {String(service.index).padStart(2, '0')}
                  </span>
                  <h3 className="text-[18px] leading-[1.25] font-semibold md:text-[22px]">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted">{service.short}</p>
                </button>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-line-light px-5 py-3.5">
                  <span className="tnum text-sm font-semibold text-text">
                    {service.priceFrom ? `от ${formatPrice(service.priceFrom)}` : service.priceNote}
                  </span>
                  {service.slug ? (
                    <Link
                      href={`/${locale === 'kk' ? 'kk' : ''}/uslugi/${service.slug}`}
                      className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-text underline decoration-accent decoration-2 underline-offset-4 hover:decoration-accent-hover"
                    >
                      {dict.services.details}
                      <ChevronRight
                        className="size-4 transition-transform duration-160 group-hover:translate-x-0.5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </Link>
                  ) : (
                    <ChevronRight className="size-4 text-muted" strokeWidth={1.75} aria-hidden />
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {/* Не нашли проблему — открывает запись с эксклюзивным пунктом. */}
      <div className="mt-4 flex flex-col gap-3 rounded-card border border-line-light bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-text">{dict.services.notFoundTitle}</p>
          <p className="mt-0.5 text-sm text-muted">{dict.services.notFoundText}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            trackEvent('service_card_click', { service: unknownIssueService.id, source: 'services' });
            open(unknownIssueService.id, 'services');
          }}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-btn border border-line-light px-5 text-sm font-semibold text-text transition-colors duration-160 hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {dict.services.notFoundAction}
        </button>
      </div>
    </Section>
  );
}
