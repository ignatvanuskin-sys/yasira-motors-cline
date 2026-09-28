import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.QA_PORT ?? 3111);
const baseURL = `http://localhost:${PORT}`;

/**
 * Конфигурация QA-прогона — раздел 23 мастер-промпта.
 * Проверяем адаптивность на 320/375/390/430/768/1024/1440 и запускаем axe.
 */
export default defineConfig({
  testDir: './qa',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL,
    locale: 'ru-RU',
    timezoneId: 'Asia/Aqtau',
    trace: 'off',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
