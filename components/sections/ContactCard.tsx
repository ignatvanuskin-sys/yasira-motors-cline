'use client';

import { Clock, MapPin, Phone } from 'lucide-react';
import { CallLink, WhatsAppLink } from '@/components/layout/ContactLinks';
import { LiveStatus } from './LiveStatus';
import { site } from '@/content/site';
import { SCHEDULE_SUMMARY } from '@/lib/hours';
import { buildPriceMessage } from '@/lib/whatsapp';
import type { Dictionary } from '@/lib/i18n';

/**
 * Карточка связи в hero — раздел 10.2.
 *
 * Заменяет бывшую «быструю запись»: формы на сайте нет, поэтому карточка
 * показывает то, что реально помогает решить задачу — два способа связаться,
 * график и адрес. Администратору не нужно уточнять, когда сервис работает.
 */
export function ContactCard({ dict }: { dict: Dictionary }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="spec-label text-muted-on-dark">{dict.contactCard.eyebrow}</p>
        <h2 className="mt-1.5 text-lg font-bold text-text-on-dark">{dict.contactCard.title}</h2>
        <p className="mt-1 text-sm text-muted-on-dark">{dict.contactCard.hint}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <CallLink source="hero_card" label={dict.cta.call} tone="dark" size="lg" full />
        <WhatsAppLink
          label={dict.cta.whatsapp}
          source="hero_card"
          tone="dark"
          size="lg"
          full
          message={buildPriceMessage()}
        />
      </div>

      {/* Список сведений о сервисе. Обычный ul вместо dl: в dl допустимы только
          dt/dd-пары напрямую, а здесь каждая строка — это карточка с иконкой,
          и axe помечал такую разметку как dlitem. */}
      <ul className="grid gap-2.5 border-t border-line-dark pt-4 text-sm">
        <li className="flex items-start gap-2.5">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted-on-dark" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="tnum text-text-on-dark">{SCHEDULE_SUMMARY}</p>
            <p className="mt-0.5">
              <LiveStatus />
            </p>
          </div>
        </li>

        <li className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-on-dark" strokeWidth={1.75} aria-hidden />
          <p className="text-text-on-dark">{site.address.full}</p>
        </li>

        <li className="flex items-start gap-2.5">
          <Phone className="mt-0.5 size-4 shrink-0 text-muted-on-dark" strokeWidth={1.75} aria-hidden />
          <a
            href={`tel:${site.phones.primary}`}
            className="tnum inline-flex min-h-11 items-center text-text-on-dark underline decoration-accent decoration-2 underline-offset-4"
          >
            {site.phones.primaryDisplay}
          </a>
        </li>
      </ul>
    </div>
  );
}