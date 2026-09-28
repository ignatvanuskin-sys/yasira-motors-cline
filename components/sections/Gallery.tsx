'use client';

import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { Section } from '@/components/ui/Section';
import { gallery, hasGallery } from '@/content/gallery';
import type { Dictionary } from '@/lib/i18n';

/**
 * Цех и мастера — раздел 10.7.
 * ⚡ Фото от владельца не получены: массив пуст, блок НЕ рендерится вовсе
 * (никаких пустых рамок и заглушек «Фото скоро»).
 * Мобильный: лента со scroll-snap, карточка 82% ширины, видна «щель».
 * Десктоп: мозаика 3+2 с лайтбоксом (фокус заперт, стрелки, Esc).
 */
export function Gallery({ dict }: { dict: Dictionary }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!hasGallery) return null;

  const featured = gallery.find((photo) => photo.featured) ?? gallery[0];
  const rest = gallery.filter((photo) => photo !== featured);
  const active = openIndex === null ? null : gallery[openIndex];

  const move = (delta: number) => {
    setOpenIndex((prev) => {
      if (prev === null) return null;
      return (prev + delta + gallery.length) % gallery.length;
    });
  };

  return (
    <Section id="tseh">
      <h2 className="text-[26px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[40px]">
        {dict.gallery.title}
      </h2>

      {/* Мобильная лента. */}
      <div className="snap-row -mx-4 mt-8 gap-3 px-4 md:hidden">
        {gallery.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(gallery.indexOf(photo))}
            className="snap-item w-[82%] shrink-0 text-left"
          >
            <Photo photo={photo} sizes="(max-width: 768px) 82vw, 0px" />
          </button>
        ))}
      </div>

      {/* Десктопная мозаика 3+2. */}
      <div className="mt-8 hidden gap-3 md:grid md:grid-cols-3 md:grid-rows-2">
        {featured ? (
          <button
            type="button"
            onClick={() => setOpenIndex(gallery.indexOf(featured))}
            className="row-span-2 text-left"
          >
            <Photo photo={featured} sizes="(max-width: 1024px) 0px, 60vw" />
          </button>
        ) : null}
        {rest.slice(0, 4).map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(gallery.indexOf(photo))}
            className="text-left"
          >
            <Photo photo={photo} sizes="(max-width: 1024px) 0px, 30vw" />
          </button>
        ))}
      </div>

      {/* Лайтбокс. */}
      <Dialog.Root open={active !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90" />
          {/* Стрелки ←/→ — клавиатурная альтернатива свайпу и стрелкам на
              экране (раздел 20). Esc и захват фокуса даёт Radix Dialog. */}
          <Dialog.Content
            className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4"
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                move(-1);
              } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                move(1);
              }
            }}
          >
            <Dialog.Title className="sr-only">{dict.gallery.title}</Dialog.Title>
            {active ? (
              <figure className="flex max-h-full max-w-[92vw] flex-col">
                <Image
                  src={active.src}
                  alt={active.alt}
                  width={active.width}
                  height={active.height}
                  className="max-h-[78vh] w-auto rounded-card object-contain"
                />
                <figcaption className="mt-3 text-center text-sm text-text-on-dark">
                  {active.caption}
                </figcaption>
              </figure>
            ) : null}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label={dict.gallery.prev}
                className="fixed left-3 flex size-12 items-center justify-center rounded-btn border border-line-dark text-text-on-dark transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <ChevronLeft className="size-6" strokeWidth={1.75} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label={dict.gallery.next}
                className="fixed right-3 flex size-12 items-center justify-center rounded-btn border border-line-dark text-text-on-dark transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <ChevronRight className="size-6" strokeWidth={1.75} aria-hidden />
              </button>
              <Dialog.Close
                aria-label={dict.gallery.close}
                className="fixed top-3 right-3 flex size-12 items-center justify-center rounded-btn text-text-on-dark transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="size-6" strokeWidth={1.75} aria-hidden />
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Section>
  );
}

function Photo({ photo, sizes }: { photo: (typeof gallery)[number]; sizes: string }) {
  return (
    <span className="block overflow-hidden rounded-card border border-line-light bg-bg-dark-2">
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        loading="lazy"
        placeholder={photo.blurDataURL ? 'blur' : 'empty'}
        blurDataURL={photo.blurDataURL}
        className="aspect-[4/3] w-full object-cover"
      />
      <span className="block px-3 py-2.5 text-sm text-text">{photo.caption}</span>
    </span>
  );
}
