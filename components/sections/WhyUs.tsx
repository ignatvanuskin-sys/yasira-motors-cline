'use client';

import { ArrowUpRight, CarFront, MapPin, Star, Wrench } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { site } from '@/content/site';
import { trackClick } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n';

/**
 * Почему к нам возвращаются — раздел 10.4.
 * Четыре карточки с фактами, а не эпитетами.
 */
export function WhyUs({ dict }: { dict: Dictionary }) {
  const cards = [
    {
      icon: Star,
      title: `${site.rating.value} из 5 по ${site.rating.reviewsCount} оценкам`,
      text: 'Рейтинг в 2ГИС. Многие клиенты пишут, что ездят к нам по несколько лет.',
    },
    {
      icon: Wrench,
      title: 'Все виды работ рядом',
      text: 'Диагностика, ходовая, электрика, коробки и шиномонтаж. Не нужно возить машину по разным СТО.',
    },
    {
      // ⚑ Обязательство требует подтверждения владельца — используем безопасную формулировку.
      icon: CarFront,
      title: 'Скажем о проблеме заранее',
      text: site.promises.warnAboutIssues.safeText,
    },
    {
      icon: MapPin,
      title: 'Удобно добраться',
      text: `${site.parking.note}, остановка «${site.busStop.name}» в ${site.busStop.distanceMeters} метрах. Оплата ${site.paymentMethods
        .slice(0, 2)
        .join(' и ')
        .toLowerCase()}.`,
    },
  ];

  return (
    <Section id="preimushchestva">
      <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[40px]">
        {dict.why.title}
      </h2>

      <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <li
              key={card.title}
              className="rounded-card border border-line-light bg-surface p-5 transition-colors duration-160 hover:border-muted"
            >
              <Icon className="size-6 text-text" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-3 text-[18px] leading-[1.25] font-semibold md:text-[22px]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{card.text}</p>
            </li>
          );
        })}
      </ul>

      <a
        href={site.links.gisCard}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick('route', 'why_us')}
        className="mt-6 inline-flex min-h-12 items-center gap-1.5 text-sm font-semibold text-text underline decoration-accent decoration-2 underline-offset-4 hover:decoration-accent-hover"
      >
        {dict.why.allReviews}
        <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden />
      </a>
    </Section>
  );
}
