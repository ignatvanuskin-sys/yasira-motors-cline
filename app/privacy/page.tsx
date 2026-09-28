import type { Metadata } from 'next';
import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';
import { SiteShell } from '@/components/layout/SiteShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — YASIRA MOTORS',
  description:
    'Как YASIRA MOTORS обращается с персональными данными клиентов: какие данные собирает форма записи, зачем и как их удалить.',
  alternates: { canonical: '/privacy' },
};

/**
 * Политика обработки персональных данных — раздел 9.
 * ⚑ Юридическая проверка владельцем: состав документа шаблонный и не является
 * юридической консультацией. Список в OWNER_CHECKLIST.md.
 */
export default function PrivacyPage() {
  const dict = getDictionary('ru');
  const updated = '28.09.2026';

  return (
    <SiteShell dict={dict} locale="ru">
      <a href="#main" className="sr-only-focusable">
        Перейти к содержанию
      </a>
      <Header dict={dict} locale="ru" />

      <main id="main" className="container-site py-12 md:py-16">
        <h1 className="text-[30px] leading-[1.06] font-extrabold tracking-[-0.02em] text-balance md:text-[40px]">
          Политика обработки персональных данных
        </h1>
        <p className="mt-3 text-sm text-muted">Редакция от {updated}. Оператор: {site.name}.</p>

        <div className="mt-8 max-w-[70ch] space-y-6 text-base text-text">
          <section>
            <h2 className="text-[18px] font-semibold md:text-[22px]">1. Общие положения</h2>
            <p className="mt-2 text-muted">
              Настоящая политика описывает, какие персональные данные собирает сайт{' '}
              {site.name} и для чего они используются. Отправляя форму записи, вы соглашаетесь
              с условиями ниже.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold md:text-[22px]">
              2. Какие данные собираются
            </h2>
            <p className="mt-2 text-muted">
              Через форму записи на сервис: имя, номер телефона, марка и модель автомобиля, год
              выпуска (если указан), выбранные услуги, удобное время и, по желанию, описание
              симптома. Дополнительно фиксируются обезличенные технические данные: адрес запроса,
              источник перехода и версия браузера.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold md:text-[22px]">3. Зачем используются</h2>
            <p className="mt-2 text-muted">
              Исключительно чтобы связаться с вами, подтвердить запись и выполнить работы.
              Данные не используются для рассылок и не передаются третьим лицам, кроме
              мессенджера, через который администратору доставляется заявка.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold md:text-[22px]">4. Сколько хранятся</h2>
            <p className="mt-2 text-muted">
              Данные хранятся не дольше, чем это необходимо для обработки заявки и выполнения
              работ, а также в течение срока, установленного для бумажного документооборота.
              Заявка не сохраняется в браузере: после отправки форма очищается.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold md:text-[22px]">5. Ваши права</h2>
            <p className="mt-2 text-muted">
              Вы можете запросить сведения об обработке своих данных, потребовать их уточнения,
              блокирования или удаления, а также отозвать согласие. Обращения принимаются по
              телефону <a href={`tel:${site.phones.primary}`} className="underline decoration-accent decoration-2 underline-offset-4">{site.phones.primaryDisplay}</a>{' '}
              или на почту{' '}
              <a href={`mailto:${site.email}`} className="underline decoration-accent decoration-2 underline-offset-4">
                {site.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold md:text-[22px]">6. Файлы cookie</h2>
            <p className="mt-2 text-muted">
              Сайт использует только технические cookie, необходимые для работы страницы. Рекламные
              и аналитические cookie не подключаются по умолчанию.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm text-muted">
          <Link href="/" className="underline decoration-accent decoration-2 underline-offset-4">
            На главную
          </Link>
        </p>
      </main>

      <Footer dict={dict} locale="ru" />
    </SiteShell>
  );
}
