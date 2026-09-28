import { NextResponse } from 'next/server';
import { validateLead } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendLeadToTelegram } from '@/lib/telegram';
import { formatDateTimeAqtau } from '@/lib/hours';
import { getServiceById } from '@/content/services';
import { getTimeSlots } from '@/lib/hours';
import { MIN_FILL_TIME_MS } from '@/lib/validation-constants';

export const runtime = 'nodejs';
/** Динамический рендеринг: заявка всегда уходит в свежем серверном окружении. */
export const dynamic = 'force-dynamic';

/** IP клиента для лимита запросов. */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * POST /api/lead — раздел 13.
 *  - 400 — ошибка валидации;
 *  - 429 — превышен лимит запросов с одного IP;
 *  - 502 — не удалось доставить заявку в Telegram (заявка не теряется тихо:
 *    клиент получает код ошибки и предлагает запасной путь через WhatsApp).
 */
export async function POST(request: Request) {
  // 1. Лимит запросов: 5 за 10 минут с одного IP.
  const limit = checkRateLimit(getClientIp(request));
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, code: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  // 2. Разбор тела.
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: 'bad_request' }, { status: 400 });
  }

  // 3. Honeypot: скрытое поле company должно остаться пустым.
  const raw = payload as { company?: unknown; fillTimeMs?: unknown } | null;
  if (raw && typeof raw.company === 'string' && raw.company.length > 0) {
    // Бот: отвечаем «успехом», но ничего не отправляем.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 4. Минимальное время заполнения — отсекаем мгновенную отправку.
  if (typeof raw?.fillTimeMs === 'number' && raw.fillTimeMs < MIN_FILL_TIME_MS) {
    return NextResponse.json({ ok: false, code: 'too_fast' }, { status: 400 });
  }

  // 5. Валидация той же схемой, что и на клиенте.
  const result = validateLead(payload);
  if (!result.success) {
    return NextResponse.json(
      { ok: false, code: 'validation', fields: result.fieldErrors },
      { status: 400 },
    );
  }

  // 6. Доставка владельцу. Телефон и имя в логи не пишутся.
  const lead = result.data;
  const serviceNames = lead.services
    .map((id) => getServiceById(id)?.title ?? id)
    .join(', ');
  const slot = getTimeSlots().find((s) => s.id === lead.timeSlot);
  const when = [lead.date, slot?.label].filter(Boolean).join(', ');

  const delivery = await sendLeadToTelegram(
    {
      services: [serviceNames],
      car: lead.year ? `${lead.car}, ${lead.year}` : lead.car,
      when,
      name: lead.name,
      phone: lead.phone,
      comment: lead.symptom || lead.comment,
      source: lead.source || 'unknown',
      locale: lead.locale,
    },
    formatDateTimeAqtau(new Date()),
  );

  if (!delivery.ok) {
    // 502: заявка не доставлена. Клиент покажет запасной путь через WhatsApp.
    return NextResponse.json({ ok: false, code: 'delivery_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
