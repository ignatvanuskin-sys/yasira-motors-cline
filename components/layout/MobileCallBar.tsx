'use client';

import { useEffect, useState } from 'react';
import { CallLink, WhatsAppLink } from './ContactLinks';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { Dictionary } from '@/lib/i18n';

/**
 * Закреплённая панель связи на мобильных — раздел 10.1.
 *
 * Формы записи на сайте нет, поэтому звонок и WhatsApp — единственные способы
 * оставить заявку. Чтобы клиенту не приходилось возвращаться к началу
 * страницы, обе кнопки всегда под рукой.
 *
 * Показывается только на мобильных (< lg) и только после небольшого прокрута:
 * на первом экране тот же призыв уже есть в hero, и две панели подряд
 * перегружают первый экран. Учитывает safe-area на iPhone с вырезом.
 */
export function MobileCallBar({ dict }: { dict: Dictionary }) {
  const [visible, setVisible] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={[
        'mobile-call-bar fixed inset-x-0 bottom-0 z-30 border-t border-line-dark bg-bg-dark/95 backdrop-blur-md lg:hidden',
        'transition-transform duration-200 ease-[cubic-bezier(.2,.7,.2,1)]',
        reduceMotion ? 'transition-none' : '',
        visible ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      // Скрытая панель не должна перехватывать клики и попадать в обход Tab.
      aria-hidden={!visible}
    >
      <div className="container-site flex gap-2 py-2.5">
        <CallLink
          source="mobile_bar"
          label={dict.cta.callShort}
          tone="dark"
          size="md"
          full
          className="!px-4 !text-sm"
        />
        <WhatsAppLink
          source="mobile_bar"
          label={dict.cta.whatsappShort}
          tone="dark"
          size="md"
          full
          className="!px-4 !text-sm"
        />
      </div>
    </div>
  );
}