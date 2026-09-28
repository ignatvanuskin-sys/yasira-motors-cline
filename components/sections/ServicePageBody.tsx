'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';
import { CallLink, WhatsAppLink } from '@/components/layout/ContactLinks';
import { getPriceForService, formatPrice } from '@/content/prices';
import { buildServiceMessage } from '@/lib/whatsapp';
import type { Dictionary } from '@/lib/i18n';
import type { ServicePageContent } from '@/content/servicePages';
import type { ServiceView, OtherService } from './serviceView';
/** Маркер списка: янтарная точка + текст. */
function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-base text-text">
      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
      {children}
    </li>
  );
}

/**
 * Тело страницы услуги — раздел 11.
 * H1 → абзац → «Когда стоит приехать» → «Что мы делаем» → «Цена» →
 * мини-FAQ → CTA → «Другие услуги».
 */
export function ServicePageBody({
  dict,
  service,
  content,
  otherServices,
}: {
  dict: Dictionary;
  service: ServiceView;
  content: ServicePageContent;
  otherServices: OtherService[];
}) {
  const price = getPriceForService(service.id);

  return (
    <>
      <section className="bg-bg-dark pt-10 pb-12 text-text-on-dark md:pt-14 md:pb-16">
        <div className="container-site">
          <p className="spec-label text-muted-on-dark">
            Услуга {String(service.index).padStart(2, '0')} · {service.title}
          </p>
          <h1 className="mt-3 text-[30px] leading-[1.06] font-extrabold tracking-[-0.02em] text-balance sm:text-[38px] md:text-[46px]">
            {service.title} в Актау
          </h1>
          <p className="mt-4 max-w-[62ch] text-base text-muted-on-dark md:text-lg">
            {content.intro}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <CallLink source="service_page" label={dict.cta.call} tone="dark" size="lg" />
            <WhatsAppLink
              label={dict.cta.whatsapp}
              source="service_page"
              tone="dark"
              size="lg"
              message={buildServiceMessage(service.title)}
            />
          </div>
        </div>
      </section>

      <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-12">
        <div className="grid gap-10 lg:col-span-8">
          <section>
            <h2 className="text-[26px] font-bold tracking-[-0.02em] md:text-[32px]">
              Когда стоит приехать
            </h2>
            <ul className="mt-4 grid gap-2">
              {content.symptoms.map((symptom) => (
                <Item key={symptom}>{symptom}</Item>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-[26px] font-bold tracking-[-0.02em] md:text-[32px]">
              Что мы делаем
            </h2>
            <ul className="mt-4 grid gap-2">
              {content.whatWeDo.map((item) => (
                <Item key={item}>{item}</Item>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-[26px] font-bold tracking-[-0.02em] md:text-[32px]">Цена</h2>
            <p className="mt-3 text-base text-muted">
              {price
                ? `от ${formatPrice(price.priceFrom)}. ${price.includes}`
                : 'Итоговая цена зависит от автомобиля и запчастей. Точную сумму называем после осмотра.'}
            </p>
          </section>

          <section>
            <h2 className="text-[26px] font-bold tracking-[-0.02em] md:text-[32px]">
              Частые вопросы
            </h2>
            <div className="mt-4">
              <Accordion items={content.faq.map((item, index) => ({ id: `faq-${index}`, ...item }))} />
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-card border border-line-light bg-surface p-5 lg:sticky lg:top-20">
            <p className="spec-label text-muted">{dict.contacts.phones}</p>
            <p className="mt-2 text-base font-semibold text-text">{service.title}</p>
            <p className="mt-1 text-sm text-muted">{service.short}</p>
            <div className="mt-4 flex flex-col gap-2.5">
              <CallLink
                source="service_page_aside"
                label={dict.cta.call}
                tone="dark"
                size="lg"
                full
              />
              <WhatsAppLink
                label={dict.cta.whatsapp}
                source="service_page_aside"
                size="lg"
                full
                message={buildServiceMessage(service.title)}
              />
            </div>
          </div>
        </aside>
      </div>

      <section className="border-t border-line-light bg-bg-light py-12">
        <div className="container-site">
          <h2 className="text-[26px] font-bold tracking-[-0.02em] md:text-[32px]">
            Другие услуги
          </h2>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {otherServices.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/uslugi/${item.slug}`}
                  className="group flex min-h-14 items-center justify-between gap-3 rounded-card border border-line-light bg-surface px-4 py-3 transition-colors duration-160 hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="font-medium text-text">{item.title}</span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted transition-transform duration-160 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
