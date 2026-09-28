/**
 * Регистрация резолвера для встроенного тест-раннера Node:
 *  - псевдоним «@/» → корень проекта (как paths в tsconfig.json);
 *  - «vitest» → tests/vitest-shim.ts (нативный биндинг rolldown
 *    в этом окружении не загружается, см. qa/AUDIT.md).
 *
 * Запуск: npm test
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./test-resolver.mjs', pathToFileURL('./scripts/'));
