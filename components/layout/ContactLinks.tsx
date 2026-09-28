'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { whatsappLink, whatsappLinkWithText } from '@/lib/whatsapp';
import { trackClick } from '@/lib/analytics';
import { site } from '@/content/site';

/**
 * Кнопки связи с администратором.
 *
 * Формы записи на сайте нет — только два действия: позвонить и написать
 * в WhatsApp. Оба компонента используются в шапке, hero, услугах, контактах
 * и футере, поэтому оформление живёт здесь, а не дублируется по страницам.
 *
 * `message` в WhatsApp-кнопке — контекст обращения: администратор сразу видит,
 * по какой услуге пишет клиент, и не задаёт уточняющих вопросов с нуля.
 */

type Tone = 'light' | 'dark';

/** Кнопка «Позвонить» — звонит на основной номер. */
export function CallLink({
  source,
  label,
  tone = 'light',
  size = 'md',
  full = false,
  className = '',
  iconOnly = false,
}: {
  source: string;
  label: string;
  tone?: Tone;
  size?: 'lg' | 'md';
  full?: boolean;
  className?: string;
  iconOnly?: boolean;
}) {
  const isDark = tone === 'dark';
  const height = iconOnly ? 'size-11' : size === 'lg' ? 'h-13 min-h-13' : 'h-12 min-h-12';

  return (
    <a
      href={`tel:${site.phones.primary}`}
      onClick={() => trackClick('call', source)}
      aria-label={iconOnly ? label : undefined}
      className={
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-btn font-semibold ' +
        'transition-[background-color,border-color,color,transform] duration-160 ' +
        'ease-[cubic-bezier(.2,.7,.2,1)] active:translate-y-px ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
        (iconOnly
          ? isDark
            ? `text-text-on-dark hover:bg-white/8 ${height}`
            : `border border-line-light text-text hover:bg-black/5 ${height}`
          : isDark
            ? `bg-accent px-5 text-on-accent hover:bg-accent-hover ${height}`
            : `border border-line-light bg-transparent px-4 text-text hover:bg-black/5 ${height}`) +
        (full ? ' w-full' : '') +
        ' ' +
        className
      }
    >
      <Phone className="size-5" strokeWidth={1.75} aria-hidden />
      {!iconOnly && <span>{label}</span>}
    </a>
  );
}

/**
 * Ссылка на WhatsApp. Открывается в новой вкладке и корректно работает
 * в in-app браузерах Instagram и 2ГИС (раздел 14).
 * На светлом фоне иконка/контур #128C4A, на тёмном допустим #25D366.
 */
export function WhatsAppLink({
  label,
  source,
  message,
  className = '',
  iconOnly = false,
  tone = 'light',
  size = 'md',
  full = false,
}: {
  label: string;
  source: string;
  message?: string;
  className?: string;
  iconOnly?: boolean;
  tone?: Tone;
  size?: 'lg' | 'md';
  full?: boolean;
}) {
  const isDark = tone === 'dark';
  const height = iconOnly ? 'size-11' : size === 'lg' ? 'h-13 min-h-13' : 'h-12 min-h-12';
  const href = message ? whatsappLinkWithText(message) : whatsappLink();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackClick('whatsapp', source)}
      aria-label={iconOnly ? label : undefined}
      className={
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-btn font-semibold ' +
        'transition-[background-color,border-color,color,transform] duration-160 ' +
        'ease-[cubic-bezier(.2,.7,.2,1)] active:translate-y-px ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
        (iconOnly
          ? isDark
            ? `text-text-on-dark hover:bg-white/8 ${height}`
            : `border border-wa text-wa-text hover:bg-wa/10 ${height}`
          : isDark
            ? `border border-line-dark px-5 text-text-on-dark hover:bg-white/8 ${height}`
            : `border border-wa px-4 text-wa-text hover:bg-wa/10 ${height}`) +
        (full ? ' w-full' : '') +
        ' ' +
        className
      }
    >
      <MessageCircle
        className={`size-5 ${isDark ? 'text-wa-icon-dark' : 'text-wa-text'}`}
        strokeWidth={1.75}
        aria-hidden
      />
      {!iconOnly && <span>{label}</span>}
    </a>
  );
}

