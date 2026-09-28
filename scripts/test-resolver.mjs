/**
 * Резолвер импортов для node:test.
 * Понимает псевдоним «@/» и подменяет «vitest» на локальную прослойку.
 */
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve as resolvePath } from 'node:path';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const vitestShim = join(projectRoot, 'tests', 'vitest-shim.ts');

/** Расширения, которые нужно пробовать при разрешении пути. */
const EXTENSIONS = ['.ts', '.tsx', '.mts', '.js', '.mjs', '.json'];

/** Возвращает существующий файл, дописывая расширение или index, либо null. */
function resolveFile(basePath) {
  for (const ext of EXTENSIONS) {
    if (existsSync(basePath + ext)) return basePath + ext;
  }
  if (existsSync(basePath) && statSync(basePath).isDirectory()) {
    for (const ext of EXTENSIONS) {
      const indexPath = join(basePath, `index${ext}`);
      if (existsSync(indexPath)) return indexPath;
    }
  }
  return null;
}

export function resolve(specifier, context, nextResolve) {
  if (specifier === 'vitest') {
    return { url: pathToFileURL(vitestShim).href, shortCircuit: true };
  }

  if (specifier.startsWith('@/')) {
    const target = resolvePath(projectRoot, specifier.slice(2));
    const file = resolveFile(target);
    if (file) {
      return { url: pathToFileURL(file).href, shortCircuit: true };
    }
  }

  if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    const parentDir = dirname(fileURLToPath(context.parentURL));
    const file = resolveFile(resolvePath(parentDir, specifier));
    if (file) {
      return { url: pathToFileURL(file).href, shortCircuit: true };
    }
  }

  return nextResolve(specifier, context);
}
