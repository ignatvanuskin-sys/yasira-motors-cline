/**
 * Ограничение частоты запросов — раздел 13.
 *
 * Стартовая реализация: in-memory (Map). Этого достаточно для одного
 * серверless-инстанса, но при масштабировании на несколько функций счётчики
 * не общие. Интерфейс специально узкий, чтобы позже подменить реализацию
 * на внешнее хранилище (Redis/Upstash) без изменения кода API-роута.
 *
 * Ключ — IP. Телефон и имя в ключ не входят: PII не хранится.
 */

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Секунд до сброса окна. */
  retryAfter: number;
};

type Bucket = { count: number; resetAt: number };

/** Лимит: 5 заявок за 10 минут с одного IP. */
export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const buckets = new Map<string, Bucket>();

/** Периодическая очистка, чтобы Map не рос бесконечно. */
function sweep(now: number): void {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Проверяет и увеличивает счётчик для ключа.
 * Возвращает ok=false, если лимит превышен.
 */
export function checkRateLimit(key: string, now: number = Date.now()): RateLimitResult {
  sweep(now);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, retryAfter: 0 };
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: RATE_LIMIT_MAX - bucket.count,
    retryAfter: 0,
  };
}

/** Сброс счётчика — используется в тестах. */
export function resetRateLimit(): void {
  buckets.clear();
}
