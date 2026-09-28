import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

export const alt = 'YASIRA MOTORS — автосервис в Актау';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * OG-изображение 1200×630 — раздел 18.
 * Тёмный фон, wordmark и «Автосервис в Актау».
 * ⚠️ Цифры рейтинга намеренно НЕ выводятся: они меняются и быстро устаревают.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#0D0F12',
          color: '#F2F3F4',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: '0.08em', color: '#A3AAB2' }}>
          {site.city.toUpperCase()} · 25 МИКРОРАЙОН, 52/2
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          Автосервис в Актау
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 40,
            paddingTop: 32,
            borderTop: '2px solid #F2A900',
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          YASIRA MOTORS
        </div>

        <div style={{ display: 'flex', marginTop: 18, fontSize: 30, color: '#A3AAB2' }}>
          Диагностика · Ходовая · Электрика · АКПП · Шиномонтаж
        </div>
      </div>
    ),
    { ...size },
  );
}
