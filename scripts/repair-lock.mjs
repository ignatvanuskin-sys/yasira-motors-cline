/**
 * Восстановление записей package-lock.json, потерявших version/resolved/integrity.
 *
 * Проблема: часть записей в lock-файле осталась «заготовками» ({ "dev": true })
 * после неудачной установки. npm падает на такой файл с «Invalid Version: »,
 * потому что версия пустая. Vercel тоже падал на этапе `npm install`.
 *
 * Скрипт НЕ ходит в сеть: берёт версию из локального node_modules, а
 * integrity и tarball — из кэша npm (_cacache), где лежат метаданные
 * registry-запросов. Нечего восстановить из кэша — помечает запись.
 *
 * Запуск: node scripts/repair-lock.mjs [--write]
 *   без --write только показывает, что будет исправлено.
 */
import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const root = resolve(process.cwd());
const cachePath = process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, 'npm-cache', '_cacache')
  : null;

const cacache = require(require.resolve('cacache', {
  paths: [join(process.env.APPDATA ?? '', 'npm', 'node_modules', 'npm')],
}));

/** semver из поставки npm — для разрешения диапазонов без сети. */
const semver = require(require.resolve('semver', {
  paths: [join(process.env.APPDATA ?? '', 'npm', 'node_modules', 'npm')],
}));

const lockPath = join(root, 'package-lock.json');
const lock = JSON.parse(readFileSync(lockPath, 'utf8'));

/** Имя пакета из пути в lock: node_modules/a/node_modules/b → b */
const pkgName = (key) => key.replace(/^.*node_modules\//, '');

/**
 * Диапазон, который родитель просит на этот пакет.
 * Для node_modules/a/node_modules/b родителем считается node_modules/a.
 */
function parentRange(key, name) {
  const parentKey = key.replace(/node_modules\/[^/]+$/, '').replace(/\/$/, '');
  if (!parentKey) return null;
  const pj = join(root, parentKey, 'package.json');
  if (!existsSync(pj)) return null;
  try {
    const pkg = JSON.parse(readFileSync(pj, 'utf8'));
    for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
      const range = pkg[field]?.[name];
      if (range) return range;
    }
  } catch {
    /* повреждённый package.json — диапазон неизвестен */
  }
  return null;
}

/** Локальная версия пакета. */
function localVersion(key) {
  const pj = join(root, key, 'package.json');
  if (!existsSync(pj)) return null;
  try {
    return JSON.parse(readFileSync(pj, 'utf8')).version ?? null;
  } catch {
    return null;
  }
}

/** Packument пакета из кэша npm: { versions, 'dist-tags' }. */
async function packument(name) {
  if (!cachePath) return null;
  const url = `make-fetch-happen:request-cache:https://registry.npmjs.org/${name.replace('/', '%2f')}`;
  try {
    const { data } = await cacache.get(cachePath, url);
    return JSON.parse(data.toString());
  } catch {
    return null;
  }
}

/** Версия пакета: локальная, иначе максимум по диапазону родителя. */
function pickVersion(doc, wanted, range) {
  if (!doc || !doc.versions) return null;
  if (wanted && doc.versions[wanted]) return wanted;
  if (!range) return null;
  return semver.maxSatisfying(Object.keys(doc.versions), range);
}

/** Есть ли запись для пакета при Node-резолвинге вверх по дереву. */
function resolveEntry(fromKey, name) {
  let base = fromKey;
  for (;;) {
    const candidate = `${base ? `${base}/` : ''}node_modules/${name}`;
    if (lock.packages[candidate]) return candidate;
    if (!base) return null;
    const idx = base.lastIndexOf('/node_modules/');
    if (idx < 0) {
      if (base.startsWith('node_modules/')) {
        base = '';
        continue;
      }
      return null;
    }
    base = base.slice(0, idx);
  }
}

/** Запись, которой не хватает версии или ссылки на tarball. */
function isBroken(key, value) {
  if (key === '') return false;
  if (!value || typeof value.version !== 'string' || value.version === '') return true;
  // link:/file: — локальные пакеты, у них resolved не нужен.
  if (/^(link:|file:)/.test(value.resolved ?? '')) return false;
  return !value.resolved || !value.integrity;
}

const broken = Object.entries(lock.packages).filter(([key, value]) => isBroken(key, value));

