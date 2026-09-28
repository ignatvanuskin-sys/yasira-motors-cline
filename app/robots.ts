import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';

const SITE_URL = getSiteUrl();

/** robots.txt — разрешаем всё, указываем sitemap (раздел 18). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
