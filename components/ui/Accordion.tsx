'use client';

import { Plus } from 'lucide-react';
import { useId, useState } from 'react';

/**
 * Аккордеон FAQ — раздел 10.10 и 20.
 * button + aria-expanded + aria-controls, анимация высоты 240 мс,
 * можно открыть несколько пунктов сразу.
 */
type AccordionProps = {
  items: { id: string; question: string; answer: string }[];
};

export function Accordion({ items }: AccordionProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const baseId = useId();

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="divide-y divide-line-light border-y border-line-light">
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const buttonId = `${baseId}-btn-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full min-h-14 items-center justify-between gap-4 py-4 text-left text-base font-semibold text-text transition-colors duration-160 hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span>{item.question}</span>
                <Plus
                  className={`size-5 shrink-0 text-muted transition-transform duration-240 ease-[cubic-bezier(.2,.7,.2,1)] ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-5"
            >
              <p className="max-w-[68ch] text-base text-muted">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
