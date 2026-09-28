/**
 * Запуск axe-core по списку страниц: показывает critical/serious нарушения.
 * Запуск: node scripts/audit-axe.mjs
 */
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';

const base = process.argv[2] ?? 'http://localhost:3111';
const pages = ['/', '/uslugi/zamena-masla', '/privacy', '/nonexistent-page'];

const browser = await chromium.launch();
// axe-core/playwright работает только со страницей из browser.newContext().
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
let total = 0;

for (const path of pages) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  for (const v of results.violations) {
    if (v.impact !== 'critical' && v.impact !== 'serious') continue;
    total += 1;
    console.log(`\n[${v.impact}] ${path} — ${v.id}: ${v.help}`);
    for (const node of v.nodes.slice(0, 3)) {
      console.log(`   ${node.target.join(' ')}`);
      console.log(`   ${(node.failureSummary ?? '').split('\n').join(' | ').slice(0, 220)}`);
    }
  }
}

console.log(`\nИтого critical/serious: ${total}`);
await browser.close();
