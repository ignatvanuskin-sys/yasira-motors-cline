'use client';

import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/whatsapp';
import { trackClick } from '@/lib/analytics';

/**
 * Ссылка на WhatsApp с иконкой. Открывается в новой вкладке и корректно
 * работает в in-app браузерах Instagram и 2ГИС (раздел 14).
 * На светлом фоне иконка/контур #128C4A, на тёмном допустим #25D366.
 */
export function WhatsAppLink({
  label,
  source,
  className = '',
  iconOnly = false,
  tone = 'light',
}: {
  label: string;
  source: string;
  className?: string;
  iconOnly?: boolean;
  tone?: 'light' | 'dark';
}) {
  const isDark = tone === 'dark';
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackClick('whatsapp', source)}
      aria-label={iconOnly ? label : undefined}
      className={
        'inline-flex items-center justify-center gap-2 rounded-btn transition-colors duration-160 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
        (iconOnly
          ? `size-11 shrink-0 ${isDark ? 'text-text-on-dark hover:bg-white/8' : 'border border-wa text-wa hover:bg-wa/10'}`
          : `${isDark ? 'border border-line-dark text-text-on-dark hover:bg-white/8' : 'border border-wa text-wa hover:bg-wa/10'} h-12 min-h-12 px-4 text-sm font-semibold `) +
        className
      }
    >
      <MessageCircle
        className={`size-5 ${isDark ? 'text-wa-icon-dark' : 'text-wa'}`}
        strokeWidth={1.75}
        aria-hidden
      />
      {!iconOnly && <span>{label}</span>}
    </a>
  );
}
