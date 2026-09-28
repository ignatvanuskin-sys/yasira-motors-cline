/**
 * Генерация PNG-иконок из SVG-монограммы (раздел 18).
 * Запуск: node scripts/generate-icons.mjs
 * Результат: public/icons/icon-{32,180,192,512}.png и apple-icon.png
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'public', 'icons');

/** Монограмма «YM»: янтарь на графите (совпадает с app/icon.svg). */
const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <rect width="64" height="64" rx="14" fill="#0D0F12"/>
  <rect x="6" y="6" width="52" height="52" rx="10" fill="none" stroke="#262B31" stroke-width="2"/>
  <text x="32" y="31" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#F2F3F4" text-anchor="middle">YM</text>
  <rect x="17" y="38" width="30" height="5" rx="2.5" fill="#F2A900"/>
</svg>`;

await mkdir(outDir, { recursive: true });

for (const size of [32, 180, 192, 512]) {
  const png = await sharp(Buffer.from(svg(size))).resize(size, size).png().toBuffer();
  await writeFile(join(outDir, `icon-${size}.png`), png);
  console.log(`icon-${size}.png (${png.length} байт)`);
}

// apple-icon.png дублирует 180px для iOS.
const apple = await sharp(Buffer.from(svg(180))).resize(180, 180).png().toBuffer();
await writeFile(join(root, 'public', 'apple-icon.png'), apple);
console.log(`apple-icon.png (${apple.length} байт)`);
