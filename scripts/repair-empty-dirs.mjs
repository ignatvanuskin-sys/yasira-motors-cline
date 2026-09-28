/**
 * Заполняет ПУСТЫЕ каталоги пакетов в node_modules копиями из вложенных
 * установок того же пакета.
 *
 * Зачем: в этом окружении `npm install` отваливается на построении дерева
 * зависимостей («Invalid Version»), и часть пакетов остаётся созданной, но
 * пустой — без package.json. Node такие каталоги не считает установленными,
 * и падает с MODULE_NOT_FOUND (видел это на object-inspect, из-за чего
 * не запускался ESLint).
 *
 * Скрипт ничего не скачивает: копии берутся из уже распакованных вложенных
 * node_modules. Версии сверяются с package-lock.json там, где это возможно.
 *
 * Запуск: node scripts/repair-empty-dirs.mjs
 */
import { cpSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const nm = join(root, 'node_modules');

/** Читает версию из package.json каталога (null, если каталог пуст). */
function versionOf(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).version ?? null;
  } catch {
    return null;
  }
}

/** Список каталогов верхнего уровня ( unscoped + scoped). */
function topLevel() {
  const out = [];
  for (const entry of readdirSync(nm, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    if (entry.name.startsWith('@')) {
      for (const sub of readdirSync(join(nm, entry.name), { withFileTypes: true })) {
        if (sub.isDirectory()) out.push(`${entry.name}/${sub.name}`);
      }
    } else {
      out.push(entry.name);
    }
  }
  return out;
}

/**
 * Единый обход node_modules: строит карту «имя пакета → список непустых копий».
 * Один обход на все пакеты, иначе на каждый пустой каталог дерево читается заново.
 */
const copiesByName = (() => {
  const map = new Map();
  const add = (name, path) => {
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(path);
  };

  // Обход НЕ рекурсивный: смотрим только node_modules верхнего уровня и один
  // вложенный уровень. Рекурсия по всему дереву роняет node на Windows
  // (STATUS_STACK_BUFFER_OVERRUN), да и глубже здесь искать нечего.
  const levels = [nm];
  for (const entry of readdirSync(nm, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    if (entry.name.startsWith('@')) {
      for (const sub of readdirSync(join(nm, entry.name), { withFileTypes: true })) {
        if (sub.isDirectory()) levels.push(join(nm, entry.name, sub.name));
      }
    } else {
      levels.push(join(nm, entry.name));
    }
  }

  for (const level of levels) {
    const nested = join(level, 'node_modules');
    if (!existsSync(nested)) continue;
    let entries;
    try {
      entries = readdirSync(nested, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      if (entry.name.startsWith('@')) {
        for (const sub of readdirSync(join(nested, entry.name), { withFileTypes: true })) {
          if (!sub.isDirectory()) continue;
          const path = join(nested, entry.name, sub.name);
          if (versionOf(path)) add(`${entry.name}/${sub.name}`, path);
        }
      } else {
        const path = join(nested, entry.name);
        if (versionOf(path)) add(entry.name, path);
      }
    }
  }
  return map;
})();

/** Непустые копии пакета из построенной карты. */
function findCopies(name) {
  return copiesByName.get(name) ?? [];
}

/** Ожидаемая версия из lock-файла, если есть. */
const lock = (() => {
  try {
    return JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
  } catch {
    return { packages: {} };
  }
})();

function lockedVersion(name) {
  return lock.packages?.[`node_modules/${name}`]?.version ?? null;
}

const empty = topLevel().filter((name) => versionOf(join(nm, name)) === null);

console.log(`Пустых каталогов пакетов: ${empty.length}`);

const unresolved = [];
const failed = [];
for (const name of empty) {
  const target = join(nm, name);
  const want = lockedVersion(name);
  const copies = findCopies(name);

  if (copies.length === 0) {
    unresolved.push(name);
    continue;
  }

  // Предпочитаем копию с версией из lock-файла; иначе берём первую.
  const best = (want && copies.find((c) => versionOf(c) === want)) || copies[0];
  try {
    cpSync(best, target, { recursive: true, force: true });
    console.log(`  + ${name}@${versionOf(target)} (из ${copies.length} копий)`);
  } catch (error) {
    failed.push(name);
    console.log(`  ! ${name} — ${error.message}`);
  }
}

if (unresolved.length > 0) {
  console.log(`\nНе нашлось копий (нужно доустановить): ${unresolved.join(', ')}`);
  process.exitCode = 1;
}
if (failed.length > 0) {
  console.log(`\nНе удалось скопировать: ${failed.length}`);
  process.exitCode = 1;
}
if (unresolved.length === 0 && failed.length === 0) {
  console.log('\nВсе пустые каталоги заполнены.');
}