console.log(`Записей без версии или без ссылки на tarball: ${broken.length}\n`);

const results = [];
for (const [key, value] of broken) {
  const name = pkgName(key);
  const version = value?.version || localVersion(key);
  const range = parentRange(key, name);
  const doc = await packument(name);
  const resolvedVersion = pickVersion(doc, version, range);
  const dist = resolvedVersion ? doc.versions[resolvedVersion].dist : null;

  results.push({
    key,
    name,
    version: resolvedVersion,
    local: version,
    integrity: dist?.integrity ?? null,
    tarball: dist?.tarball ?? null,
    meta: resolvedVersion ? doc.versions[resolvedVersion] : null,
    fromCache: Boolean(dist && dist.integrity && dist.tarball),
    original: value,
  });

  const ok = results.at(-1).fromCache;
  console.log(
    `${ok ? '+' : '!'} ${name}@${resolvedVersion ?? version ?? '???'}` +
      (ok ? '' : '  ← нет в кэше'),
  );
}

const fixable = results.filter((r) => r.fromCache);
const unresolved = results.filter((r) => !r.fromCache);

if (unresolved.length > 0) {
  console.log(`\nНе восстановятся из кэша: ${unresolved.length}`);
  for (const r of unresolved) console.log(`  - ${r.name}`);
}

if (!process.argv.includes('--write')) {
  console.log(`\nИсправить можно ${fixable.length}. Повторите с --write.`);
  process.exit(unresolved.length > 0 ? 1 : 0);
}

/** Собирает запись пакета по образцу npm (метаданные — из packument). */
function buildEntry(prev, meta, version, tarball, integrity) {
  const entry = { version, resolved: tarball, integrity };
  if (prev.dev) entry.dev = true;
  if (prev.optional) entry.optional = true;
  if (prev.peer) entry.peer = true;
  if (meta.license) entry.license = meta.license;
  if (meta.hasInstallScript) entry.hasInstallScript = true;
  if (meta.bin) entry.bin = meta.bin;
  for (const field of [
    'dependencies',
    'optionalDependencies',
    'peerDependencies',
    'peerDependenciesMeta',
  ]) {
    const value = meta[field];
    if (value && Object.keys(value).length > 0) entry[field] = value;
  }
  if (meta.engines) entry.engines = meta.engines;
  if (meta.os) entry.os = meta.os;
  if (meta.cpu) entry.cpu = meta.cpu;
  if (meta.funding) entry.funding = meta.funding;
  // Прежние поля, которых нет в packument, не теряем.
  return { ...prev, ...entry };
}

for (const r of fixable) {
  lock.packages[r.key] = buildEntry(
    lock.packages[r.key] ?? {},
    r.meta ?? {},
    r.version,
    r.tarball,
    r.integrity,
  );
}

// Фаза 2: зависимости, для которых в дереве вообще нет записи.
// npm без сети их не достроит, поэтому добавляем из локальной установки.
const missing = new Map();
for (const [key, value] of Object.entries(lock.packages)) {
  if (!value?.dependencies) continue;
  for (const [dep, range] of Object.entries(value.dependencies)) {
    if (resolveEntry(key, dep)) continue;
    if (!missing.has(dep)) missing.set(dep, { range, dev: value.dev === true });
  }
}

console.log(`\nЗависимостей без записи в дереве: ${missing.size}`);

let added = 0;
const stillMissing = [];
for (const [name, info] of missing) {
  const target = `node_modules/${name}`;
  const local = localVersion(target);
  const doc = await packument(name);
  const version = pickVersion(doc, local, info.range);
  const dist = version ? doc.versions[version].dist : null;

  if (!dist?.integrity || !dist.tarball) {
    stillMissing.push(`${name}@${info.range}`);
    continue;
  }

  lock.packages[target] = buildEntry(
    info.dev ? { dev: true } : {},
    doc.versions[version],
    version,
    dist.tarball,
    dist.integrity,
  );
  added += 1;
  console.log(`  + ${name}@${version} (требовался ${info.range})`);
}

if (stillMissing.length > 0) {
  console.log(`\nНе удалось добавить: ${stillMissing.length}`);
  for (const n of stillMissing) console.log(`  - ${n}`);
}

writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
console.log(`\nИсправлено записей: ${fixable.length}, добавлено пакетов: ${added}.`);
if (unresolved.length > 0) process.exitCode = 1;
