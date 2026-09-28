import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSiteUrl, FALLBACK_SITE_URL } from '@/lib/siteUrl';

/**
 * Регрессия: Vercel отдавал NEXT_PUBLIC_SITE_URL пустой строкой.
 * `??` на пустой строке не срабатывает, и `new URL('')` ронял сборку
 * с ERR_INVALID_URL на этапе сбора данных страниц.
 */
describe('getSiteUrl', () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it('пустая строка не ломает сборку', () => {
    process.env.NEXT_PUBLIC_SITE_URL = '';
    expect(getSiteUrl()).toBe(FALLBACK_SITE_URL);
  });

  it('строка из пробелов считается пустой', () => {
    process.env.NEXT_PUBLIC_SITE_URL = '   ';
    expect(getSiteUrl()).toBe(FALLBACK_SITE_URL);
  });

  it('незаданная переменная даёт запасной адрес', () => {
    expect(getSiteUrl()).toBe(FALLBACK_SITE_URL);
  });

  it('мусор вместо URL не ломает сборку', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'не url';
    expect(getSiteUrl()).toBe(FALLBACK_SITE_URL);
  });

  it('не-http протокол отбрасывается', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'ftp://example.com';
    expect(getSiteUrl()).toBe(FALLBACK_SITE_URL);
  });

  it('заданный адрес используется без завершающего слэша', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/';
    expect(getSiteUrl()).toBe('https://example.com');
  });

  it('адрес не трогается, если слэша не было', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    expect(getSiteUrl()).toBe('https://example.com');
  });
});
