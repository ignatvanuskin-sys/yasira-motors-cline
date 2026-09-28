'use client';

import { Section } from '@/components/ui/Section';
import { CallLink, WhatsAppLink } from '@/components/layout/ContactLinks';
import { site } from '@/content/site';
import { buildUnknownIssueMessage } from '@/lib/whatsapp';
import type { Dictionary } from '@/lib/i18n';

/** Финальный призыв к действию — раздел 10.12. Тёмный блок, две кнопки. */
export function FinalCta({ dict }: { dict: Dictionary }) {
  return (
    <Section id="zapis" tone="dark">
      <div className="flex flex-col items-start gap-6">
        <div>
          <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance text-text-on-dark md:text-[40px]">
            {dict.finalCta.title}
          </h2>
          <p className="mt-2.5 max-w-[62ch] text-base text-muted-on-dark">{dict.finalCta.subtitle}</p>

          <p className="mt-3 text-lg font-semibold text-text-on-dark">
            <a
              href={`tel:${site.phones.primary}`}
              className="tnum inline-flex min-h-11 items-center underline decoration-accent decoration-2 underline-offset-4"
            >
              {site.phones.primaryDisplay}
            </a>
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
          <CallLink source="final_cta" label={dict.cta.call} tone="dark" size="lg" />
          <WhatsAppLink
            label={dict.cta.whatsapp}
            source="final_cta"
            tone="dark"
            size="lg"
            message={buildUnknownIssueMessage()}
          />
        </div>
      </div>
    </Section>
  );
}
