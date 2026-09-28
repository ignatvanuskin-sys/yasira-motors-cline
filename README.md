# YASIRA MOTORS — сайт автосервиса

Сайт автосервиса в Актау: запись на сервис онлайн, прайс, контакты и отзывы.
Собран по мастер-промпту `YASIRA_MOTORS_MASTER_PROMPT.md`.

**Главное правило проекта: не выдумывать.** Все цифры, график, телефоны и адрес
берутся из одного места — `content/site.ts`. Неподтверждённые данные (⚑)
публикуются только в безопасной формулировке, полный список — в
[`OWNER_CHECKLIST.md`](./OWNER_CHECKLIST.md).

---

## Быстрый старт

```bash
npm install
cp .env.example .env.local   # заполнить TELEGRAM_* — иначе заявки не доходят
npm run dev                  # http://localhost:3000
```

Продакшен-сборка и запуск:

```bash
npm run build
npm start
```

> На Windows Turbopack недоступен (нет нативного SWC-биндинга), поэтому
> в скриптах указан флаг `--webpack`. На Vercel сборка идёт как обычно.

---

## Переменные окружения

| Переменная | Назначение | Обязательна |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Адрес сайта для canonical, sitemap, OG | да |
| `TELEGRAM_BOT_TOKEN` | Токен бота Telegram (только сервер!) | для заявок |
| `TELEGRAM_CHAT_ID` | Чат владельца для заявок (только сервер!) | для заявок |
| `NEXT_PUBLIC_GA_ID` | Google Analytics. Пусто — аналитика выключена | нет |
| `ENABLE_KK` | Казахская версия. **Маршруты `/kk` не реализованы — не включайте** | нет |
| `SHOW_SHOP` | Включить блок «Масла и магазин» | нет |

⚠️ `TELEGRAM_*` не должны иметь префикс `NEXT_PUBLIC_`, иначе токен попадёт
в клиентский JavaScript и станет доступен любому посетителю.

Как получить `TELEGRAM_CHAT_ID`: написать боту от @BotFather → открыть
`https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найти `chat.id`.

---

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Дев-сервер |
| `npm run build` | Продакшен-сборка |
| `npm start` | Запуск собранного сайта |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (flat-конфиг, без `next lint`) |
| `npm test` | Юнит-тесты (56 шт.) |
| `npm run test:e2e` | Playwright: адаптив, axe, запись, SEO, снимки (25 тестов) |
| `node scripts/repair-empty-dirs.mjs` | Заполнить пустые каталоги пакетов (см. ниже) |
| `node scripts/generate-icons.mjs` | Перегенерация PNG-иконок из SVG |
| `node scripts/audit-axe.mjs` | Быстрый прогон axe-core по страницам |
| `node scripts/find-overflow.mjs <url> <width>` | Поиск горизонтального скролла |
| `node scripts/find-small-targets.mjs <url> <width>` | Поиск тап-целей < 44px |

> ⚠️ **Особенность этого окружения.** `npm install` здесь отваливается на
> построении дерева зависимостей (`Invalid Version`) и оставляет часть
> каталогов в `node_modules` пустыми — без `package.json`. Node считает их
> неустановленными, и падает `MODULE_NOT_FOUND` (видел это на
> `object-inspect`, из-за чего не запускался ESLint). Лечится так:
> `node scripts/restore-deps.mjs` (докачка из реестра) и/или
> `node scripts/repair-empty-dirs.mjs` (копирование из вложенных копий).
> Скрипт `repair` роняет Node на Windows при глубоком рекурсивном обходе,
> поэтому обход намеренно нерекурсивный.

> Сборка идёт через `--webpack`: нативный SWC-биндинг для Windows в этом
> окружении не собирается («not a valid Win32 application»). Turbopack на Vercel
> работает штатно.

---

## Структура

```
app/                      маршруты App Router
  page.tsx                главная
  uslugi/[slug]/page.tsx  страницы услуг (SSG)
  privacy/page.tsx        политика конфиденциальности
  api/lead/route.ts       приём заявок → Telegram
  sitemap.ts robots.ts manifest.ts opengraph-image.tsx icon.svg
  layout.tsx globals.css  шрифты, метаданные, дизайн-токены
content/                  ВСЕ ДАННЫЕ И ТЕКСТЫ ЗДЕСЬ
  site.ts                 факты о компании (телефоны, адрес, график, рейтинг)
  services.ts             8 услуг
  prices.ts               прайс (пуст — ждёт владельца)
  faq.ts                  вопросы и ответы
  reviews.ts team.ts gallery.ts flags.ts
  servicePages.ts         тексты страниц услуг
lib/                      логика без React
  phone.ts                нормализация и маска телефона
  hours.ts                график и статус «Открыто/Закрыто» (Asia/Aqtau)
  validation.ts           схема заявки (zod)
  bookingView.ts          «сегодня / 12 октября» для сводки и экрана успеха
  usePrefersReducedMotion.ts  подписка на системную настройку движения
  telegram.ts             доставка заявки
  whatsapp.ts rateLimit.ts analytics.ts i18n.ts serviceView.ts
components/
  ui/                     Button, Chip, Field, Accordion, Section, Reveal…
  layout/                 Header, MobileMenu, Footer, Wordmark, SiteShell
  sections/               12 секций главной страницы
  booking/                BookingProvider, BookingFlow, Step1/2/3, Success
  seo/                    JSON-LD (AutoRepair, BreadcrumbList)
messages/ru.json kk.json  тексты интерфейса
tests/                    юнит-тесты
qa/                       helpers.ts, *.spec.ts, screens/, AUDIT.md
scripts/                  служебные скрипты (сборка иконок, аудит, починка)

---

## QA и самоаудит

Отчёт по разделу 23 мастер-промпта — [`qa/AUDIT.md`](./qa/AUDIT.md):
что проверялось, какие проблемы найдены, что исправлено и что осталось
за флагом. Снимки — в `qa/screens/` (68 файлов: страницы на 7 ширинах,
меню, лист записи на трёх шагах + ошибка + успех).

```bash
npx playwright test                      # весь набор (26 тестов)
npx playwright test qa/audit.spec.ts     # адаптив, axe, a11y
npx playwright test qa/screens.spec.ts    # только скриншоты
```

> Перед прогоном убедитесь, что на порту 3111 не висит старый `next start`:
> `reuseExistingServer` переиспользует его, и тесты пойдут по старому бандлу.

```
