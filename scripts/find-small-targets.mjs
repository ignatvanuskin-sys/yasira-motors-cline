/**
 * Список интерактивных элементов с размером меньше 44px.
 * Запуск: node scripts/find-small-targets.mjs [url] [width]
 */
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:3111/';
const width = Number(process.argv[3] ?? 375);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });

const small = await page.evaluate(() => {
  const selector = 'a[href], button:not([disabled]), input, select, textarea, [role="button"]';
  const bad = [];
  for (const el of Array.from(document.querySelectorAll(selector))) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.opacity === '0') continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    if (el.className?.toString().includes('sr-only')) continue;
    if (rect.height < 44 || rect.width < 44) {
      bad.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString() ?? '').slice(0, 80),
        text: (el.textContent ?? '').trim().slice(0, 30),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      });
    }
  }
  return bad;
});

console.log(JSON.stringify(small, null, 2));
await browser.close();
