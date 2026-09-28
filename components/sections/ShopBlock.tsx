'use client';

import { Droplets } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { useBooking } from '@/components/booking/BookingProvider';
import { site } from '@/content/site';
import { flags } from '@/content/flags';
import type { Dictionary } from '@/lib/i18n';

/**
 * Масла и магазин — раздел 10.9.
 * ⚑ Блок скрыт флагом SHOW_SHOP: в отзывах клиент писал, что магазин закрыт,
 * а владелец ответил, что сервис «через дорогу» от старого адреса.
 * Пока флаг выключен, блок вообще не рендерится — пустых рамок не остаётся.
 */
export function ShopBlock({ dict }: { dict: Dictionary }) {
  const { open } = useBooking();
  if (!flags.showShop) return null;

  return (
    <Section id="masla">
      <div className="rounded-card border border-line-light bg-surface p-6 md:p-8">
        <Droplets className="size-6 text-text" strokeWidth={1.75} aria-hidden />
        <h2 className="mt-3 text-[26px] leading-[1.12] font-bold tracking-[-0.02em] md:text-[32px]">
          {dict.shop.title}
        </h2>
        <p className="mt-2.5 max-w-[62ch] text-base text-muted">{site.shop.oilText}</p>

        {/* ⚑ Строка про Nexen появляется только после подтверждения дистрибуции. */}
        <p className="mt-2 text-sm text-muted">{site.shop.addressNote}</p>

        <button
          type="button"
          onClick={() => open('oil-change', 'shop')}
          className="mt-5 inline-flex h-13 min-h-13 items-center justify-center rounded-btn bg-accent px-5 text-base font-semibold text-on-accent transition-[background-color,transform] duration-160 ease-[cubic-bezier(.2,.7,.2,1)] hover:bg-accent-hover active:translate-y-px active:bg-accent-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {dict.shop.cta}
        </button>
      </div>
    </Section>
  );
}
