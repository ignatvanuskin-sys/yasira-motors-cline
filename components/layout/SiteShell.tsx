import type { Dictionary } from '@/lib/i18n';

/**
 * Обёртка страницы. Сейчас это просто фрагмент: закреплённая панель связи
 * убрана, потому что шапка всегда на виду и уже несёт кнопку звонка —
 * вторая плашка с тем же действием внизу экрана выглядела бы дублирующе.
 * Обёртка оставлена как точка расширения и для единообразия разметки.
 */
export function SiteShell({
  dict: _dict,
  locale: _locale,
  children,
}: {
  dict: Dictionary;
  locale: 'ru' | 'kk';
  children: React.ReactNode;
}) {
  return <>{children}</>;
}