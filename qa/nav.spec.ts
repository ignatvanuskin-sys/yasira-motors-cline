import { test, expect } from '@playwright/test';

/** Меню, FAQ, внешние ссылки, 404 и SEO. */
test.describe('Меню, FAQ и навигация', () => {
  test('мобильное меню открывается и закрывается', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: 'Меню' }).click();
    const menu = page.getByRole('dialog');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Услуги' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });

  test('аккордеон FAQ раскрывается и сворачивается', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const question = page.getByRole('button', { name: 'Как оплатить?' });
    await question.scrollIntoViewIfNeeded();
    await expect(question).toHaveAttribute('aria-expanded', 'false');
    await question.click();
    await expect(question).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Картой, наличными или через банк.')).toBeVisible();
  });

  test('внешние ссылки открываются в новой вкладке с rel=noopner', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="http"]'))
        .map((a) => ({
          href: a.getAttribute('href') ?? '',
          rel: a.getAttribute('rel') ?? '',
          target: a.getAttribute('target') ?? '',
          text: (a.textContent ?? '').trim().slice(0, 30),
        }))
        .filter((a) => /2ГИС|Google Карты|Яндекс Карты|Instagram|WhatsApp/.test(a.text)),
    );

    expect(links.length, 'Не найдены внешние ссылки').toBeGreaterThan(0);
    for (const link of links) {
      expect(link.target, `Нет target=_blank: ${link.text}`).toBe('_blank');
      expect(link.rel, `Нет rel=noopener: ${link.text}`).toContain('noopener');
    }
  });

  test('404 отдаёт статус 404 и ведёт на главную', async ({ page }) => {
    const response = await page.goto('/definitely-not-a-page');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('link', { name: 'На главную' })).toBeVisible();
    // На 404 должен быть способ связаться, а не только ссылка на главную.
    await expect(page.getByRole('link', { name: 'Позвонить' })).toBeVisible();
    await expect(page.getByRole('link', { name: /WhatsApp/ })).toBeVisible();
  });
});

test.describe('SEO', () => {
  test('на главной один H1, canonical и AutoRepair без aggregateRating', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(await page.locator('h1').count()).toBe(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /yasira-motors/);

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toContain('AutoRepair');
    expect(jsonLd).not.toContain('aggregateRating');
  });

  test('страница услуги содержит BreadcrumbList и уникальный title', async ({ page }) => {
    await page.goto('/uslugi/zamena-masla', { waitUntil: 'domcontentloaded' });
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.join('')).toContain('BreadcrumbList');
    await expect(page).toHaveTitle(/Замена масла в Актау/);
  });

  test('sitemap и robots отдаются корректно', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain('Sitemap:');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    expect(xml).toContain('/uslugi/zamena-masla');
  });
});
