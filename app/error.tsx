'use client';

import { useEffect } from 'react';
import { getDictionary } from '@/lib/i18n';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { CallLink, WhatsAppLink } from '@/components/layout/ContactLinks';
import { buildPriceMessage } from '@/lib/whatsapp';

/**
 * Граница ошибок — раздел 21. Понятный текст и запасной путь связи:
 * пользователь никогда не остаётся без возможности связаться.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const dict = getDictionary('ru');

  useEffect(() => {
    // В лог уходит только текст ошибки без персональных данных.
    console.error('Ошибка страницы:', error.message);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center bg-bg-light text-text">
      <Container>
        <div className="py-20">
          <p className="spec-label text-muted">Ошибка</p>
          <h1 className="mt-3 text-[30px] leading-[1.06] font-extrabold tracking-[-0.02em] text-balance md:text-[44px]">
            {dict.errors.title}
          </h1>
          <p className="mt-4 max-w-[60ch] text-base text-muted">{dict.errors.text}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CallLink source="error" label={dict.cta.call} tone="dark" size="lg" />
            <WhatsAppLink
              label={dict.cta.whatsapp}
              source="error"
              size="lg"
              message={buildPriceMessage()}
            />
            <ButtonLink href="/" variant="secondary" size="lg">
              {dict.errors.toHome}
            </ButtonLink>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-13 min-h-13 items-center justify-center rounded-btn border border-line-light px-5 text-base font-semibold text-text transition-colors duration-160 hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {dict.errors.retry}
            </button>
          </div>
        </div>
      </Container>
    </main>
  );
}
