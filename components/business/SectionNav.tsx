'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Lead-page section links with an underline that follows the section in view. */
export function SectionNav({ items }: { items: readonly (readonly [string, string])[] }) {
  const [active, setActive] = useState(items[0]?.[0]);

  useEffect(() => {
    const els = items.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A band across the upper third of the screen decides which section is "current".
      { rootMargin: '-20% 0px -65% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sections" className="flex-1 min-w-0 overflow-x-auto">
      <ul className="flex items-center gap-0.5 text-sm">
        {items.map(([id, label]) => {
          const on = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={on ? 'location' : undefined}
                onClick={() => setActive(id)}
                className={cn('relative inline-flex items-center h-11 px-2.5 whitespace-nowrap transition-colors duration-200', on ? 'text-ink' : 'text-walnut hover:text-ink')}
              >
                {label}
                {on && (
                  <motion.span
                    layoutId="section-underline"
                    aria-hidden
                    className="absolute left-2.5 right-2.5 bottom-2 h-[2px] rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
