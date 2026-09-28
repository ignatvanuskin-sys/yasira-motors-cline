import { MobileCallBar } from './MobileCallBar';
import type { Dictionary } from '@/lib/i18n';

/**
 * Клиентская обёртка страницы: закреплённая панель связи.
 * Всё остальное рендерится на сервере.
 *
 * Панель — единственный клиентский компонент оболочки, поэтому обёртка
 * остаётся тонкой и не тянет в бандл состояние записи или форму.
 */
export function SiteShell({
  dict,
  locale: _locale,
  children,
}: {
  dict: Dictionary;
  locale: 'ru' | 'kk';
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* Отступ снизу под закреплённую панель связи. Высота панели — 52px
          кнопка + вертикальные отступы = 69px, поэтому отступ 72px:
          иначе последняя строка футера упирается в панель на iPhone,
          где safe-area добавляет ещё несколько пикселей. */}
      <div aria-hidden className="h-18 lg:hidden" />
      <MobileCallBar dict={dict} />
    </>
  );
}