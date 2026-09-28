/**
 * Node-тесты работают без нативных зависимостей (в отличие от vitest 5,
 * которому нужен нативный биндинг rolldown — см. qa/AUDIT.md).
 * Этот файл — тонкая прослойка: тесты пишутся на API vitest
 * (describe/it/expect), а выполняются встроенным раннером node:test.
 */
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

export { describe, it, beforeEach, afterEach };

/** Минимальная реализация expect, покрывающая используемые в тестах проверки. */
export function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      assert.strictEqual(actual, expected);
    },
    toEqual(expected: unknown) {
      assert.deepStrictEqual(actual, expected);
    },
    toBeTruthy() {
      assert.ok(actual, `ожидалось truthy, получено: ${String(actual)}`);
    },
    toBeFalsy() {
      assert.ok(!actual, `ожидалось falsy, получено: ${String(actual)}`);
    },
    toBeNull() {
      assert.strictEqual(actual, null);
    },
    toBeGreaterThan(n: number) {
      assert.ok((actual as number) > n, `${actual} должно быть > ${n}`);
    },
    toContain(sub: string) {
      assert.ok(
        String(actual).includes(sub),
        `ожидалось, что «${String(actual)}» содержит «${sub}»`,
      );
    },
  };
}
