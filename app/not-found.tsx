import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { CallLink, WhatsAppLink } from '@/components/layout/ContactLinks';
import { buildPriceMessage } from '@/lib/whatsapp';

/** 404 — раздел 9. Правильный HTTP-статус задаётся самой страницей not-found. */
export default function NotFound() {
  const dict = getDictionary('ru');

  return (
    <main className="flex min-h-dvh items-center bg-bg-light text-text">
      <Container>
        <div className="py-20">
          <p className="spec-label text-muted">Ошибка 404</p>
          <h1 className="mt-3 text-[30px] leading-[1.06] font-extrabold tracking-[-0.02em] text-balance md:text-[44px]">
            {dict.errors.notFoundTitle}
          </h1>
          <p className="mt-4 max-w-[60ch] text-base text-muted">{dict.errors.notFoundText}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CallLink source="not_found" label={dict.cta.call} tone="dark" size="lg" />
            <WhatsAppLink
              label={dict.cta.whatsapp}
              source="not_found"
              size="lg"
              message={buildPriceMessage()}
            />
            <ButtonLink href="/" variant="secondary" size="lg">
              {dict.errors.toHome}
            </ButtonLink>
          </div>

          <p className="mt-8 text-sm text-muted">
            <Link href="/uslugi/zamena-masla" className="underline decoration-accent decoration-2 underline-offset-4">
              Замена масла
            </Link>
            {' · '}
            <Link href="/uslugi/kompyuternaya-diagnostika" className="underline decoration-accent decoration-2 underline-offset-4">
              Компьютерная диагностика
            </Link>
            {' · '}
            <Link href="/uslugi/razval-shozhdenie" className="underline decoration-accent decoration-2 underline-offset-4">
              Развал-схождение
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
