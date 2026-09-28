import type { MetadataRoute } from 'next';
import { serviceSlugs } from '@/content/services';
import { flags } from '@/content/flags';
import { getSiteUrl } from '@/lib/siteUrl';

const SITE_URL = getSiteUrl();

/** sitemap.xml — все страницы с lastmod (раздел 18). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...serviceSlugs.map((slug) => ({
      url: `${SITE_URL}/uslugi/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];

  // Казахские страницы попадают в sitemap только при включённой версии.
  if (flags.enableKk) {
    routes.push({
      url: `${SITE_URL}/kk`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
    for (const slug of serviceSlugs) {
      routes.push({
        url: `${SITE_URL}/kk/uslugi/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return routes;
}
