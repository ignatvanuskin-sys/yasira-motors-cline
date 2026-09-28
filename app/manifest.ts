import type { MetadataRoute } from 'next';

/** manifest.webmanifest — раздел 18. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'YASIRA MOTORS — автосервис в Актау',
    short_name: 'YASIRA MOTORS',
    description:
      'Автосервис в Актау: диагностика, ходовая, электрика, АКПП, замена масла, развал-схождение. Запись онлайн.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D0F12',
    theme_color: '#0D0F12',
    lang: 'ru',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
