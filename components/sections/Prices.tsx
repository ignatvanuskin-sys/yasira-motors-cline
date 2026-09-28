'use client';

import { Section } from '@/components/ui/Section';
import { CallLink, WhatsAppLink } from '@/components/layout/ContactLinks';
import { priceRows, prices, formatPrice } from '@/content/prices';
import { buildPriceMessage } from '@/lib/whatsapp';
import type { Dictionary } from '@/lib/i18n';

/**
 * Цены — раздел 10.5.
 * ⚑ Прайса от владельца нет: массив priceRows пуст, поэтому вместо выдуманных
 * цифр показывается безопасный fallback с двумя кнопками.
 * На мобильном таблица превращается в стек строк, без горизонтального скролла.
 */
export function Prices({ dict }: { dict: Dictionary }) {
  return (
    <Section id="ceny">
      <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[40px]">
        {dict.prices.title}
      </h2>
      {/* ⚑ Фраза «согласуем цену до начала работ» не подтверждена и в подзаголовок
          не включена. Безопасная формулировка: «Точную сумму называем после осмотра». */}
      <p className="mt-2.5 max-w-[62ch] text-base text-muted">{dict.prices.subtitle}</p>

      {prices.hasPrices ? <PriceTable /> : <PriceFallback dict={dict} />}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <CallLink source="prices" label={dict.cta.call} size="lg" />
        <WhatsAppLink
          label={dict.prices.ask}
          source="prices"
          size="lg"
          message={buildPriceMessage()}
        />
      </div>
    </Section>
  );
}

/** Таблица цен (рендерится, только когда прайс заполнен владельцем). */
function PriceTable() {
  return (
    <>
      <div className="mt-8 overflow-hidden rounded-card border border-line-light bg-surface">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Ориентировочные цены на услуги автосервиса</caption>
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-line-light">
              <th scope="col" className="px-5 py-3 text-sm font-semibold text-muted">
                Услуга
              </th>
              <th scope="col" className="tnum px-5 py-3 text-sm font-semibold text-muted">
                Цена от
              </th>
              <th scope="col" className="px-5 py-3 text-sm font-semibold text-muted">
                Что входит
              </th>
            </tr>
          </thead>
          <tbody>
            {priceRows.map((row) => (
              <tr key={row.serviceId} className="border-b border-line-light last:border-0">
                <th scope="row" className="px-5 py-3.5 font-semibold md:table-cell">
                  <span className="tnum block text-sm font-semibold text-muted md:hidden">
                    {formatPrice(row.priceFrom)}
                  </span>
                  {row.title}
                  <span className="mt-0.5 block text-sm font-normal text-muted md:hidden">
                    {row.includes}
                  </span>
                </th>
                <td className="tnum hidden px-5 py-3.5 font-semibold md:table-cell">
                  {formatPrice(row.priceFrom)}
                </td>
                <td className="hidden px-5 py-3.5 text-sm text-muted md:table-cell">
                  {row.includes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-muted">{prices.sourceLabel}</p>
    </>
  );
}

/** Fallback: цен нет — предлагаем быстрый расчёт вместо выдуманных цифр. */
function PriceFallback({ dict }: { dict: Dictionary }) {
  return (
    <div className="mt-8 rounded-card border border-line-light bg-surface p-5 md:p-6">
      <h3 className="text-[18px] font-semibold md:text-[22px]">{dict.prices.fallbackTitle}</h3>
      <p className="mt-2 text-base text-muted">{dict.prices.fallbackText}</p>
    </div>
  );
}
