import type { Metadata } from 'next';
import { getDictionary } from '@/lib/i18n';
import { SiteShell } from '@/components/layout/SiteShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { ContactCard } from '@/components/sections/ContactCard';
import { ServicesGrid } from '@/components/sections/ServicesGrid';
import { WhyUs } from '@/components/sections/WhyUs';
import { Prices } from '@/components/sections/Prices';
import { Process } from '@/components/sections/Process';
import { Gallery } from '@/components/sections/Gallery';
import { Reviews } from '@/components/sections/Reviews';
import { ShopBlock } from '@/components/sections/ShopBlock';
import { Faq } from '@/components/sections/Faq';
import { Contacts } from '@/components/sections/Contacts';
import { FinalCta } from '@/components/sections/FinalCta';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'YASIRA MOTORS — автосервис в Актау | Диагностика и ремонт',
  description:
    'Автосервис в 25 мкр. Актау: диагностика, ходовая, электрика, АКПП, замена масла, развал-схождение. Рейтинг 4.9 в 2ГИС. Звонок и WhatsApp.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'YASIRA MOTORS — автосервис в Актау',
    description:
      'Диагностика, ходовая, электрика, АКПП, замена масла, развал-схождение. Запишитесь звонком или в WhatsApp.',
    locale: 'ru_KZ',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

/**
 * Главная страница — порядок блоков зафиксирован мастер-промптом:
 * Header → Hero → Услуги → Почему к нам возвращаются → Цены → Как проходит визит →
 * Цех и мастера → Отзывы → Масла и магазин → FAQ → Контакты → Финальный CTA → Footer.
 */
export default function HomePage() {
  const dict = getDictionary('ru');

  return (
    <SiteShell dict={dict} locale="ru">
      {/* Skip to content — первый элемент в порядке табуляции (раздел 15). */}
      <a href="#main" className="sr-only-focusable">
        Перейти к содержанию
      </a>

      <Header dict={dict} locale="ru" />

      <main id="main">
        <Hero dict={dict} sideCard={<ContactCard dict={dict} />} />
        <ServicesGrid dict={dict} locale="ru" />
        <WhyUs dict={dict} />
        <Prices dict={dict} />
        <Process dict={dict} />
        <Gallery dict={dict} />
        <Reviews dict={dict} />
        <ShopBlock dict={dict} />
        <Faq dict={dict} />
        <Contacts dict={dict} />
        <FinalCta dict={dict} />
      </main>

      <Footer dict={dict} locale="ru" />
      <JsonLd />
    </SiteShell>
  );
}
