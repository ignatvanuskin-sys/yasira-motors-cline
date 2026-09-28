'use client';

import { Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { useState } from 'react';
import { Section } from '@/components/ui/Section';
import { LiveStatus } from './LiveStatus';
import { InstagramIcon } from '@/components/ui/Icons';
import { site, DATA_UPDATED_AT } from '@/content/site';
import { SCHEDULE_SUMMARY } from '@/lib/hours';
import { whatsappLink } from '@/lib/whatsapp';
import { trackClick } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n';

/**
 * Контакты — раздел 10.11.
 * Плитки связи, адрес с живым статусом, три кнопки маршрута.
 * Карта грузится лениво: iframe подключается только по нажатию.
 */
export function Contacts({ dict }: { dict: Dictionary }) {
  const [mapOpen, setMapOpen] = useState(false);

  const tiles = [
    {
      icon: Phone,
      label: dict.cta.call,
      href: `tel:${site.phones.primary}`,
      onClick: () => trackClick('call', 'contacts'),
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      href: whatsappLink(),
      onClick: () => trackClick('whatsapp', 'contacts'),
      external: true,
    },
    { icon: InstagramIcon, label: 'Instagram', href: site.social.instagram, external: true },
  ];

  const routes = [
    { label: dict.contacts.gis, href: site.links.gisDirections },
    { label: dict.contacts.google, href: site.links.googleDirections },
    { label: dict.contacts.yandex, href: site.links.yandex },
  ];

  return (
    <Section id="kontakty">
      <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[40px]">
        {dict.contacts.title}
      </h2>


      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ul className="grid grid-cols-3 gap-3 lg:col-span-2">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <li key={tile.label}>
                <a
                  href={tile.href}
                  onClick={tile.onClick}
                  {...(tile.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-card border border-line-light bg-surface px-2 py-4 text-center transition-colors duration-160 hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Icon className="size-5 text-text" strokeWidth={1.75} aria-hidden />
                  <span className="text-sm font-semibold text-text">{tile.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <address className="not-italic">
          <h3 className="spec-label text-muted">{dict.contacts.address}</h3>
          <p className="mt-2 flex items-start gap-2 text-base text-text">
            <MapPin className="mt-0.5 size-5 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
            <span>
              {site.address.full}
              <br />
              {site.address.floorNote}
            </span>
          </p>

          <h3 className="spec-label mt-5 text-muted">{dict.contacts.hours}</h3>
          <p className="mt-2 text-base text-text">{SCHEDULE_SUMMARY}</p>
          <p className="mt-1">
            <LiveStatus className="[&_span:last-child]:!text-text" />
          </p>

          <h3 className="spec-label mt-5 text-muted">{dict.contacts.phones}</h3>
          <ul className="mt-2 grid gap-1">
            <li>
              <a
                href={`tel:${site.phones.primary}`}
                onClick={() => trackClick('call', 'contacts_list')}
                className="tnum inline-flex min-h-11 min-w-11 items-center text-base font-semibold text-text underline decoration-accent decoration-2 underline-offset-4"
              >
                {site.phones.primaryDisplay}
              </a>
            </li>
            {site.phones.extra.map((phone) => (
              <li key={phone.number}>
                <a
                  href={`tel:${phone.number}`}
                  className="tnum inline-flex min-h-11 min-w-11 items-center text-sm text-muted underline decoration-accent decoration-2 underline-offset-4 hover:text-text"
                >
                  {phone.display}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-sm text-muted">{dict.contacts.otherPhones}</p>

          <h3 className="spec-label mt-5 text-muted">{dict.contacts.email}</h3>
          <p className="mt-2 flex items-center gap-2 text-base">
            <Mail className="size-5 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-11 min-w-11 items-center text-text underline decoration-accent decoration-2 underline-offset-4"
            >
              {site.email}
            </a>
          </p>
        </address>

        <div>
          <h3 className="spec-label text-muted">{dict.contacts.findUs}</h3>
          <p className="mt-2 text-base text-text">
            {site.address.street}, дом 52/2, 1 этаж. Остановка «{site.busStop.name}» в{' '}
            {site.busStop.distanceMeters} м, {site.parking.count} парковки.
          </p>

          <ul className="mt-4 grid gap-2">
            {routes.map((route) => (
              <li key={route.label}>
                <a
                  href={route.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick('route', 'contacts')}
                  className="inline-flex min-h-12 w-full items-center gap-2 rounded-btn border border-line-light bg-transparent px-4 text-sm font-semibold text-text transition-colors duration-160 hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Navigation className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {route.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Ленивая карта: iframe подключается только по нажатию (раздел 22). */}
          <div className="mt-4">
            {mapOpen ? (
              <iframe
                src="https://yandex.kz/maps/embed/24185658536/?ll=51.184709%2C43.654702&z=17"
                title={`${site.name} на карте`}
                loading="lazy"
                className="h-64 w-full rounded-card border border-line-light"
              />
            ) : (
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-btn border border-line-light bg-transparent px-4 text-sm font-semibold text-text transition-colors duration-160 hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <MapPin className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                {dict.contacts.showMap}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted">Данные актуальны на {DATA_UPDATED_AT}.</p>
    </Section>
  );
}
