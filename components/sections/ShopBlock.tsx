'use client';

import { Droplets } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { WhatsAppLink } from '@/components/layout/ContactLinks';
import { site } from '@/content/site';
import { flags } from '@/content/flags';
import { buildOilMessage } from '@/lib/whatsapp';
import type { Dictionary } from '@/lib/i18n';

/**
 * Масла и магазин — раздел 10.9.
 * ⚑ Блок скрыт флагом SHOW_SHOP: в отзывах клиент писал, что магазин закрыт,
 * а владелец ответил, что сервис «через дорогу» от старого адреса.
 * Пока флаг выключен, блок вообще не рендерится — пустых рамок не остаётся.
 */
export function ShopBlock({ dict }: { dict: Dictionary }) {
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

        <WhatsAppLink
          label={dict.shop.cta}
          source="shop"
          size="lg"
          className="mt-5"
          message={buildOilMessage()}
        />
      </div>
    </Section>
  );
}
