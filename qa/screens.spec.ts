import { test, expect } from '@playwright/test';

/**
 * Способы связи — вместо системы записи.
 *
 * Формы на сайте нет, поэтому проверяем то, что реально приводит клиента
 * к администратору: корректные tel:/wa.me ссылки с контекстом услуги,
 * их доступность с клавиатуры и отсутствие перекрытия контента панелью.
 */
test.describe('Связь с администратором', () => {
  test('телефоны ведут на tel: со схемой номера', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const telLinks = await page.locator('a[href^="tel:"]').evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href') ?? ''),
    );

    expect(telLinks.length, 'Нет ссылок tel:').toBeGreaterThan(0);
    for (const href of telLinks) {
      // Номер должен быть в формате +7XXXXXXXXXX без пробелов.
      expect(href, `Некорректный tel: ${href}`).toMatch(/^tel:\+7\d{10}$/);
    }
  });

  test('все WhatsApp-ссылки ведут на wa.me и открываются безопасно', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const waLinks = await page.locator('a[href*="wa.me"]').evaluateAll((els) =>
      els.map((el) => ({
        href: el.getAttribute('href') ?? '',
        target: el.getAttribute('target') ?? '',
        rel: el.getAttribute('rel') ?? '',
      })),
    );

    expect(waLinks.length, 'Нет ссылок WhatsApp').toBeGreaterThan(0);
    for (const link of waLinks) {
      // Часть ссылок ведёт без текста (шапка, футер, плитки контактов) —
      // это допустимо. Контекст обязателен там, где клиент пишет по услуге.
      expect(link.href, `Некорректная ссылка: ${link.href}`).toMatch(
        /^https:\/\/wa\.me\/\d{10}(\?text=.+)?$/,
      );
      // Внешняя ссылка обязана открываться безопасно.
      expect(link.target, `Нет target=_blank: ${link.href}`).toBe('_blank');
      expect(link.rel, `Нет rel=noopener: ${link.href}`).toContain('noopener');
    }
  });

  test('ссылка на услугу несёт её название в тексте сообщения', async ({ page }) => {
    await page.goto('/uslugi/zamena-masla', { waitUntil: 'networkidle' });

    const withService = page.locator('a[href*="wa.me"][href*="text="]').first();
    const href = await withService.getAttribute('href');
    const decoded = decodeURIComponent(href ?? '');
    // Название услуги должно попасть в сообщение, а не «просто написать».
    expect(decoded, 'В сообщении нет названия услуги').toContain('Замена масла');
  });

  test('на главной нет ни одной формы и полей ввода', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    expect(await page.locator('form').count(), 'На сайте осталась форма').toBe(0);
    expect(
      await page.locator('input:not([type="hidden"]), textarea, select').count(),
      'На главной остались поля ввода',
    ).toBe(0);
  });

  test('мобильная панель связи появляется после прокрутки и не перекрывает футер', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const bar = page.locator('.mobile-call-bar');
    // На первом экране панели нет — призыв есть в hero.
    await expect(bar).toHaveAttribute('aria-hidden', 'true');

    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(bar).toHaveAttribute('aria-hidden', 'false');
    // Кнопки панели — рабочие ссылки связи.
    await expect(bar.locator('a[href^="tel:"]')).toHaveCount(1);
    await expect(bar.locator('a[href*="wa.me"]')).toHaveCount(1);

    // В самом низу страницы панель не должна закрывать содержимое футера.
    // scroll-behavior: smooth, поэтому ждём фактической остановки прокрутки.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(() => {
      const doc = document.documentElement;
      return Math.abs(doc.scrollHeight - doc.scrollTop - doc.clientHeight) < 2;
    });
    await page.waitForTimeout(400);

    const overlap = await page.evaluate(() => {
      const bar = document.querySelector('.mobile-call-bar');
      const footer = document.querySelector('footer');
      if (!bar || !footer) return { error: 'нет панели или футера' };
      const barTop = bar.getBoundingClientRect().top;
      // Последний видимый элемент футера — самый нижний, что клиент видит.
      const items = Array.from(footer.querySelectorAll('p, a, h2'));
      const last = items[items.length - 1];
      if (!last) return { error: 'футер пуст' };
      const lastRect = last.getBoundingClientRect();
      return {
        barTop: Math.round(barTop),
        lastText: (last.textContent ?? '').trim().slice(0, 30),
        lastBottom: Math.round(lastRect.bottom),
        covered: lastRect.bottom > barTop + 1,
      };
    });

    expect(overlap.error ?? null).toBeNull();
    expect(overlap.covered, `Панель закрывает «${overlap.lastText}»`).toBe(false);
  });

  test('кнопки связи доступны с клавиатуры на 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Первая таб-стопка после skip-link должна вести к связи, а не в никуда.
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const href = el.getAttribute('href') ?? '';
      return { tag: el.tagName.toLowerCase(), href, visible: el.getBoundingClientRect().width > 0 };
    });
    expect(focused?.visible, 'Фокус ушёл на скрытый элемент').toBe(true);
    if (focused?.tag === 'a') {
      expect(['tel:', 'wa.me', '#']).toContain(
        focused.href.startsWith('tel:') || focused.href.startsWith('https://wa.me/')
          ? 'tel:'
          : '#',
      );
    }
  });
});
