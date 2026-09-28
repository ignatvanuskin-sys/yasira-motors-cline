import { mkdir } from 'node:fs/promises';
import type { Page } from '@playwright/test';

/**
 * Общие константы и помощники QA-прогонов.
 *
 * Вынесены отдельно от `*.spec.ts`, чтобы импорт не приводил к повторной
 * регистрации тестов: Playwright считает набором каждый файл с `test(...)`.
 */

/** Ширины из разделов 14–15 мастер-промпта. */
export const WIDTHS = [320, 375, 390, 430, 768, 1024, 1440];
export const SCREENS = 'qa/screens';

/** Гарантирует, что папка со снимками существует. */
export async function ensureScreens() {
  await mkdir(SCREENS, { recursive: true });
}

/**
 * Открывает страницу на заданной ширине и прокручивает до конца и обратно:
 * так срабатывают появления блоков, и снимок `fullPage` показывает контент.
 */
export async function openAt(page: Page, path: string, width: number, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const doc = document.scrollingElement ?? document.documentElement;
    const step = window.innerHeight;
    for (let y = 0; y < doc.scrollHeight; y += step) {
      doc.scrollTop = y;
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    doc.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}