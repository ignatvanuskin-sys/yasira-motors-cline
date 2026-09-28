import Link from 'next/link';
import { Wordmark } from './Wordmark';
import { WhatsAppLink } from './ContactLinks';
import { site } from '@/content/site';
import { SCHEDULE_SUMMARY } from '@/lib/hours';
import { flags } from '@/content/flags';
import type { Dictionary } from '@/lib/i18n';

/**
 * Футер — раздел 10.13.
 * ⚑ Реквизиты юрлица и ссылка «Часть группы Yasira» появятся только
 * после подтверждения владельца (флаги в content/site.ts и content/flags.ts).
 */
export function Footer({ dict, locale }: { dict: Dictionary; locale: 'ru' | 'kk' }) {
  const prefix = locale === 'kk' ? '/kk' : '';
  const year = new Date().getFullYear();

  const links = [
    { label: dict.nav.services, href: `${prefix}/#uslugi` },
    { label: dict.nav.prices, href: `${prefix}/#ceny` },
    { label: dict.nav.reviews, href: `${prefix}/#otzyvy` },
    { label: dict.nav.contacts, href: `${prefix}/#kontakty` },
  ];

  return (
    <footer className="border-t border-line-dark bg-bg-dark text-text-on-dark">
      <div className="container-site grid gap-8 py-12 md:grid-cols-3">
        <div>
          <Wordmark className="w-[120px]" />
          <address className="mt-4 text-sm text-muted-on-dark not-italic">
            <p>{site.address.full}</p>
            <p className="mt-1">{SCHEDULE_SUMMARY}</p>
          </address>
        </div>

        <nav aria-label="Разделы сайта">
          <h2 className="spec-label text-muted-on-dark">Разделы</h2>
          <ul className="mt-3 grid gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 min-w-11 items-center text-sm text-text-on-dark hover:text-muted-on-dark"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href={`${prefix}/privacy`}
                className="inline-flex min-h-11 min-w-11 items-center text-sm text-text-on-dark hover:text-muted-on-dark"
              >
                {dict.footer.privacy}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="spec-label text-muted-on-dark">{dict.contacts.phones}</h2>
          <ul className="mt-3 grid gap-1">
            <li>
              <a
                href={`tel:${site.phones.primary}`}
                className="tnum inline-flex min-h-11 min-w-11 items-center text-sm text-text-on-dark"
              >
                {site.phones.primaryDisplay}
              </a>
            </li>
            {site.phones.extra.map((phone) => (
              <li key={phone.number}>
                <a
                  href={`tel:${phone.number}`}
                  className="tnum inline-flex min-h-11 min-w-11 items-center text-sm text-muted-on-dark"
                >
                  {phone.display}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-11 min-w-11 items-center text-sm text-text-on-dark"
              >
                {site.email}
              </a>
            </li>
          </ul>

          <div className="mt-4 flex items-center gap-2">
            <WhatsAppLink label="WhatsApp" source="footer" tone="dark" iconOnly />
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex size-11 items-center justify-center rounded-btn text-sm text-text-on-dark transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {site.social.instagramHandle}
            </a>
            <a
              href={site.links.gisCard}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 min-w-11 items-center px-2 text-sm text-text-on-dark hover:text-muted-on-dark"
            >
              2ГИС
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line-dark">
        <div className="container-site flex flex-col gap-3 py-5 text-sm text-muted-on-dark sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. {dict.footer.rights}.
          </p>

          <div className="flex items-center gap-4">
            {/* Переключатель языка — только при включённой казахской версии. */}
            {flags.showLangSwitcher ? (
              <nav aria-label="Язык сайта" className="flex items-center gap-1">
                <Link
                  href="/"
                  hrefLang="ru"
                  aria-current={locale === 'ru' ? 'true' : undefined}
                  className="inline-flex min-h-11 min-w-11 items-center px-2 text-text-on-dark underline decoration-accent decoration-2 underline-offset-4"
                >
                  RU
                </Link>
                <Link
                  href="/kk"
                  hrefLang="kk"
                  aria-current={locale === 'kk' ? 'true' : undefined}
                  className="inline-flex min-h-11 min-w-11 items-center px-2 text-text-on-dark underline decoration-accent decoration-2 underline-offset-4"
                >
                  KK
                </Link>
              </nav>
            ) : null}

            {/* ⚑ Ссылка на группу — только после подтверждения владельца. */}
            {site.group.show ? (
              <a
                href={site.group.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 min-w-11 items-center underline decoration-accent decoration-2 underline-offset-4"
              >
                Часть группы {site.group.name}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
