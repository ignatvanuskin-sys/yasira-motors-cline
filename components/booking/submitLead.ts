import type { BookingState } from './BookingProvider';
import { trackEvent } from '@/lib/analytics';

type SubmitResult = { ok: true } | { ok: false; message: string };

/**
 * Отправка заявки на POST /api/lead — раздел 13.
 *  - таймаут 10 секунд;
 *  - honeypot и минимальное время заполнения передаются на сервер;
 *  - при ошибке данные НЕ теряются: возврат ok:false, форма остаётся заполненной,
 *    пользователю показывается запасной путь через WhatsApp.
 *
 * Телефон и имя НЕ логируются и не отправляются в аналитику.
 */
export async function submitLead(
  payload: BookingState & { day: string; fillTimeMs: number; timeoutMs: number },
): Promise<SubmitResult> {
  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        services: payload.services,
        symptom: payload.symptom,
        car: payload.car,
        year: payload.year,
        timeSlot: payload.timeSlot,
        date: payload.day,
        name: payload.name,
        phone: payload.phone,
        comment: payload.symptom,
        source: payload.source,
        locale: document.documentElement.lang === 'kk' ? 'kk' : 'ru',
        company: '',
        fillTimeMs: payload.fillTimeMs,
      }),
      signal: AbortSignal.timeout(payload.timeoutMs),
    });

    if (response.ok) {
      trackEvent('booking_submit_success', { source: payload.source });
      return { ok: true };
    }

    trackEvent('booking_submit_error', { source: payload.source, reason: String(response.status) });
    return { ok: false, message: await readErrorMessage(response) };
  } catch {
    // Сетевая ошибка или таймаут.
    trackEvent('booking_submit_error', { source: payload.source, reason: 'network' });
    return { ok: false, message: 'network' };
  }
}

/** Тексты ошибок сервера; 'network' — если ответа не было. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { code?: string };
    return data.code ?? 'unknown';
  } catch {
    return 'unknown';
  }
}
