import { test, expect, type Page } from '@playwright/test';

/**
 * Сценарии системы записи — раздел 23.1 мастер-промпта.
 * Telegram в QA не настроен, поэтому проверяем путь восстановления:
 * ошибка доставки не должна терять заявку (есть WhatsApp и «Повторить»).
 */
test.describe('Система записи', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  /** Открывает запись из шапки. */
  const openBooking = async (page: Page) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Записаться' }).first().click();
    return page.getByRole('dialog');
  };

  test('запись из hero проходит три шага', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Записаться на сервис' }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Шаг 1 из 3')).toBeVisible();

    // Без выбора продолжить нельзя.
    await dialog.getByRole('button', { name: 'Далее' }).click();
    await expect(dialog.getByText(/Выберите услугу или опишите симптом/)).toBeVisible();

    await dialog.getByRole('checkbox', { name: 'Замена масла и фильтров' }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();

    // Шаг 2: пустое поле не пропускаем.
    await expect(dialog.getByText('Шаг 2 из 3')).toBeVisible();
    await dialog.getByRole('button', { name: 'Далее' }).click();
    await expect(dialog.getByText(/Укажите марку и модель/)).toBeVisible();

    await dialog.getByRole('radio', { name: 'Toyota', exact: true }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();

    // Шаг 3: маска телефона применяется на лету.
    await expect(dialog.getByText('Шаг 3 из 3')).toBeVisible();
    await dialog.getByLabel('Имя').fill('Алмас');
    await dialog.getByLabel('Телефон').fill('77770884436');
    await expect(dialog.getByLabel('Телефон')).toHaveValue('+7 (777) 088-44-36');
  });

  test('пустое имя и неверный телефон показывают ошибки', async ({ page }) => {
    const dialog = await openBooking(page);

    await dialog.getByRole('checkbox', { name: 'Шиномонтаж' }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();
    await dialog.getByRole('radio', { name: 'Kia', exact: true }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();

    // Пустое имя.
    await dialog.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(dialog.getByText('Укажите имя: минимум 2 символа')).toBeVisible();

    // Неверный телефон.
    await dialog.getByLabel('Имя').fill('Алмас');
    await dialog.getByLabel('Телефон').fill('123');
    await dialog.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(dialog.getByText(/Проверьте номер/)).toBeVisible();
  });

  test('при недоступном Telegram заявка не теряется', async ({ page }) => {
    // Имитируем ошибку доставки 502 от сервера.
    await page.route('**/api/lead', (route) =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: '{"code":"delivery_failed"}',
      }),
    );

    const dialog = await openBooking(page);
    await dialog.getByRole('checkbox', { name: 'Ремонт ходовой части' }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();
    await dialog.getByRole('radio', { name: 'Mazda', exact: true }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();
    await dialog.getByLabel('Имя').fill('Алмас');
    await dialog.getByLabel('Телефон').fill('77770884436');
    await dialog.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(dialog.getByText('Не удалось отправить заявку')).toBeVisible();
    // Запасной путь: WhatsApp с собранным текстом + кнопка «Повторить».
    const wa = dialog.getByRole('link', { name: /WhatsApp/ }).first();
    await expect(wa).toBeVisible();
    expect(await wa.getAttribute('href')).toContain('wa.me/7770884436');
    await expect(dialog.getByRole('button', { name: 'Повторить' })).toBeVisible();
  });

  test('успешная отправка показывает экран подтверждения', async ({ page }) => {
    await page.route('**/api/lead', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
    );

    const dialog = await openBooking(page);
    await dialog.getByRole('checkbox', { name: 'Автоэлектрик' }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();
    await dialog.getByRole('radio', { name: 'Lexus', exact: true }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();
    await dialog.getByLabel('Имя').fill('Алмас');
    await dialog.getByLabel('Телефон').fill('77770884436');
    await dialog.getByRole('button', { name: 'Отправить заявку' }).click();

    await expect(dialog.getByText('Заявка принята')).toBeVisible();
    // Кнопка «Закрыть» внизу листа (крестик имеет такое же доступное имя,
    // поэтому берём последнюю кнопку с этим именем).
    await expect(dialog.getByRole('button', { name: 'Закрыть' }).last()).toBeVisible();
  });

  test('закрытие листа на втором шаге сохраняет выбор', async ({ page }) => {
    const dialog = await openBooking(page);

    await dialog.getByRole('checkbox', { name: 'Шиномонтаж' }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();
    await expect(dialog.getByText('Шаг 2 из 3')).toBeVisible();

    // Крестик в правом верхнем углу листа.
    await dialog.getByRole('button', { name: 'Закрыть' }).first().click();
    await expect(dialog).toBeHidden();

    // Открываем снова — выбор услуги должен сохраниться.
    await page.getByRole('button', { name: 'Записаться' }).first().click();
    await expect(dialog.getByRole('checkbox', { name: 'Шиномонтаж' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('галочка успеха видна целиком даже без анимации', async ({ page }) => {
    // При выключенных анимациях animation-fill-mode не действует, поэтому
    // иконка не должна зависеть от keyframes: штрих должен быть отрисован.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/api/lead', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
    );

    const dialog = await openBooking(page);
    await dialog.getByRole('checkbox', { name: 'Шиномонтаж' }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();
    await dialog.getByRole('radio', { name: 'Kia', exact: true }).click();
    await dialog.getByRole('button', { name: 'Далее' }).click();
    await dialog.getByLabel('Имя').fill('Алмас');
    await dialog.getByLabel('Телефон').fill('77770884436');
    await dialog.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(dialog.getByText('Заявка принята')).toBeVisible();

    const stroke = await dialog.locator('svg.check-draw').evaluate((el) => {
      const style = getComputedStyle(el);
      return { offset: style.strokeDashoffset, opacity: Number(style.opacity) };
    });
    expect(parseFloat(stroke.offset), 'штрих галочки не дорисован').toBeLessThanOrEqual(0.01);
    expect(stroke.opacity, 'галочка не видна').toBeGreaterThan(0.9);
  });

  test('Esc закрывает лист и фокус возвращается на кнопку', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const trigger = page.getByRole('button', { name: 'Записаться' }).first();
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('карточка услуги открывает запись с предвыбранным пунктом', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Компьютерная диагностика/ }).first().click();
    await expect(
      page.getByRole('dialog').getByRole('checkbox', { name: 'Компьютерная диагностика' }),
    ).toHaveAttribute('aria-checked', 'true');
  });
});
