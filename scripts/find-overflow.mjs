/**
 * Поиск элементов, выходящих за пределы ширины экрана (горизонтальный скролл).
 * Запуск: node scripts/find-overflow.mjs [url] [width]
 */
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:3111/';
const width = Number(process.argv[3] ?? 375);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 800 } });
await page.goto(url, { waitUntil: 'networkidle' });

const offenders = await page.evaluate((vw) => {
  const result = [];
  for (const el of Array.from(document.querySelectorAll('*'))) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) continue;
    // Элемент выходит за правый край или шире вьюпорта.
    if (rect.right > vw + 1 || rect.width > vw + 1) {
      // Исключаем намеренные горизонтальные ленты (scroll-snap) и их детей.
      let parent = el.parentElement;
      let inScroller = false;
      while (parent) {
        const style = getComputedStyle(parent);
        if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
          inScroller = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (inScroller) continue;
      result.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString() ?? '').slice(0, 90),
        width: Math.round(rect.width),
        right: Math.round(rect.right),
        text: (el.textContent ?? '').trim().slice(0, 40),
      });
    }
  }
  return result.slice(0, 25);
}, width);

console.log(`viewport=${width}, scrollWidth=${await page.evaluate(() => document.documentElement.scrollWidth)}`);
console.log(JSON.stringify(offenders, null, 2));
await browser.close();
