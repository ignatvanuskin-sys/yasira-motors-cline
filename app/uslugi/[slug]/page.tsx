import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';
import { SiteShell } from '@/components/layout/SiteShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ServicePageBody } from '@/components/sections/ServicePageBody';
import { toOtherServices, toServiceView } from '@/lib/serviceView';
import { BreadcrumbJsonLd, JsonLd } from '@/components/seo/JsonLd';
import { getServiceBySlug, services } from '@/content/services';
import { servicePages } from '@/content/servicePages';
import { getSiteUrl } from '@/lib/siteUrl';

/**
 * Базовый адрес для BreadcrumbList берём из единственного источника —
 * `getSiteUrl()`. Раньше здесь был свой `process.env.NEXT_PUBLIC_SITE_URL ?? …`:
 * на пустой строке `??` не срабатывает, и в микроразметку уезжал адрес вида
 * `/uslugi/…` без домена. Разбор переменной живёт только в `lib/siteUrl.ts`.
 */
const SITE_URL = getSiteUrl();

/** Статическая генерация всех страниц услуг (раздел 19). */
export function generateStaticParams() {
  return services.filter((s) => s.slug).map((service) => ({ slug: service.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = servicePages[slug];
  const service = getServiceBySlug(slug);
  if (!content || !service) return {};

  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical: `/uslugi/${slug}` },
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      locale: 'ru_KZ',
      type: 'article',
    },
  };
}

/**
 * Страница услуги — раздел 11.
 * Шаблон: H1 → абзац → «Когда стоит приехать» → «Что мы делаем» → «Цена» →
 * мини-FAQ → CTA → «Другие услуги».
 */
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  const content = servicePages[slug];
  if (!service || !content) notFound();

  const dict = getDictionary('ru');
  const otherServices = toOtherServices(services, slug);

  return (
    <SiteShell dict={dict} locale="ru">
      <a href="#main" className="sr-only-focusable">
        Перейти к содержанию
      </a>
      <Header dict={dict} locale="ru" />

      <main id="main">
        <ServicePageBody
          dict={dict}
          service={toServiceView(service)}
          content={content}
          otherServices={otherServices}
        />
      </main>

      <Footer dict={dict} locale="ru" />
      <JsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Главная', url: SITE_URL },
          { name: service.title, url: `${SITE_URL}/uslugi/${slug}` },
        ]}
      />
      <nav aria-label="Хлебные крошки" className="mx-auto max-w-[1200px] px-4 pb-8 md:px-8">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <li>
            <Link href="/" className="underline decoration-accent decoration-2 underline-offset-4">
              Главная
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-text">{service.title}</li>
        </ol>
      </nav>
    </SiteShell>
  );
}
