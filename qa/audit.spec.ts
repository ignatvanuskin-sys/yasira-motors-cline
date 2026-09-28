import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ensureScreens, openAt, WIDTHS, SCREENS } from './helpers';

test.beforeAll(async () => {
  await ensureScreens();
});

test('нет горизонтальной прокрутки ни на одной ширине', async ({ page }) => {
  const problems: string[] = [];

  for (const path of ['/', '/uslugi/zamena-masla', '/privacy']) {
    for (const width of WIDTHS) {
      await openAt(page, path, width, 800);
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      if (metrics.scrollWidth > metrics.innerWidth) {
        problems.push(
          `${path} @${width}px: scrollWidth=${metrics.scrollWidth} > innerWidth=${metrics.innerWidth}`,
        );
      }
    }
  }

  expect(problems, `Горизонтальная прокрутка:\n${problems.join('\n')}`).toEqual([]);
});

test('все тап-цели не меньше 44px', async ({ page }) => {
  const problems: string[] = [];

  for (const width of [320, 375, 430]) {
    await openAt(page, '/', width, 800);
    const small = await page.evaluate(() => {
      const selector = 'a[href], button:not([disabled]), input, select, textarea, [role="button"]';
      const bad: { tag: string; text: string; w: number; h: number }[] = [];
      for (const el of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const style = window.getComputedStyle(el);
        if (style.visibility === 'hidden' || style.opacity === '0') continue;
        if (el.closest('[aria-hidden="true"]')) continue;
        if (el.className?.toString().includes('sr-only')) continue;
        if (rect.height < 44 || rect.width < 44) {
          bad.push({
            tag: el.tagName.toLowerCase(),
            text: (el.textContent ?? '').trim().slice(0, 30),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
          });
        }
      }
      return bad;
    });
    for (const item of small) {
      problems.push(`@${width}px <${item.tag}> "${item.text}" ${item.w}x${item.h}`);
    }
  }

  expect(problems, `Мелкие тап-цели:\n${problems.join('\n')}`).toEqual([]);
});

test('axe не находит critical/serious нарушений', async ({ page }) => {
  const serious: string[] = [];

  for (const path of ['/', '/uslugi/zamena-masla', '/privacy', '/nonexistent-page']) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(path, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    for (const violation of results.violations) {
      if (violation.impact === 'critical' || violation.impact === 'serious') {
        serious.push(
          `${path}: [${violation.impact}] ${violation.id} — ${violation.help} (${violation.nodes.length})`,
        );
      }
    }
  }

  expect(serious, `Нарушения axe:\n${serious.join('\n')}`).toEqual([]);
});

test('ни одна секция не остаётся невидимой после прокрутки', async ({ page }) => {
  // Регрессия: при overflow-x: hidden на body страница не прокручивалась,
  // и блоки с появлением оставались с opacity: 0.
  await openAt(page, '/', 1440, 900);

  const hidden = await page.evaluate(() => {
    const ids = [
      'preimushchestva',
      'ceny',
      'kak-prohodit',
      'otzyvy',
      'faq',
      'kontakty',
      'zapis',
    ];
    return ids
      .map((id) => {
        const el = document.getElementById(id);
        if (!el) return `#${id}: отсутствует`;
        const content = el.querySelector('h2') ?? el;
        const style = getComputedStyle(content);
        const rect = content.getBoundingClientRect();
        if (Number(style.opacity) < 0.9 || rect.height === 0) {
          return `#${id}: opacity=${style.opacity}, высота=${Math.round(rect.height)}`;
        }
        return null;
      })
      .filter(Boolean);
  });

  expect(hidden, `Невидимые секции:\n${hidden.join('\n')}`).toEqual([]);
});

test('первый экран 375x667 показывает H1, кнопку связи и полосу доверия', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.locator('h1').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Позвонить' }).first()).toBeVisible();

  const rating = page.locator('text=/4\\.9 · 478/').first();
  await expect(rating).toBeVisible();

  const box = await rating.boundingBox();
  expect(box, 'Полоса доверия вне первого экрана').not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(667);
});

test('состояние prefers-reduced-motion отключает анимации', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  const duration = await page.evaluate(() => {
    const el = document.querySelector('.reveal') ?? document.body;
    return window.getComputedStyle(el).transitionDuration;
  });
  expect(parseFloat(duration)).toBeLessThanOrEqual(0.01);
  await context.close();
});

test('панель связи не перекрывает содержимое футера', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/', { waitUntil: 'networkidle' });

  // scroll-behavior: smooth — дожидаемся реальной остановки внизу страницы.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(() => {
    const doc = document.documentElement;
    return Math.abs(doc.scrollHeight - doc.scrollTop - doc.clientHeight) < 2;
  });
  await page.waitForTimeout(400);

  const problem = await page.evaluate(() => {
    const bar = document.querySelector('.mobile-call-bar');
    const footer = document.querySelector('footer');
    if (!bar || !footer) return 'нет панели или футера';
    if (window.getComputedStyle(bar).display === 'none') {
      return 'панель связи скрыта на мобильной ширине';
    }
    const barTop = bar.getBoundingClientRect().top;
    const items = Array.from(footer.querySelectorAll('p, a, h2'));
    const last = items.at(-1);
    if (!last) return 'футер пуст';
    // Нижний элемент футера должен помещаться над панелью.
    return last.getBoundingClientRect().bottom > barTop + 1
      ? `панель закрывает «${(last.textContent ?? '').trim().slice(0, 30)}»`
      : null;
  });
  expect(problem).toBeNull();
});

test('казахские буквы отрисовываются гарнитурой без «квадратов»', async ({ page }) => {
  const letters = 'ӘәҒғҚқҢңӨөҰұҮүҺһІі';
  await page.setContent(
    `<body style="font-family: Inter, system-ui, sans-serif; font-size: 40px">
       <span id="kaz">${letters}</span>
     </body>`,
  );

  // У каждой буквы должна быть ненулевая ширина — иначе это «тофу».
  const widths = await page.evaluate((chars) => {
    const el = document.getElementById('kaz')!;
    return Array.from(chars).map((ch) => {
      const span = document.createElement('span');
      span.style.font = getComputedStyle(el).font;
      span.style.position = 'absolute';
      span.textContent = ch;
      document.body.appendChild(span);
      const w = span.getBoundingClientRect().width;
      span.remove();
      return w;
    });
  }, letters);

  const tofu = widths.filter((w) => w <= 0);
  expect(tofu.length, `Буквы без ширины: ${tofu.length} из ${widths.length}`).toBe(0);
});

test('скриншоты всех страниц на всех ширинах', async ({ page }) => {
  let count = 0;
  for (const path of ['/', '/uslugi/zamena-masla', '/privacy', '/nonexistent-page']) {
    const slug = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-');
    for (const width of WIDTHS) {
      await openAt(page, path, width, 900);
      await page.screenshot({ path: `${SCREENS}/${slug}-${width}.png`, fullPage: true });
      count += 1;
    }
  }
  expect(count).toBe(28);
});
