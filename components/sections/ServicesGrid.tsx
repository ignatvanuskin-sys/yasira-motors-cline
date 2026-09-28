'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { WhatsAppLink } from '@/components/layout/ContactLinks';
import { services } from '@/content/services';
import { formatPrice } from '@/content/prices';
import { buildUnknownIssueMessage } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n';

/**
 * Услуги — раздел 10.3. Порядок карточек фиксирован.
 * Мобильный: вертикальный список строк ≥64px, без двухколоночных сеток.
 * Десктоп: сетка 4×2.
 *
 * Тап по карточке ведёт на страницу услуги, а если отдельной страницы нет —
 * открывает WhatsApp с названием услуги: страница услуги — источник для SEO,
 * а переписка — источник заявки.
 */
export function ServicesGrid({ dict, locale }: { dict: Dictionary; locale: 'ru' | 'kk' }) {
  const prefix = locale === 'kk' ? '/kk' : '';

  return (
    <Section id="uslugi">
      <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[40px]">
        {dict.services.title}
      </h2>
      <p className="mt-2.5 max-w-[62ch] text-base text-muted">{dict.services.subtitle}</p>

      <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon;
          const href = service.slug
            ? `${prefix}/uslugi/${service.slug}`
            : `/uslugi/zamena-masla#ceny`;

          return (
            <li key={service.id} className="h-full">
              <Link
                href={href}
                onClick={() =>
                  trackEvent('service_card_click', { service: service.id, source: 'services' })
                }
                className="group flex h-full flex-col rounded-card border border-line-light bg-surface p-5 transition-colors duration-160 hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <div className="flex flex-1 flex-col items-start gap-3">
                  <Icon className="size-6 text-text" strokeWidth={1.75} aria-hidden />
                  <span className="spec-label tnum text-muted">
                    Услуга {String(service.index).padStart(2, '0')}
                  </span>
                  <h3 className="text-[18px] leading-[1.25] font-semibold md:text-[22px]">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted">{service.short}</p>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3 border-t border-line-light pt-3.5">
                  <span className="tnum text-sm font-semibold text-text">
                    {service.priceFrom ? `от ${formatPrice(service.priceFrom)}` : service.priceNote}
                  </span>
                  <span className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-text">
                    {dict.services.details}
                    <ChevronRight
                      className="size-4 transition-transform duration-160 group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Не нашли проблему — сразу пишут администратору. */}
      <div className="mt-4 flex flex-col gap-3 rounded-card border border-line-light bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-text">{dict.services.notFoundTitle}</p>
          <p className="mt-0.5 text-sm text-muted">{dict.services.notFoundText}</p>
        </div>
        <WhatsAppLink
          label={dict.services.notFoundAction}
          source="services"
          size="md"
          message={buildUnknownIssueMessage()}
          className="shrink-0"
        />
      </div>
    </Section>
  );
}
