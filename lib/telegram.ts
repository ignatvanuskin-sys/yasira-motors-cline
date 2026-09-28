/**
 * Экранирование для Telegram (parse_mode: HTML).
 * Все пользовательские значения проходят через эту функцию.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type LeadForTelegram = {
  services: string[];
  car: string;
  when: string;
  name: string;
  phone: string;
  comment: string;
  source: string;
  locale: string;
};

export type TelegramResult = { ok: true } | { ok: false; error: string };

/** «Утро 09–12» → «утро, 09:00–12:00» */
function humanizeSlot(slot: string): string {
  if (!slot) return 'не указано';
  if (slot === 'Не важно') return 'не важно';
  return slot;
}

/** Формирует текст сообщения по формату из раздела 13. */
export function buildTelegramMessage(lead: LeadForTelegram, aqtauNow: string): string {
  const lines = [
    '🆕 Заявка с сайта',
    `Услуги: ${lead.services.length > 0 ? lead.services.join(', ') : 'не указаны'}`,
    `Авто: ${lead.car}`,
    `Когда: ${humanizeSlot(lead.when)}`,
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
  ];
  if (lead.comment) lines.push(`Комментарий: ${lead.comment}`);
  lines.push(`Источник: ${lead.source} · ${lead.locale.toUpperCase()}`);
  lines.push(`Время: ${aqtauNow}`);
  return lines.map(escapeHtml).join('\n');
}

/**
 * Отправляет заявку владельцу через Telegram Bot API.
 * Секреты берутся только из env (server-side) и никогда не попадают в клиент.
 */
export async function sendLeadToTelegram(lead: LeadForTelegram, aqtauNow: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Не настроено — это ошибка конфигурации, а не валидации.
    return { ok: false, error: 'Telegram не настроен (нет TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID)' };
  }

  const text = buildTelegramMessage(lead, aqtauNow);
  // Inline-кнопка «Ответить в WhatsApp» с номером клиента.
  const replyUrl = `https://wa.me/${lead.phone.replace(/\D/g, '').slice(1)}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{ text: 'Ответить в WhatsApp', url: replyUrl }]],
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return { ok: false, error: `Telegram API вернул ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'неизвестная ошибка';
    return { ok: false, error: `Не удалось связаться с Telegram: ${message}` };
  }
}
