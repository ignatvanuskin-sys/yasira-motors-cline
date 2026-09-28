'use client';

import { Section } from '@/components/ui/Section';
import { Accordion } from '@/components/ui/Accordion';
import { faq } from '@/content/faq';
import type { Dictionary } from '@/lib/i18n';

/** FAQ — раздел 10.10. Аккордеон, можно открыть несколько пунктов. */
export function Faq({ dict }: { dict: Dictionary }) {
  return (
    <Section id="faq">
      <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[40px]">
        {dict.faq.title}
      </h2>
      <div className="mt-8">
        <Accordion items={faq} />
      </div>
    </Section>
  );
}
