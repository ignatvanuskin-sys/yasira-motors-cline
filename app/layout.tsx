import type { Metadata, Viewport } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';
import { site } from '@/content/site';

/**
 * Шрифты из раздела 8: Inter Tight (заголовки) и Inter (текст).
 * Subsets: latin + cyrillic + cyrillic-ext — обязательны для казахских букв
 * Ә ә Ғ ғ Қ қ Ң ң Ө ө Ұ ұ Ү ү Һ һ І і.
 */
const inter = Inter({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  // Метрики fallback подогнаны под Inter — это убирает «прыжки» шрифта (CLS).
  adjustFontFallback: true,
});

const interTight = Inter_Tight({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['700', '800'],
  variable: '--font-inter-tight',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // maximum-scale и user-scalable НЕ задаются: масштабирование запрещено быть не должно.
  viewportFit: 'cover',
  themeColor: '#0D0F12',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yasira-motors.vercel.app'),
  title: `${site.name} — автосервис в Актау | Диагностика и ремонт`,
  description:
    'Автосервис в 25 мкр. Актау: диагностика, ходовая, электрика, АКПП, замена масла, развал-схождение. Рейтинг 4.9 в 2ГИС. Запись онлайн и в WhatsApp.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${interTight.variable}`}>
      <body>{children}</body>
    </html>
  );
}
