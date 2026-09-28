/**
 * Восстановление транзитивных пакетов, которые npm не смог доставить
 * из-за ошибки построения дерева ("Invalid Version").
 * Скрипт находит отсутствующие node_modules/<pkg> и скачивает их напрямую
 * из реестра по версии из package-lock.json.
 *
 * Запуск: node scripts/restore-deps.mjs
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(join(root, 'package.json'));
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));

/** Все записи node_modules/* из lock-файла. */
const entries = Object.entries(lock.packages).filter(
  ([key, value]) => key.startsWith('node_modules/') && value && value.resolved,
);

/** Платформенные пакеты, не нужные на win32-x64. */
const FOREIGN = [
  /-(darwin|freebsd|linux|android|sunos|wasm32|webcontainers)/,
  /-(arm|arm64|ia32|ppc64|riscv64|s390x|x64)(-|v)/,
  /win32-(arm64|ia32)$/,
  /libvips-.*(darwin|linux|freebsd)/,
];

const isForeign = (name) => FOREIGN.some((re) => re.test(name));

const missing = entries.filter(([key, meta]) => {
  if (existsSync(join(root, key, 'package.json'))) return false;
  const name = key.replace(/^.*node_modules\//, '');
  console.log(`  ? ${name}@${meta.version}`);
  return !isForeign(name);
});
console.log(`Всего пакетов: ${entries.length}, отсутствует: ${missing.length}, восстановим: ${missing.length}`);

for (const [key, meta] of missing) {
  const name = key.replace(/^.*node_modules\//, '');
  const version = meta.version;
  const target = join(root, key);
  const short = name.includes('/') ? name.split('/')[1] : name;
  const tarball = `https://registry.npmjs.org/${name}/-/${short}-${version}.tgz`;
  const work = join(tmpdir(), `dep-${short}-${version}`);

  try {
    execFileSync('cmd', ['/c', 'rmdir', '/s', '/q', work], { stdio: 'ignore' });
  } catch {
    /* каталога нет — это нормально */
  }
  mkdirSync(work, { recursive: true });

  const tgz = join(work, 'p.tgz');
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Invoke-WebRequest -Uri '${tarball}' -OutFile '${tgz}' -UseBasicParsing`,
    ],
    { stdio: 'ignore' },
  );

  const unpacked = join(work, 'x');
  mkdirSync(unpacked, { recursive: true });
  execFileSync('tar', ['-xzf', tgz, '-C', unpacked]);

  mkdirSync(target, { recursive: true });
  execFileSync('cmd', ['/c', 'xcopy', '/e', '/i', '/y', join(unpacked, 'package'), target], {
    stdio: 'ignore',
  });

  console.log(`  + ${name}@${version}`);
}

console.log('Готово.');
void require;
void writeFileSync;
