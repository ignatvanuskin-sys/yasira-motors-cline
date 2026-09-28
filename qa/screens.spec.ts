import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { openAt, WIDTHS, SCREENS } from './helpers';

/**
 * Скриншоты меню и листа записи — раздел 23.1 п.2 мастер-промпта.
 * Отдельный файл от `audit.spec`, чтобы прогон снимков можно было повторить
 * отдельно, не тратя время на остальные проверки.
 */
test.describe('Снимки меню и листа записи', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeAll(async () => {
    await mkdir(SCREENS, { recursive: true });
  });

  /** Открыть запись из шапки и вернуть диалог. */
  const openBooking = async (page: Page) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Записаться' }).first().click();
    return page.getByRole('dialog');
  };

  test('меню на всех ширинах', async ({ page }) => {
    for (const width of WIDTHS) {
      await openAt(page, '/', width, 900);
      // Меню только на мобильных/планшетных — на десктопе его нет (lg:hidden).
      const menuButton = page.getByRole('button', { name: 'Меню' });
      if (!(await menuButton.isVisible())) continue;
      await menuButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.screenshot({ path: `${SCREENS}/menu-${width}.png` });
      await page.keyboard.press('Escape');
    }
  });

  test('лист записи: шаг 1, шаг 2, шаг 3, ошибка, успех', async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });

      // --- Шаг 1: выбор услуги ---
      let dialog = await openBooking(page);
      await expect(dialog.getByText('Шаг 1 из 3')).toBeVisible();
      // Даём отработать анимациям появления, иначе снимок будет полупустым.
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${SCREENS}/booking-step1-${width}.png` });

      // --- Шаг 2: автомобиль ---
      await dialog.getByRole('checkbox', { name: 'Замена масла и фильтров' }).click();
      await dialog.getByRole('button', { name: 'Далее' }).click();
      await expect(dialog.getByText('Шаг 2 из 3')).toBeVisible();
      await dialog.getByRole('radio', { name: 'Toyota', exact: true }).click();
      await page.screenshot({ path: `${SCREENS}/booking-step2-${width}.png` });

      // --- Шаг 3: имя и телефон + ошибка валидации ---
      await dialog.getByRole('button', { name: 'Далее' }).click();
      await expect(dialog.getByText('Шаг 3 из 3')).toBeVisible();
      await page.screenshot({ path: `${SCREENS}/booking-step3-${width}.png` });

      // Ошибка: отправка с неверным телефоном.
      await dialog.getByLabel('Имя').fill('Алмас');
      await dialog.getByLabel('Телефон').fill('123');
      await dialog.getByRole('button', { name: 'Отправить заявку' }).click();
      await expect(dialog.getByText(/Проверьте номер/)).toBeVisible();
      await page.screenshot({ path: `${SCREENS}/booking-error-${width}.png` });

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();

      // --- Успех: эмулируем ответ сервера ---
      await page.route('**/api/lead', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
      );
      dialog = await openBooking(page);
      await dialog.getByRole('checkbox', { name: 'Компьютерная диагностика' }).click();
      await dialog.getByRole('button', { name: 'Далее' }).click();
      await dialog.getByRole('radio', { name: 'Kia', exact: true }).click();
      await dialog.getByRole('button', { name: 'Далее' }).click();
      await dialog.getByLabel('Имя').fill('Алмас');
      await dialog.getByLabel('Телефон').fill('77770884436');
      await dialog.getByRole('button', { name: 'Отправить заявку' }).click();
      await expect(dialog.getByText('Заявка принята')).toBeVisible();
      // Галочка дорисовывается за 500 мс — ждём конца анимации, иначе
      // снимок покажет только её начало.
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${SCREENS}/booking-success-${width}.png` });
    }
  });
});