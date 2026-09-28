'use client';

import { ArrowUpRight, Quote, Repeat, Search, Star } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { site } from '@/content/site';
import { reviewThemes, verbatimReviews } from '@/content/reviews';
import type { Dictionary } from '@/lib/i18n';

const themeIcons = {
  speed: Search,
  diagnostics: Star,
  loyalty: Repeat,
} as const;

/**
 * Отзывы — раздел 10.8.
 * Показываем открытый источник (2ГИС) и обобщения по отзывам.
 * ⚡ Дословных отзывов нет: массив verbatimReviews пуст, и придумывать их нельзя.
 * Поэтому здесь только три карточки-обобщения.
 */
export function Reviews({ dict }: { dict: Dictionary }) {
  return (
    <Section id="otzyvy">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[40px]">
            {dict.reviews.title}
          </h2>
          <p className="mt-2.5 text-base text-muted">{dict.reviews.subtitle}</p>
        </div>
        <a
          href={site.links.gisCard}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 shrink-0 items-center gap-1.5 text-sm font-semibold text-text underline decoration-accent decoration-2 underline-offset-4 hover:decoration-accent-hover"
        >
          {dict.reviews.all}
          <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden />
        </a>
      </div>

      <ul className="mt-8 grid gap-3 md:grid-cols-3">
        {reviewThemes.map((theme) => {
          const Icon = themeIcons[theme.icon];
          return (
            <li
              key={theme.title}
              className="rounded-card border border-line-light bg-surface p-5 transition-colors duration-160 hover:border-muted"
            >
              <Icon className="size-6 text-text" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-3 text-[18px] leading-[1.25] font-semibold md:text-[22px]">
                {theme.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{theme.text}</p>
            </li>
          );
        })}
      </ul>

      {/* Дословные отзывы появятся здесь только после отбора владельцем. */}
      {verbatimReviews.length > 0 ? (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {verbatimReviews.map((review) => (
            <li key={review.id} className="rounded-card border border-line-light bg-surface p-5">
              <Quote className="size-5 text-muted" strokeWidth={1.75} aria-hidden />
              <p className="mt-2.5 text-base text-text">{review.text}</p>
              <p className="mt-3 text-sm text-muted">
                {review.author} · {review.date} · {review.source}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="tnum inline-flex items-center gap-1.5 text-sm font-semibold text-text">
          <Star className="size-4 fill-accent text-accent" strokeWidth={1.75} aria-hidden />
          {site.rating.value} · {site.rating.reviewsCount} оценок · {site.rating.source}
        </span>
        <a
          href={site.links.gisCard}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-1.5 text-sm font-semibold text-text underline decoration-accent decoration-2 underline-offset-4 hover:decoration-accent-hover"
        >
          {dict.reviews.leave}
        </a>
      </div>
    </Section>
  );
}
