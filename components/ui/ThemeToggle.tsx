'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Theme = 'light' | 'dark';

/** Reads the theme set by the inline script in layout.tsx (stored choice, else system). */
export function useTheme(): [Theme | null, (t: Theme, origin?: { x: number; y: number }) => void] {
  const [theme, setThemeState] = useState<Theme | null>(null);
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setThemeState(el.dataset.theme === 'dark' ? 'dark' : 'light');
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  const setTheme = (t: Theme, origin?: { x: number; y: number }) => {
    const el = document.documentElement;
    const apply = () => {
      el.dataset.theme = t;
      try {
        localStorage.setItem('theme', t);
      } catch {}
    };
    type VT = { ready: Promise<void>; finished: Promise<void> };
    const start = (document as Document & { startViewTransition?: (cb: () => void) => VT }).startViewTransition;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!start || reduce || !origin) {
      el.classList.add('theme-switching');
      apply();
      window.setTimeout(() => el.classList.remove('theme-switching'), 250);
      return;
    }
    // Circular wipe of the new theme, growing from the toggle button.
    el.classList.add('vt-theme');
    const vt = start.call(document, apply);
    const r = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
    vt.ready
      .then(() =>
        el.animate(
          { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${r}px at ${origin.x}px ${origin.y}px)`] },
          { duration: 460, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
        ),
      )
      .catch(() => {});
    vt.finished.finally(() => el.classList.remove('vt-theme'));
  };
  return [theme, setTheme];
}

/** Light / dark switch. Shows the theme you'd switch to. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTheme(dark ? 'light' : 'dark', { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'size-11 shrink-0 grid place-items-center rounded-ctl text-walnut hover:text-ink hover:bg-sunk transition-colors',
        className,
      )}
    >
      {/* Render nothing until mounted so server and client agree. */}
      {theme === null ? <span className="size-[18px]" /> : dark ? <Sun aria-hidden className="size-[18px] stroke-[1.5]" /> : <Moon aria-hidden className="size-[18px] stroke-[1.5]" />}
    </button>
  );
}
