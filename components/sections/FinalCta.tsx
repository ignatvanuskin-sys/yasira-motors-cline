'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { useBooking } from '@/components/booking/BookingProvider';
import { site } from '@/content/site';
import { whatsappLink } from '@/lib/whatsapp';
import { trackClick } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n';

/** Финальный призыв к действию — раздел 10.12. Тёмный блок, три кнопки. */
export function FinalCta({ dict }: { dict: Dictionary }) {
  const { open } = useBooking();

  return (
    <Section id="zapis" tone="dark">
      <div className="flex flex-col items-start gap-6">
        <div>
          <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance text-text-on-dark md:text-[40px]">
            {dict.finalCta.title}
          </h2>
          <p className="mt-2.5 text-base text-muted-on-dark">{dict.finalCta.subtitle}</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button size="lg" onClick={() => open(undefined, 'final_cta')}>
            {dict.cta.book}
          </Button>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick('whatsapp', 'final_cta')}
            className="inline-flex h-13 min-h-13 items-center justify-center gap-2 rounded-btn border border-line-dark bg-transparent px-5 text-base font-semibold text-text-on-dark transition-colors duration-160 hover:bg-white/8 active:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-12 sm:min-h-12"
          >
            <MessageCircle className="size-5 text-wa-icon-dark" strokeWidth={1.75} aria-hidden />
            {dict.cta.whatsapp}
          </a>
          <a
            href={`tel:${site.phones.primary}`}
            onClick={() => trackClick('call', 'final_cta')}
            className="inline-flex h-13 min-h-13 items-center justify-center gap-2 rounded-btn border border-line-dark bg-transparent px-5 text-base font-semibold text-text-on-dark transition-colors duration-160 hover:bg-white/8 active:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-12 sm:min-h-12"
          >
            <Phone className="size-5" strokeWidth={1.75} aria-hidden />
            {dict.cta.call}
          </a>
        </div>
      </div>
    </Section>
  );
}
