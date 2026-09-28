import { site } from '@/content/site';
import { schedule } from '@/lib/hours';
import { getSiteUrl } from '@/lib/siteUrl';

const SITE_URL = getSiteUrl();

/**
 * Микроразметка AutoRepair — раздел 18.
 * ⚠️ aggregateRating и отзывы в разметку НЕ добавляются: для собственного бизнеса
 * рейтинги в разметке не дают выигрыша и могут нарушать правила поисковиков.
 * Рейтинг показывается визуально, но не в schema.org.
 */
export function JsonLd() {
  const openingHours = Object.entries(schedule)
    .filter(([, range]) => range !== null)
    .map(([day, range]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${DAY_NAMES[Number(day)]}`,
      opens: (range as { from: string }).from,
      closes: (range as { to: string }).to,
    }));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: site.name,
    url: SITE_URL,
    telephone: site.phones.primary,
    email: site.email,
    image: `${SITE_URL}/opengraph-image`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: site.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lon,
    },
    openingHoursSpecification: openingHours,
    currenciesAccepted: 'KZT',
    paymentAccepted: 'Кредитная карта, Наличные, Банковский перевод',
    sameAs: [site.social.instagram, site.links.gisCard, site.links.yandex],
  };

  return (
    <script
      type="application/ld+json"
      // Данные формируются на сервере из констант проекта, пользовательского ввода нет.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const DAY_NAMES: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

/** BreadcrumbList для страниц услуг. */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
