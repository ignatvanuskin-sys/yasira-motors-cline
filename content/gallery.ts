import type { StaticImageData } from 'next/image';

/**
 * Фотографии цеха и мастеров — раздел 10.7.
 *
 * ⚡ Стоковые фото «случайного гаража» запрещены. Пока реальные фотографии
 * не получены, массив пуст и блок «Цех и мастера» НЕ рендерится вообще
 * (никаких пустых рамок и заглушек «Фото скоро»).
 *
 * КАК ДОБАВИТЬ ФОТО: положить файлы в /public/gallery/ (jpg/webp, от 1200 px
 * по ширине, альбомная ориентация) и заполнить массив. Рекомендуемые кадры:
 *   фасад и въезд, приёмка автомобиля, подъёмники, диагностическое
 *   оборудование, мастера за работой, шиномонтаж.
 * Фото из 2ГИС можно использовать только с разрешения владельца.
 */
export type GalleryPhoto = {
  id: string;
  /** Путь относительно /public. Например: /gallery/exterior.jpg */
  src: string;
  /** Короткая фактологичная подпись без эпитетов. */
  caption: string;
  /** alt на русском; для декоративных — пустая строка. */
  alt: string;
  width: number;
  height: number;
  /** Крупный кадр в мозаике 3+2 на десктопе. */
  featured?: boolean;
  blurDataURL?: string;
};

/** Пусто до получения реальных фотографий от владельца. */
export const gallery: GalleryPhoto[] = [];

export const hasGallery = gallery.length > 0;

/** Статичное превью карты для блока «Контакты» (без iframe при загрузке). */
export const mapPreview: {
  src: string;
  blurDataURL?: string;
  width: number;
  height: number;
} | null = null;

/** Фото фасада/въезда — отдельный акцент в блоке «Контакты» (важно из-за путаницы в адресе). */
export const entrancePhoto: GalleryPhoto | null = null;

/** Фоновое фото для hero. */
export const heroPhoto: {
  src: string;
  alt: string;
  blurDataURL?: string;
  width: number;
  height: number;
  static?: StaticImageData;
} | null = null;
