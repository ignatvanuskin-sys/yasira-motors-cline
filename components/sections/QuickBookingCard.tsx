'use client';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { useBooking } from '@/components/booking/BookingProvider';
import { allBookingOptions } from '@/content/services';
import { whatsappLink } from '@/lib/whatsapp';
import { trackClick } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n';

/**
 * Быстрая запись в hero — раздел 10.2.
 * Шаг 1 встроен в страницу (без модального окна): выбор услуги и переход
 * в полный мастер записи с предвыбранным пунктом.
 */
export function QuickBookingCard({ dict }: { dict: Dictionary }) {
  const { open } = useBooking();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="spec-label text-muted-on-dark">Быстрая запись</p>
        <h2 className="mt-1.5 text-lg font-bold text-text-on-dark">{dict.booking.step1Title}</h2>
        <p className="mt-1 text-sm text-muted-on-dark">{dict.booking.step1Hint}</p>
      </div>

      <div role="group" aria-label={dict.booking.step1Title} className="flex flex-wrap gap-2">
        {allBookingOptions.slice(0, 6).map((service) => (
          <Chip
            key={service.id}
            tone="dark"
            onClick={() => open(service.id, 'hero_card')}
          >
            {service.title}
          </Chip>
        ))}
      </div>

      <Button size="lg" full onClick={() => open(undefined, 'hero_card')}>
        {dict.cta.book}
      </Button>

      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick('whatsapp', 'hero_card')}
        className="inline-flex h-12 min-h-12 items-center justify-center rounded-btn border border-line-dark px-4 text-sm font-semibold text-text-on-dark transition-colors duration-160 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {dict.cta.whatsapp}
      </a>
    </div>
  );
}
